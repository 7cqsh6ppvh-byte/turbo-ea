/**
 * RwfWorkspace — branch-scoped landscape view with Cards | Relations | Diagrams tabs.
 * All data comes from /rwf/branches/{id}/* endpoints, never touching main tables.
 */
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
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
import type { BranchCard, BranchRelation, RwfBranch } from "./rwf.types";
import RwfCardDetailPanel from "./RwfCardDetailPanel";

const OPERATION_COLOR: Record<string, "default" | "success" | "error" | "warning"> = {
  modified: "warning",
  created: "success",
  deleted: "error",
};

export default function RwfWorkspace() {
  const { t } = useTranslation("rwf");
  const navigate = useNavigate();
  const { id: branchId } = useParams<{ id: string }>();

  const [branch, setBranch] = useState<RwfBranch | null>(null);
  const [cards, setCards] = useState<BranchCard[]>([]);
  const [relations, setRelations] = useState<BranchRelation[]>([]);
  const [diagramOverrides, setDiagramOverrides] = useState<
    { override_id: string; operation: string; draft: Record<string, unknown> }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cards" | "relations" | "diagrams">("cards");
  const [error, setError] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const [b, cardsRes, relsRes, diffRes] = await Promise.all([
        api.get<RwfBranch>(`/rwf/branches/${branchId}`),
        api.get<{ items: BranchCard[] }>(`/rwf/branches/${branchId}/cards`),
        api.get<{ items: BranchRelation[] }>(`/rwf/branches/${branchId}/relations`),
        api.get<{ cards: unknown[]; relations: unknown[]; diagrams: { override_id: string; operation: string; draft: Record<string, unknown> }[] }>(
          `/rwf/branches/${branchId}/diff`,
        ),
      ]);
      setBranch(b);
      setCards(cardsRes.items ?? []);
      setRelations(relsRes.items ?? []);
      setDiagramOverrides(diffRes.diagrams ?? []);
    } catch {
      setError(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [branchId, t]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isReadOnly = branch?.status !== "open";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            onClick={() => navigate(`/rwf/branches/${branchId}`)}
            startIcon={<MaterialSymbol icon="arrow_back" size={16} />}
          >
            {t("workspace.back")}
          </Button>
          {branch && (
            <Typography variant="h6" fontWeight={700}>
              {branch.name}
            </Typography>
          )}
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/rwf/branches/${branchId}/diff`)}
          startIcon={<MaterialSymbol icon="difference" size={16} />}
        >
          {t("branchDetail.diff")}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isReadOnly && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This branch is {branch?.status} — workspace is read-only.
        </Alert>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="cards" label={`${t("workspace.tabs.cards")} (${cards.length})`} />
        <Tab value="relations" label={`${t("workspace.tabs.relations")} (${relations.length})`} />
        <Tab value="diagrams" label={`${t("workspace.tabs.diagrams")} (${diagramOverrides.length})`} />
      </Tabs>

      {/* Cards tab */}
      {tab === "cards" && (
        cards.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">{t("workspace.cards.empty")}</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.name")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.type")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.status")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.change")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cards.map((c) => (
                  <TableRow
                    key={c.id || c._override_id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      if (c.id) {
                        setSelectedCardId(c.id);
                        setPanelOpen(true);
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{c.type}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{c.status}</Typography>
                    </TableCell>
                    <TableCell>
                      {c._override ? (
                        <Chip
                          label={t(`workspace.operation.${c._override}`)}
                          size="small"
                          color={OPERATION_COLOR[c._override] ?? "default"}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {t("workspace.operation.main")}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )
      )}

      {/* Relations tab */}
      {tab === "relations" && (
        relations.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">{t("workspace.relations.empty")}</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.relationType")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.source")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.target")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.change")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relations.map((r, i) => (
                  <TableRow key={r.id ?? `rel-${i}`} hover>
                    <TableCell><Typography variant="caption">{r.type}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption">{r.source_name ?? r.source_id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{r.target_name ?? r.target_id}</Typography>
                    </TableCell>
                    <TableCell>
                      {r._override ? (
                        <Chip
                          label={t(`workspace.operation.${r._override}`)}
                          size="small"
                          color={OPERATION_COLOR[r._override] ?? "default"}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {t("workspace.operation.main")}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )
      )}

      {/* Diagrams tab */}
      {tab === "diagrams" && (
        diagramOverrides.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">{t("workspace.diagrams.empty")}</Typography>
          </Paper>
        ) : (
          <Paper variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.name")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("workspace.col.change")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diagramOverrides.map((d) => (
                  <TableRow key={d.override_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {(d.draft as { name?: string })?.name ?? d.override_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`workspace.operation.${d.operation}`)}
                        size="small"
                        color={OPERATION_COLOR[d.operation] ?? "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )
      )}

      {/* Branch-scoped card detail panel */}
      {branchId && (
        <RwfCardDetailPanel
          open={panelOpen}
          branchId={branchId}
          cardId={selectedCardId}
          readOnly={isReadOnly}
          onClose={() => { setPanelOpen(false); setSelectedCardId(null); }}
          onSaved={(updated) => {
            setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
    </Box>
  );
}
