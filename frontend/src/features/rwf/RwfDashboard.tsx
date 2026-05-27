/**
 * RwfDashboard — top-level landing page for the Releases module.
 * Shows KPI tiles, recent open branches, and the review queue.
 */
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";

import type { BranchListResponse, RwfBranch } from "./rwf.types";
import RwfStatusChip from "./RwfStatusChip";
import { fmt } from "./rwf.utils";
import RwfCreateBranchDialog from "./RwfCreateBranchDialog";

function KpiTile({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <MaterialSymbol icon={icon} size={22} color={color ?? "#1976d2"} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} color={color ?? "#1565c0"}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function RwfDashboard() {
  const { t } = useTranslation("rwf");
  const navigate = useNavigate();

  const [openBranches, setOpenBranches] = useState<RwfBranch[]>([]);
  const [inReviewBranches, setInReviewBranches] = useState<RwfBranch[]>([]);
  const [mergedThisMonth, setMergedThisMonth] = useState(0);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [openRes, reviewRes, mergedRes, snapsRes] = await Promise.all([
        api.get<BranchListResponse>("/rwf/branches?status=open&page_size=10"),
        api.get<BranchListResponse>("/rwf/branches?status=in_review&page_size=10"),
        api.get<BranchListResponse>("/rwf/branches?status=merged&page_size=1"),
        api.get<{ total: number }>("/rwf/snapshots?page_size=1"),
      ]);
      setOpenBranches(openRes.items);
      setInReviewBranches(reviewRes.items);
      setMergedThisMonth(mergedRes.total);
      setSnapshotCount(snapsRes.total);
    } catch {
      // silently ignore — error state shown by empty lists
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (branch: RwfBranch) => {
    setCreateOpen(false);
    navigate(`/rwf/branches/${branch.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t("dashboard.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("page.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MaterialSymbol icon="add" size={18} />}
          onClick={() => setCreateOpen(true)}
        >
          {t("dashboard.newBranch")}
        </Button>
      </Stack>

      {/* KPI tiles */}
      <Stack direction="row" spacing={2} flexWrap="wrap" mb={4} useFlexGap>
        <KpiTile
          icon="call_split"
          label={t("dashboard.openBranches")}
          value={openBranches.length}
          color="#1976d2"
        />
        <KpiTile
          icon="rate_review"
          label={t("dashboard.pendingReview")}
          value={inReviewBranches.length}
          color="#ed6c02"
        />
        <KpiTile
          icon="merge"
          label={t("dashboard.mergedThisMonth")}
          value={mergedThisMonth}
          color="#2e7d32"
        />
        <KpiTile
          icon="camera"
          label={t("dashboard.totalSnapshots")}
          value={snapshotCount}
          color="#6a1b9a"
        />
      </Stack>

      <Grid container spacing={3}>
        {/* Review queue */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                {t("dashboard.reviewQueue")}
              </Typography>
              {inReviewBranches.length > 0 && (
                <Chip
                  label={inReviewBranches.length}
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
            {inReviewBranches.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.noReviewQueue")}
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {inReviewBranches.map((b) => (
                  <Box
                    key={b.id}
                    onClick={() => navigate(`/rwf/branches/${b.id}`)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {b.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fmt(b.created_at)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Recent branches */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                {t("dashboard.recentBranches")}
              </Typography>
              <Button
                size="small"
                onClick={() => navigate("/rwf/branches")}
                endIcon={<MaterialSymbol icon="arrow_forward" size={16} />}
              >
                {t("dashboard.viewAll")}
              </Button>
            </Stack>
            {openBranches.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.noBranches")}
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.name")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.status")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.changes")}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t("branches.col.createdAt")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openBranches.map((b) => (
                    <TableRow
                      key={b.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/rwf/branches/${b.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {b.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RwfStatusChip status={b.status} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {b.card_count + b.rel_count + b.diag_count}
                        </Typography>
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
            )}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => navigate("/rwf/branches")}>
          {t("branches.title")}
        </Button>
      </Stack>

      <RwfCreateBranchDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </Box>
  );
}
