/**
 * Round-trip + ambiguity tests for the multi-sheet importer / exporter.
 *
 * We deliberately mock the API client so these stay pure unit tests — no
 * HTTP, no Vite dev server needed. The bulk-create / relations/bulk
 * endpoints are also smoke-tested through this spec.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

import type { Card, CardType, Relation, RelationType } from "@/types";

import {
  buildExportWorkbook,
  encodePathSegment as exportEncode,
} from "./excelExport";

vi.mock("@/api/client", () => ({
  api: {
    get: vi.fn(async () => [] as unknown),
    post: vi.fn(async () => ({ results: [] } as unknown)),
    patch: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  },
}));

// Late import so the mocks above are in place.
import { api } from "@/api/client";
import {
  parseWorkbookSheets,
  validateMultiSheet,
  executeMultiSheetImport,
} from "./excelImport";

const APP_TYPE: CardType = {
  key: "Application",
  label: "Application",
  icon: "apps",
  color: "#000",
  has_hierarchy: true,
  has_successors: false,
  fields_schema: [],
  built_in: true,
  is_hidden: false,
  sort_order: 0,
};
const ITC_TYPE: CardType = {
  key: "ITComponent",
  label: "IT Component",
  icon: "memory",
  color: "#000",
  has_hierarchy: false,
  has_successors: false,
  fields_schema: [],
  built_in: true,
  is_hidden: false,
  sort_order: 1,
};

const DEPENDS_ON_TYPE: RelationType = {
  key: "depends_on",
  label: "depends on",
  reverse_label: "supports",
  source_type_key: "Application",
  target_type_key: "ITComponent",
  cardinality: "n:m",
  attributes_schema: [],
  built_in: true,
  is_hidden: false,
  sort_order: 0,
  source_visible: true,
  source_mandatory: false,
  target_visible: true,
  target_mandatory: false,
};

function makeCard(partial: Partial<Card> & { id: string; type: string; name: string }): Card {
  return {
    status: "ACTIVE",
    approval_status: "DRAFT",
    data_quality: 0,
    tags: [],
    stakeholders: [],
    ...partial,
  };
}

function buildWorkbook(rows: Record<string, unknown>[], sheetName: string): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("encodePathSegment", () => {
  it("escapes backslash and slash so card names round-trip", () => {
    expect(exportEncode("A/B")).toBe("A\\/B");
    expect(exportEncode("A\\B")).toBe("A\\\\B");
    expect(exportEncode("Plain")).toBe("Plain");
  });
});

describe("parseWorkbookSheets", () => {
  it("recognises card-type sheets, _Meta, and Relations", () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ name: "App", type: "Application" }]),
      "Application",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        {
          action: "upsert",
          relation_type: "depends_on",
          source_ref: "App",
          target_ref: "DB",
        },
      ]),
      "Relations",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ key: "format_version", value: "2" }]),
      "_Meta",
    );
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const parsed = parseWorkbookSheets(buf, [APP_TYPE, ITC_TYPE]);
    expect(parsed.sheets).toHaveLength(1);
    expect(parsed.sheets[0].sheet).toBe("Application");
    expect(parsed.sheets[0].typeHint).toBe("Application");
    expect(parsed.relationRows).toHaveLength(1);
    expect(parsed.meta?.formatVersion).toBe("2");
  });
});

/**
 * Build a `/cards/resolve-refs` mock implementation that resolves any ref
 * against the provided `Card` list. Mirrors what the backend
 * `CardResolver` would do: bare names match when unique within a type,
 * names that appear in multiple cards come back ambiguous. We use this so
 * the existing tests don't have to spell out the full server-shape result
 * for every payload.
 */
function buildResolveRefsMock(cards: Card[]) {
  return async (
    url: string,
    body: unknown,
  ): Promise<unknown> => {
    if (url !== "/cards/resolve-refs") return {};
    const refs = (body as {
      refs: { row: number; column: string; type: string; ref: string }[];
    }).refs;
    return {
      results: refs.map(({ row, column, type, ref }) => {
        const candidates = cards.filter(
          (c) =>
            c.type === type && c.name.trim().toLowerCase() === ref.trim().toLowerCase(),
        );
        if (candidates.length === 1) {
          return { row, column, status: "resolved", id: candidates[0].id };
        }
        if (candidates.length > 1) {
          return {
            row,
            column,
            status: "ambiguous",
            candidates: candidates.map((c) => ({ id: c.id, path: c.name })),
          };
        }
        return { row, column, status: "missing" };
      }),
    };
  };
}

describe("validateMultiSheet", () => {
  const postMock = api.post as unknown as ReturnType<typeof vi.fn>;
  const getMock = api.get as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
  });

  it("resolves a relation target by name when unambiguous", async () => {
    const existing: Card[] = [
      makeCard({ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP" }),
      makeCard({ id: "22222222-2222-2222-2222-222222222222", type: "ITComponent", name: "DB" }),
    ];
    postMock.mockImplementation(buildResolveRefsMock(existing));
    const wb = buildWorkbook(
      [{ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP", "rel:depends_on": "DB" }],
      "Application",
    );
    const parsed = parseWorkbookSheets(wb, [APP_TYPE, ITC_TYPE]);
    const report = await validateMultiSheet(
      parsed,
      existing,
      [APP_TYPE, ITC_TYPE],
      [DEPENDS_ON_TYPE],
      [],
    );
    expect(report.errors).toEqual([]);
    expect(report.relationOps).toHaveLength(1);
    expect(report.relationOps[0]).toMatchObject({
      action: "upsert",
      relationType: "depends_on",
      sourceRef: { kind: "id", id: "11111111-1111-1111-1111-111111111111" },
      targetRef: { kind: "id", id: "22222222-2222-2222-2222-222222222222" },
    });
  });

  it("resolves cross-type targets that aren't in the filtered grid view", async () => {
    // Symmetric counterpart to the export-side bug: importer used to match
    // refs against `existingCards` (= the filtered Inventory page), so a
    // workbook re-imported into a single-type filter couldn't see targets
    // of other types. Now we route through the backend resolver instead.
    const filteredView: Card[] = [
      makeCard({ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP" }),
      // ITComponent "DB" is in the DB but NOT in `existingCards`.
    ];
    const dbView: Card[] = [
      ...filteredView,
      makeCard({ id: "22222222-2222-2222-2222-222222222222", type: "ITComponent", name: "DB" }),
    ];
    postMock.mockImplementation(buildResolveRefsMock(dbView));
    const wb = buildWorkbook(
      [{ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP", "rel:depends_on": "DB" }],
      "Application",
    );
    const parsed = parseWorkbookSheets(wb, [APP_TYPE, ITC_TYPE]);
    const report = await validateMultiSheet(
      parsed,
      filteredView,
      [APP_TYPE, ITC_TYPE],
      [DEPENDS_ON_TYPE],
      [],
    );
    expect(report.errors).toEqual([]);
    expect(report.relationOps).toHaveLength(1);
    expect(report.relationOps[0].targetRef).toEqual({
      kind: "id",
      id: "22222222-2222-2222-2222-222222222222",
    });
  });

  it("flags an ambiguous relation target", async () => {
    const existing: Card[] = [
      makeCard({ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP" }),
      makeCard({ id: "22222222-2222-2222-2222-222222222222", type: "ITComponent", name: "DB" }),
      makeCard({ id: "33333333-3333-3333-3333-333333333333", type: "ITComponent", name: "DB" }),
    ];
    postMock.mockImplementation(buildResolveRefsMock(existing));
    const wb = buildWorkbook(
      [{ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP", "rel:depends_on": "DB" }],
      "Application",
    );
    const parsed = parseWorkbookSheets(wb, [APP_TYPE, ITC_TYPE]);
    const report = await validateMultiSheet(
      parsed,
      existing,
      [APP_TYPE, ITC_TYPE],
      [DEPENDS_ON_TYPE],
      [],
    );
    expect(report.errors.length).toBeGreaterThanOrEqual(1);
    expect(report.errors[0].message).toMatch(/ambiguous|DB/i);
    expect(report.relationOps).toHaveLength(0);
  });

  it("emits a delete op when an inline cell drops a previously-related target", async () => {
    const existing: Card[] = [
      makeCard({ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP" }),
      makeCard({ id: "22222222-2222-2222-2222-222222222222", type: "ITComponent", name: "DB" }),
      makeCard({ id: "33333333-3333-3333-3333-333333333333", type: "ITComponent", name: "Cache" }),
    ];
    const existingRels: Relation[] = [
      { id: "r1", type: "depends_on", source_id: "11111111-1111-1111-1111-111111111111", target_id: "22222222-2222-2222-2222-222222222222" },
      { id: "r2", type: "depends_on", source_id: "11111111-1111-1111-1111-111111111111", target_id: "33333333-3333-3333-3333-333333333333" },
    ];
    postMock.mockImplementation(buildResolveRefsMock(existing));
    const wb = buildWorkbook(
      // Cell lists only DB — Cache should be dropped.
      [{ id: "11111111-1111-1111-1111-111111111111", type: "Application", name: "ERP", "rel:depends_on": "DB" }],
      "Application",
    );
    const parsed = parseWorkbookSheets(wb, [APP_TYPE, ITC_TYPE]);
    const report = await validateMultiSheet(
      parsed,
      existing,
      [APP_TYPE, ITC_TYPE],
      [DEPENDS_ON_TYPE],
      existingRels,
    );
    expect(report.errors).toEqual([]);
    const deletes = report.relationOps.filter((o) => o.action === "delete");
    const upserts = report.relationOps.filter((o) => o.action === "upsert");
    expect(deletes).toHaveLength(1);
    expect(deletes[0].targetRef).toEqual({ kind: "id", id: "33333333-3333-3333-3333-333333333333" });
    expect(upserts).toHaveLength(1);
  });
});

describe("executeMultiSheetImport", () => {
  const postMock = api.post as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    postMock.mockReset();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses bulk-create for new cards and relations/bulk for relation ops", async () => {
    postMock.mockImplementation(async (url: string, body: unknown) => {
      if (url === "/cards/bulk-create") {
        const cards = (body as { cards: { row_index: number; name: string }[] }).cards;
        return {
          results: cards.map((c) => ({
            row_index: c.row_index,
            status: "created",
            id: `new-${c.row_index}`,
          })),
          created: cards.length,
          failed: 0,
        };
      }
      if (url === "/relations/bulk") {
        const ops = (body as { operations: { row_index: number }[] }).operations;
        return {
          results: ops.map((o) => ({
            row_index: o.row_index,
            status: "upserted",
            relation_id: `rel-${o.row_index}`,
          })),
          upserted: ops.length,
          deleted: 0,
          failed: 0,
        };
      }
      return {};
    });

    const result = await executeMultiSheetImport({
      errors: [],
      warnings: [],
      creates: [
        {
          rowIndex: 2,
          type: "Application",
          data: { type: "Application", name: "NewApp" },
          ownPathKey: "Application|newapp",
        },
      ],
      updates: [],
      skipped: 0,
      totalRows: 1,
      relationOps: [
        {
          rowIndex: 2,
          sheet: "Application",
          action: "upsert",
          relationType: "depends_on",
          sourceRef: { kind: "pathKey", pathKey: "Application|newapp", type: "Application" },
          targetRef: { kind: "id", id: "22222222-2222-2222-2222-222222222222" },
        },
      ],
    });

    expect(result.created).toBe(1);
    expect(result.relationsUpserted).toBe(1);
    expect(result.failed).toBe(0);
    // The pathKey source ref must have been materialised into the new uuid.
    const bulkRelCall = postMock.mock.calls.find((c) => c[0] === "/relations/bulk");
    expect(bulkRelCall).toBeTruthy();
    const operations = (bulkRelCall![1] as { operations: { source: { id?: string } }[] }).operations;
    expect(operations[0].source.id).toBe("new-2");
  });
});

describe("buildExportWorkbook", () => {
  const getMock = api.get as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMock.mockReset();
  });

  /**
   * Helper: read a sheet's data rows back as `Record<string, unknown>[]`.
   * Mirrors `XLSX.utils.sheet_to_json` with default options.
   */
  function rowsOf(wb: XLSX.WorkBook, sheet: string): Record<string, unknown>[] {
    const ws = wb.Sheets[sheet];
    if (!ws) return [];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  }

  it("emits a rel:<key> cell for a target that's not in the exported card set", async () => {
    // Filtered single-type export — only the Application is in `cards`, but
    // the relation's target is an ITComponent. The exporter must enrich via
    // GET /cards?ids= and emit the target name.
    const app: Card = makeCard({
      id: "11111111-1111-1111-1111-111111111111",
      type: "Application",
      name: "ERP",
    });
    const itc: Card = makeCard({
      id: "22222222-2222-2222-2222-222222222222",
      type: "ITComponent",
      name: "DB",
    });
    getMock.mockImplementation(async (url: string): Promise<unknown> => {
      if (url === "/relations") {
        return [
          {
            id: "rel1",
            type: "depends_on",
            source_id: app.id,
            target_id: itc.id,
            source: { id: app.id, type: app.type, name: app.name },
            target: { id: itc.id, type: itc.type, name: itc.name },
          },
        ];
      }
      if (url.startsWith("/cards?ids=")) {
        return { items: [itc] };
      }
      return [];
    });

    const wb = await buildExportWorkbook(
      [app],
      APP_TYPE,
      [APP_TYPE, ITC_TYPE],
      [DEPENDS_ON_TYPE],
    );
    const rows = rowsOf(wb, APP_TYPE.label);
    expect(rows).toHaveLength(1);
    expect(rows[0]["rel:depends_on"]).toBe(itc.name);
  });

  it("falls back to the embedded ref name when /cards?ids= returns nothing", async () => {
    // Permission-denied / transient-failure edge case: we still want a
    // populated cell rather than a silent blank. The relation payload's
    // own `target.name` is enough for the bare-name case.
    const app: Card = makeCard({
      id: "11111111-1111-1111-1111-111111111111",
      type: "Application",
      name: "ERP",
    });
    getMock.mockImplementation(async (url: string): Promise<unknown> => {
      if (url === "/relations") {
        return [
          {
            id: "rel1",
            type: "depends_on",
            source_id: app.id,
            target_id: "22222222-2222-2222-2222-222222222222",
            source: { id: app.id, type: app.type, name: app.name },
            target: {
              id: "22222222-2222-2222-2222-222222222222",
              type: "ITComponent",
              name: "DB",
            },
          },
        ];
      }
      if (url.startsWith("/cards?ids=")) {
        return { items: [] };
      }
      return [];
    });

    const wb = await buildExportWorkbook(
      [app],
      APP_TYPE,
      [APP_TYPE, ITC_TYPE],
      [DEPENDS_ON_TYPE],
    );
    const rows = rowsOf(wb, APP_TYPE.label);
    expect(rows[0]["rel:depends_on"]).toBe("DB");
  });
});
