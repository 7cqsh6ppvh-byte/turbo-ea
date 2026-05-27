/**
 * RwfBranchDiffPage — shows the full diff for a branch with conflict indicators
 * and a "Merge into Main" action that opens RwfMergeDialog.
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
import type {
  BranchDiff,
  CardOverride,
  DiagramOverride,
  RelationOverride,
  RwfBranch,
} from "./rwf.types";
import RwfStatusChip from "./RwfStatusChip";
import RwfMergeDialog from "./RwfMergeDialog";

const OP_COLOR: Record<string, "warning" | "success" | "error" | "default"> = {
  modified: "warning",
  created: "success",
  deleted: "error",
};

function CardDiffRow({ card }: { card: CardOverride }) {
  const { t } = useTranslation("rwf");
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              <MaterialSymbol icon={expanded ? "expand_less" : "expand_more"} size={16} />
            </IconButton>
            <Typography variant="body2" fontWeight={600}>
              {String(card.draft.name ?? card.card_id ?? "New card")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {String(card.draft.type ?? "")}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Chip
            label={t(`diff.operation.${card.operation}`)}
            size="small"
            color={OP_COLOR[card.operation]}
          />
        </TableCell>
        <TableCell>
          {card.has_conflicts ? (
            <Chip label={t("diff.conflict")} size="small" color="error" />
          ) : (
            <Chip label={t("diff.safe")} size="small" color="success" variant="outlined" />
          )}
        </TableCell>
      </TableRow>
      {expanded && card.operation === "modified" && (
        <TableRow>
          <TableCell colSpan={3} sx={{ p: 0 }}>
            <Collapse in={expanded}>
              <Box sx={{ p: 2, bgcolor: "action.hover" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.field")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.branch")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(card.conflicts).map(([field, status]) => (
                      <TableRow key={field}>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace">{field}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {String(card.draft[field] ?? "—")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status}
                            size="small"
                            color={status === "conflict" ? "error" : "default"}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
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

export default function RwfBranchDiffPage() {
  const { t } = useTranslation("rwf");
  const navigate = useNavigate();
  const { id: branchId } = useParams<{ id: string }>();

  const [branch, setBranch] = useState<RwfBranch | null>(null);
  const [diff, setDiff] = useState<BranchDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cards" | "relations" | "diagrams">("cards");
  const [mergeOpen, setMergeOpen] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const [b, d] = await Promise.all([
        api.get<RwfBranch>(`/rwf/branches/${branchId}`),
        api.get<BranchDiff>(`/rwf/branches/${branchId}/diff`),
      ]);
      setBranch(b);
      setDiff(d);
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

  const cards = diff?.cards ?? [];
  const relations = diff?.relations ?? [];
  const diagrams = diff?.diagrams ?? [];
  const totalConflicts = [
    ...cards.filter((c) => c.has_conflicts),
    ...diagrams.filter((d) => d.has_conflicts),
  ].length;

  const canMerge = branch?.status === "approved";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            onClick={() => navigate(`/rwf/branches/${branchId}`)}
            startIcon={<MaterialSymbol icon="arrow_back" size={16} />}
          >
            {t("diff.back")}
          </Button>
          {branch && (
            <>
              <Typography variant="h6" fontWeight={700}>{branch.name}</Typography>
              <RwfStatusChip status={branch.status} />
            </>
          )}
        </Stack>
        {canMerge && (
          <Button
            variant="contained"
            color="success"
            startIcon={<MaterialSymbol icon="merge" size={18} />}
            onClick={() => setMergeOpen(true)}
          >
            {t("diff.mergeBtn")}
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Conflict summary */}
      {totalConflicts === 0 ? (
        <Alert severity="success" sx={{ mb: 2 }}>{t("diff.noConflicts")}</Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("diff.hasConflicts", { count: totalConflicts })}
        </Alert>
      )}

      {cards.length + relations.length + diagrams.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">{t("diff.noChanges")}</Typography>
        </Paper>
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="cards" label={t("diff.cards", { count: cards.length })} />
            <Tab value="relations" label={t("diff.relations", { count: relations.length })} />
            <Tab value="diagrams" label={t("diff.diagrams", { count: diagrams.length })} />
          </Tabs>

          {tab === "cards" && (
            cards.length === 0 ? (
              <Typography color="text.secondary" variant="body2">{t("diff.noChanges")}</Typography>
            ) : (
              <Paper variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.cardName")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Operation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Conflict</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cards.map((c) => <CardDiffRow key={c.override_id} card={c} />)}
                  </TableBody>
                </Table>
              </Paper>
            )
          )}

          {tab === "relations" && (
            relations.length === 0 ? (
              <Typography color="text.secondary" variant="body2">{t("diff.noChanges")}</Typography>
            ) : (
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Relation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Operation</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relations.map((r: RelationOverride) => (
                      <TableRow key={r.override_id}>
                        <TableCell>
                          <Typography variant="caption">
                            {String(r.draft.type ?? "")} ·{" "}
                            {String(r.draft.source_id ?? "")} → {String(r.draft.target_id ?? "")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t(`diff.operation.${r.operation}`)}
                            size="small"
                            color={OP_COLOR[r.operation]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          )}

          {tab === "diagrams" && (
            diagrams.length === 0 ? (
              <Typography color="text.secondary" variant="body2">{t("diff.noChanges")}</Typography>
            ) : (
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>{t("diff.diagramName")}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Operation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Conflict</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diagrams.map((d: DiagramOverride) => (
                      <TableRow key={d.override_id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {String((d.draft as { name?: string })?.name ?? d.diagram_id ?? "—")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={t(`diff.operation.${d.operation}`)}
                            size="small"
                            color={OP_COLOR[d.operation]}
                          />
                        </TableCell>
                        <TableCell>
                          {d.has_conflicts ? (
                            <Chip label={t("diff.conflict")} size="small" color="error" />
                          ) : (
                            <Chip label={t("diff.safe")} size="small" color="success" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          )}
        </>
      )}

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {canMerge && (
          <Button
            variant="contained"
            color="success"
            onClick={() => setMergeOpen(true)}
            startIcon={<MaterialSymbol icon="merge" size={18} />}
          >
            {t("diff.mergeBtn")}
          </Button>
        )}
      </Stack>

      {/* Merge dialog */}
      {diff && branchId && (
        <RwfMergeDialog
          open={mergeOpen}
          branchId={branchId}
          diff={diff}
          onClose={() => setMergeOpen(false)}
          onMerged={() => {
            setMergeOpen(false);
            navigate("/rwf/branches");
          }}
        />
      )}
    </Box>
  );
}
