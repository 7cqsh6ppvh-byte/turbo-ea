/**
 * RwfBranchesPage — tabbed view: Branches list | Snapshots list.
 */
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import type {
  BranchListResponse,
  BranchStatus,
  EaSnapshot,
  RwfBranch,
  SnapshotListResponse,
} from "./rwf.types";
import RwfStatusChip from "./RwfStatusChip";
import RwfCreateBranchDialog from "./RwfCreateBranchDialog";
import { fmt } from "./rwf.utils";

type StatusFilter = BranchStatus | "all";

const STATUS_FILTERS: StatusFilter[] = ["all", "open", "in_review", "merged", "rejected"];

export default function RwfBranchesPage() {
  const { t } = useTranslation("rwf");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") === "snapshots") ? "snapshots" : "branches";

  // Branches state
  const [branches, setBranches] = useState<RwfBranch[]>([]);
  const [branchesTotal, setBranchesTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Snapshots state
  const [snapshots, setSnapshots] = useState<EaSnapshot[]>([]);
  const [snapsTotal, setSnapsTotal] = useState(0);
  const [snapsLoading, setSnapsLoading] = useState(false);
  const [createSnapOpen, setCreateSnapOpen] = useState(false);
  const [snapName, setSnapName] = useState("");
  const [snapDesc, setSnapDesc] = useState("");
  const [snapSaving, setSnapSaving] = useState(false);
  const [snapError, setSnapError] = useState("");
  const [deleteSnapId, setDeleteSnapId] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const url =
        statusFilter === "all"
          ? "/rwf/branches?page_size=50"
          : `/rwf/branches?status=${statusFilter}&page_size=50`;
      const res = await api.get<BranchListResponse>(url);
      setBranches(res.items);
      setBranchesTotal(res.total);
    } catch { /* ignore */ } finally {
      setBranchesLoading(false);
    }
  }, [statusFilter]);

  const loadSnapshots = useCallback(async () => {
    setSnapsLoading(true);
    try {
      const res = await api.get<SnapshotListResponse>("/rwf/snapshots?page_size=50");
      setSnapshots(res.items);
      setSnapsTotal(res.total);
    } catch { /* ignore */ } finally {
      setSnapsLoading(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "branches") loadBranches(); }, [activeTab, loadBranches]);
  useEffect(() => { if (activeTab === "snapshots") loadSnapshots(); }, [activeTab, loadSnapshots]);

  const handleCreated = (branch: RwfBranch) => {
    setCreateOpen(false);
    navigate(`/rwf/branches/${branch.id}`);
  };

  const handleCreateSnapshot = async () => {
    if (!snapName.trim()) { setSnapError(t("createSnapshot.nameRequired")); return; }
    setSnapSaving(true);
    try {
      await api.post("/rwf/snapshots", {
        name: snapName.trim(),
        description: snapDesc.trim() || undefined,
      });
      setSnapName("");
      setSnapDesc("");
      setSnapError("");
      setCreateSnapOpen(false);
      loadSnapshots();
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setSnapError(msg ?? t("error.saveFailed"));
    } finally {
      setSnapSaving(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    try {
      await api.delete(`/rwf/snapshots/${id}`);
      setDeleteSnapId(null);
      loadSnapshots();
    } catch { /* ignore */ }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          {t("page.title")}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate("/rwf")}
          startIcon={<MaterialSymbol icon="dashboard" size={16} />}
        >
          Dashboard
        </Button>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setSearchParams({ tab: v })}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="branches" label={t("branches.title")} />
        <Tab value="snapshots" label={t("snapshots.title")} />
      </Tabs>

      {/* ── Branches tab ─────────────────────────────────────────── */}
      {activeTab === "branches" && (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              size="small"
              onChange={(_, v) => { if (v) setStatusFilter(v); }}
            >
              {STATUS_FILTERS.map((s) => (
                <ToggleButton key={s} value={s}>
                  {t(`branches.filter.${s}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button
              variant="contained"
              size="small"
              startIcon={<MaterialSymbol icon="add" size={16} />}
              onClick={() => setCreateOpen(true)}
            >
              {t("branches.create")}
            </Button>
          </Stack>

          {branchesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : branches.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">{t("branches.empty")}</Typography>
            </Paper>
          ) : (
            <Paper variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.name")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.status")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.changes")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.createdAt")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((b) => (
                    <TableRow
                      key={b.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/rwf/branches/${b.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {b.name}
                        </Typography>
                        {b.description && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {b.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell><RwfStatusChip status={b.status} /></TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {b.card_count > 0 && (
                            <Chip
                              label={t("branch.cards", { count: b.card_count })}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {b.rel_count > 0 && (
                            <Chip
                              label={t("branch.relations", { count: b.rel_count })}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {b.diag_count > 0 && (
                            <Chip
                              label={t("branch.diagrams", { count: b.diag_count })}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {fmt(b.created_at)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {branchesTotal} total
          </Typography>
        </>
      )}

      {/* ── Snapshots tab ────────────────────────────────────────── */}
      {activeTab === "snapshots" && (
        <>
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              size="small"
              startIcon={<MaterialSymbol icon="add" size={16} />}
              onClick={() => setCreateSnapOpen(true)}
            >
              {t("snapshots.create")}
            </Button>
          </Stack>

          {snapsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : snapshots.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">{t("snapshots.empty")}</Typography>
            </Paper>
          ) : (
            <Paper variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t("snapshots.col.name")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("snapshots.col.capturedAt")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("snapshots.col.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {snapshots.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                        {s.description && (
                          <Typography variant="caption" color="text.secondary">{s.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {fmt(s.snapshot_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={t("snapshots.viewDiff")}>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/rwf/snapshots/${s.id}/diff`)}
                            >
                              <MaterialSymbol icon="difference" size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("snapshots.delete")}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteSnapId(s.id)}
                            >
                              <MaterialSymbol icon="delete" size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {snapsTotal} total
          </Typography>
        </>
      )}

      {/* Create branch dialog */}
      <RwfCreateBranchDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      {/* Create snapshot dialog */}
      <Dialog open={createSnapOpen} onClose={() => setCreateSnapOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("createSnapshot.title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("createSnapshot.hint")}
            </Typography>
            <TextField
              label={t("createSnapshot.name")}
              value={snapName}
              onChange={(e) => { setSnapName(e.target.value); setSnapError(""); }}
              error={!!snapError}
              helperText={snapError}
              fullWidth
              autoFocus
            />
            <TextField
              label={t("createSnapshot.description")}
              value={snapDesc}
              onChange={(e) => setSnapDesc(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateSnapOpen(false)} disabled={snapSaving}>
            {t("createSnapshot.cancel")}
          </Button>
          <Button variant="contained" onClick={handleCreateSnapshot} disabled={snapSaving}>
            {t("createSnapshot.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete snapshot confirm */}
      <Dialog open={!!deleteSnapId} onClose={() => setDeleteSnapId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("snapshots.delete")}</DialogTitle>
        <DialogContent>
          <Typography>{t("snapshots.deleteConfirm")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSnapId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteSnapId && handleDeleteSnapshot(deleteSnapId)}
          >
            {t("snapshots.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
