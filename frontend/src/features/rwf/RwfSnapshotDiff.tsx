/**
 * RwfSnapshotDiff — shows what changed in main since a named snapshot.
 * Calls GET /rwf/snapshots/{id}/diff and renders added / removed / modified
 * cards, relations, and diagrams in collapsible sections.
 */
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import type { SnapshotDiff } from "./rwf.types";
import { fmt } from "./rwf.utils";

const OP_COLOR: Record<string, "success" | "error" | "warning"> = {
  added: "success",
  removed: "error",
  modified: "warning",
};

interface DiffRowProps {
  item: Record<string, unknown>;
  operation: "added" | "removed";
}

function DiffRow({ item, operation }: DiffRowProps) {
  const { t } = useTranslation("rwf");
  const name = String(item.name ?? item.id ?? "—");
  const type = String(item.type ?? "");

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" fontWeight={600}>{name}</Typography>
      </TableCell>
      <TableCell>
        <Typography variant="caption" color="text.secondary">{type}</Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={t(`snapshotDiff.operation.${operation}`)}
          size="small"
          color={OP_COLOR[operation]}
        />
      </TableCell>
    </TableRow>
  );
}

interface ModifiedCardRowProps {
  item: { id: string; diff: Record<string, unknown> };
}

function ModifiedCardRow({ item }: ModifiedCardRowProps) {
  const { t } = useTranslation("rwf");
  const [expanded, setExpanded] = useState(false);

  const fields = Object.entries(item.diff).filter(([k]) => !k.startsWith("_"));

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              <MaterialSymbol icon={expanded ? "expand_less" : "expand_more"} size={16} />
            </IconButton>
            <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
              {item.id}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {fields.length} {t("snapshotDiff.fieldsChanged", { count: fields.length })}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={t("snapshotDiff.operation.modified")}
            size="small"
            color={OP_COLOR["modified"]}
          />
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={3} sx={{ p: 0 }}>
            <Collapse in={expanded}>
              <Box sx={{ p: 2, bgcolor: "action.hover" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.field")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("snapshotDiff.snapshotValue")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("snapshotDiff.currentValue")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map(([field, change]) => {
                      const c = change as { old?: unknown; new?: unknown } | null;
                      return (
                        <TableRow key={field}>
                          <TableCell>
                            <Typography variant="caption" fontFamily="monospace">{field}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {String(c?.old ?? "—")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {String(c?.new ?? "—")}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default function RwfSnapshotDiff() {
  const { t } = useTranslation("rwf");
  const navigate = useNavigate();
  const { id: snapshotId } = useParams<{ id: string }>();

  const [diff, setDiff] = useState<SnapshotDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"cards" | "relations" | "diagrams">("cards");

  const load = useCallback(async () => {
    if (!snapshotId) return;
    setLoading(true);
    setError("");
    try {
      const d = await api.get<SnapshotDiff>(`/rwf/snapshots/${snapshotId}/diff`);
      setDiff(d);
    } catch {
      setError(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [snapshotId, t]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalChanges = diff
    ? diff.cards_added.length + diff.cards_removed.length + diff.cards_modified.length +
      diff.relations_added.length + diff.relations_removed.length +
      diff.diagrams_added.length + diff.diagrams_removed.length
    : 0;

  const cardCount = diff
    ? diff.cards_added.length + diff.cards_removed.length + diff.cards_modified.length
    : 0;
  const relCount = diff
    ? diff.relations_added.length + diff.relations_removed.length
    : 0;
  const diagCount = diff
    ? diff.diagrams_added.length + diff.diagrams_removed.length
    : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Button
          size="small"
          onClick={() => navigate("/rwf/branches?tab=snapshots")}
          startIcon={<MaterialSymbol icon="arrow_back" size={16} />}
        >
          {t("snapshotDiff.back")}
        </Button>
        {diff && (
          <>
            <Typography variant="h6" fontWeight={700}>{diff.snapshot_name}</Typography>
            <Chip
              label={fmt(diff.snapshot_at)}
              size="small"
              variant="outlined"
              icon={<MaterialSymbol icon="schedule" size={14} />}
            />
          </>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {diff && totalChanges === 0 ? (
        <Alert severity="success" sx={{ mb: 2 }}>{t("snapshotDiff.noChanges")}</Alert>
      ) : diff && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("snapshotDiff.summary", { count: totalChanges })}
        </Alert>
      )}

      {diff && totalChanges === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">{t("snapshotDiff.noChanges")}</Typography>
        </Paper>
      ) : diff ? (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="cards" label={t("diff.cards", { count: cardCount })} />
            <Tab value="relations" label={t("diff.relations", { count: relCount })} />
            <Tab value="diagrams" label={t("diff.diagrams", { count: diagCount })} />
          </Tabs>

          {tab === "cards" && (
            cardCount === 0 ? (
              <Typography color="text.secondary" variant="body2">{t("snapshotDiff.noChangesTab")}</Typography>
            ) : (
              <Paper variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.cardName")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.type")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.change")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diff.cards_added.map((c, i) => (
                      <DiffRow key={`add-${String(c.id ?? i)}`} item={c} operation="added" />
                    ))}
                    {diff.cards_removed.map((c, i) => (
                      <DiffRow key={`rem-${String(c.id ?? i)}`} item={c} operation="removed" />
                    ))}
                    {diff.cards_modified.map((c) => (
                      <ModifiedCardRow key={c.id} item={c} />
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          )}

          {tab === "relations" && (
            relCount === 0 ? (
              <Typography color="text.secondary" variant="body2">{t("snapshotDiff.noChangesTab")}</Typography>
            ) : (
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Relation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.change")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diff.relations_added.map((r, i) => (
                      <TableRow key={`add-${i}`} hover>
                        <TableCell>
                          <Typography variant="caption">
                            {String(r.type ?? "")} · {String(r.source_id ?? "")} → {String(r.target_id ?? "")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={t("snapshotDiff.operation.added")} size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {diff.relations_removed.map((r, i) => (
                      <TableRow key={`rem-${i}`} hover>
                        <TableCell>
                          <Typography variant="caption">
                            {String(r.type ?? "")} · {String(r.source_id ?? "")} → {String(r.target_id ?? "")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={t("snapshotDiff.operation.removed")} size="small" color="error" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          )}

          {tab === "diagrams" && (
            diagCount === 0 ? (
              <Typography color="text.secondary" variant="body2">{t("snapshotDiff.noChangesTab")}</Typography>
            ) : (
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.diagramName")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.change")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diff.diagrams_added.map((d, i) => (
                      <TableRow key={`add-${i}`} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {String((d as { name?: string }).name ?? d.id ?? "—")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={t("snapshotDiff.operation.added")} size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {diff.diagrams_removed.map((d, i) => (
                      <TableRow key={`rem-${i}`} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {String((d as { name?: string }).name ?? d.id ?? "—")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={t("snapshotDiff.operation.removed")} size="small" color="error" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          )}
        </>
      ) : null}

      <Divider sx={{ my: 3 }} />
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => navigate("/rwf/branches?tab=snapshots")}
          startIcon={<MaterialSymbol icon="arrow_back" size={16} />}
        >
          {t("snapshotDiff.back")}
        </Button>
      </Stack>
    </Box>
  );
}
