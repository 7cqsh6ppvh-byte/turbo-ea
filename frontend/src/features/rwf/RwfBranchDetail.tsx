/**
 * RwfBranchDetail — full detail page for a single branch.
 * Shows status, change counts, and action buttons based on current status.
 */
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import type { RwfBranch } from "./rwf.types";
import RwfStatusChip from "./RwfStatusChip";
import { fmt } from "./rwf.utils";
import RwfSyncDialog from "./RwfSyncDialog";

export default function RwfBranchDetail() {
  const { t } = useTranslation("rwf");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [branch, setBranch] = useState<RwfBranch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog states
  const [submitOpen, setSubmitOpen] = useState(false);
  const [abandonOpen, setAbandonOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [syncOpen, setSyncOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await api.get<RwfBranch>(`/rwf/branches/${id}`);
      setBranch(b);
    } catch {
      setError(t("branchDetail.notFound"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (
    path: string,
    body?: Record<string, unknown>,
    successStatus?: string,
  ) => {
    if (!id) return;
    setActionLoading(true);
    setActionError("");
    try {
      const updated = await api.post<RwfBranch>(`/rwf/branches/${id}/${path}`, body ?? {});
      setBranch(updated);
      if (successStatus === "merged") navigate("/rwf/branches");
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail;
      setActionError(msg ?? t("error.saveFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!branch || error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || t("branchDetail.notFound")}</Alert>
      </Box>
    );
  }

  const isOpen = branch.status === "open";
  const isInReview = branch.status === "in_review";
  const isApproved = branch.status === "approved";
  const isMerged = branch.status === "merged";
  const isRolledBack = branch.status === "rolled_back";
  const isClosed = ["merged", "rejected", "abandoned", "rolled_back"].includes(branch.status);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto" }}>
      {/* Breadcrumb */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Button
          size="small"
          onClick={() => navigate("/rwf/branches")}
          startIcon={<MaterialSymbol icon="arrow_back" size={16} />}
        >
          {t("branches.title")}
        </Button>
      </Stack>

      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
            <Typography variant="h5" fontWeight={700}>{branch.name}</Typography>
            <RwfStatusChip status={branch.status} size="medium" />
          </Stack>
          {branch.description && (
            <Typography variant="body2" color="text.secondary">{branch.description}</Typography>
          )}
        </Box>
      </Stack>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      {/* Change counts */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          {t("branchDetail.changes")}
        </Typography>
        {branch.card_count + branch.rel_count + branch.diag_count === 0 ? (
          <Typography variant="body2" color="text.secondary">{t("branchDetail.noChanges")}</Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {branch.card_count > 0 && (
              <Chip
                icon={<MaterialSymbol icon="inventory_2" size={16} />}
                label={t("branch.cards", { count: branch.card_count })}
                variant="outlined"
              />
            )}
            {branch.rel_count > 0 && (
              <Chip
                icon={<MaterialSymbol icon="sync_alt" size={16} />}
                label={t("branch.relations", { count: branch.rel_count })}
                variant="outlined"
              />
            )}
            {branch.diag_count > 0 && (
              <Chip
                icon={<MaterialSymbol icon="schema" size={16} />}
                label={t("branch.diagrams", { count: branch.diag_count })}
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Paper>

      {/* Metadata */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Typography variant="caption" color="text.secondary" width={160}>
              {t("branchDetail.createdBy")}
            </Typography>
            <Typography variant="caption">{branch.created_by ?? "—"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography variant="caption" color="text.secondary" width={160}>
              {t("branchDetail.baseSnapshot")}
            </Typography>
            <Typography variant="caption">{fmt(branch.base_snapshot_at)}</Typography>
          </Stack>
          {branch.reviewed_by && (
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" color="text.secondary" width={160}>
                {t("branchDetail.reviewedBy")}
              </Typography>
              <Typography variant="caption">{branch.reviewed_by}</Typography>
            </Stack>
          )}
          {branch.review_comment && (
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" color="text.secondary" width={160}>
                {t("branchDetail.reviewComment")}
              </Typography>
              <Typography variant="caption">{branch.review_comment}</Typography>
            </Stack>
          )}
          {branch.rolled_back_by && (
            <Stack direction="row" spacing={1}>
              <Typography variant="caption" color="text.secondary" width={160}>
                {t("branchDetail.rolledBackBy")}
              </Typography>
              <Typography variant="caption">
                {branch.rolled_back_by}
                {branch.rolled_back_at && ` · ${fmt(branch.rolled_back_at)}`}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Rollback section — only for merged branches with a pre-merge snapshot */}
      {isMerged && (
        <Paper
          variant="outlined"
          sx={{ p: 2.5, mb: 3, borderColor: branch.can_rollback ? "warning.main" : "divider" }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <MaterialSymbol icon="history" size={20} color={branch.can_rollback ? "#ed6c02" : "#999"} />
            <Typography variant="subtitle2" fontWeight={700}>
              {t("rollback.title")}
            </Typography>
          </Stack>
          {branch.can_rollback ? (
            <>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {t("rollback.description")}
              </Typography>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<MaterialSymbol icon="undo" size={16} />}
                onClick={() => setRollbackOpen(true)}
                disabled={actionLoading}
              >
                {t("rollback.action")}
              </Button>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("rollback.unavailable")}
            </Typography>
          )}
        </Paper>
      )}

      {/* Rolled-back notice */}
      {isRolledBack && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MaterialSymbol icon="history" size={20} color="#5d4037" />
            <Typography variant="body2" color="text.secondary">
              {t("rollback.done")}
            </Typography>
          </Stack>
        </Paper>
      )}

      {/* Action buttons */}
      {!isClosed && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            {t("branchDetail.actions")}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Always: open workspace */}
            <Button
              variant="contained"
              startIcon={<MaterialSymbol icon="edit" size={16} />}
              onClick={() => navigate(`/rwf/branches/${id}/workspace`)}
              disabled={isInReview || isApproved}
            >
              {t("branchDetail.workspace")}
            </Button>

            {/* View diff */}
            <Button
              variant="outlined"
              startIcon={<MaterialSymbol icon="difference" size={16} />}
              onClick={() => navigate(`/rwf/branches/${id}/diff`)}
            >
              {t("branchDetail.diff")}
            </Button>

            <Divider orientation="vertical" flexItem />

            {/* Sync from main */}
            {isOpen && (
              <Tooltip title={t("sync.subtitle")}>
                <Button
                  variant="outlined"
                  startIcon={<MaterialSymbol icon="sync" size={16} />}
                  onClick={() => setSyncOpen(true)}
                >
                  {t("branchDetail.sync")}
                </Button>
              </Tooltip>
            )}

            {/* Submit for review */}
            {isOpen && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<MaterialSymbol icon="rate_review" size={16} />}
                onClick={() => setSubmitOpen(true)}
                disabled={actionLoading}
              >
                {t("branchDetail.submit")}
              </Button>
            )}

            {/* Approve */}
            {isInReview && (
              <Button
                variant="contained"
                color="success"
                startIcon={<MaterialSymbol icon="check_circle" size={16} />}
                onClick={() => doAction("approve")}
                disabled={actionLoading}
              >
                {t("branchDetail.approve")}
              </Button>
            )}

            {/* Reject */}
            {isInReview && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<MaterialSymbol icon="cancel" size={16} />}
                onClick={() => setRejectOpen(true)}
                disabled={actionLoading}
              >
                {t("branchDetail.reject")}
              </Button>
            )}

            {/* Merge */}
            {isApproved && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<MaterialSymbol icon="merge" size={16} />}
                onClick={() => navigate(`/rwf/branches/${id}/diff`)}
              >
                {t("branchDetail.merge")}
              </Button>
            )}

            {/* Abandon */}
            {(isOpen || isInReview) && (
              <Button
                variant="text"
                color="error"
                onClick={() => setAbandonOpen(true)}
                disabled={actionLoading}
              >
                {t("branchDetail.abandon")}
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* Submit confirm */}
      <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("branchDetail.submit")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("branchDetail.submitConfirm")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitOpen(false)}>{t("createBranch.cancel")}</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => { setSubmitOpen(false); doAction("submit"); }}
          >
            {t("branchDetail.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Abandon confirm */}
      <Dialog open={abandonOpen} onClose={() => setAbandonOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("branchDetail.abandon")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("branchDetail.abandonConfirm")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbandonOpen(false)}>{t("createBranch.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { setAbandonOpen(false); doAction("abandon"); }}
          >
            {t("branchDetail.abandon")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("branchDetail.reject")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={t("branchDetail.rejectComment")}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>{t("createBranch.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setRejectOpen(false);
              doAction("reject", { comment: rejectComment || undefined });
            }}
          >
            {t("branchDetail.rejectSubmit")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sync dialog */}
      {id && (
        <RwfSyncDialog
          open={syncOpen}
          branchId={id}
          onClose={() => setSyncOpen(false)}
          onSynced={() => { setSyncOpen(false); load(); }}
        />
      )}

      {/* Rollback confirmation dialog */}
      <Dialog open={rollbackOpen} onClose={() => setRollbackOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MaterialSymbol icon="undo" size={20} color="#ed6c02" />
            <span>{t("rollback.title")}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{t("rollback.confirm")}</DialogContentText>
          {actionError && (
            <Alert severity="error" sx={{ mt: 2 }}>{actionError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRollbackOpen(false); setActionError(""); }}>
            {t("createBranch.cancel")}
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<MaterialSymbol icon="undo" size={16} />}
            disabled={actionLoading}
            onClick={async () => {
              setActionLoading(true);
              setActionError("");
              try {
                const updated = await api.post<RwfBranch>(`/rwf/branches/${id}/rollback`, {});
                setBranch(updated);
                setRollbackOpen(false);
              } catch (e: unknown) {
                const msg = (e as { detail?: string })?.detail;
                setActionError(msg ?? t("error.saveFailed"));
              } finally {
                setActionLoading(false);
              }
            }}
          >
            {actionLoading ? t("rollback.inProgress") : t("rollback.action")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
