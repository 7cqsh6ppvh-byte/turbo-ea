import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { api } from "@/api/client";
import type { SavedReport } from "@/types";
import {
  REPORT_TYPE_STYLE,
  getReportTypeLabels,
} from "@/features/reports/savedReportStyles";
import SectionPaper, { EmptyState, ViewAllLink } from "./SectionPaper";

const MAX_VISIBLE = 8;

export default function MySavedReportsSection() {
  const { t } = useTranslation(["common", "reports"]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<SavedReport[]>([]);

  const reportTypeLabels = useMemo(() => getReportTypeLabels(t), [t]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get<SavedReport[]>("/saved-reports?filter=my")
      .then((data) => {
        if (!cancelled) setReports(data.slice(0, MAX_VISIBLE));
      })
      .catch(() => {
        if (!cancelled) setReports([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpen = (report: SavedReport) => {
    const style = REPORT_TYPE_STYLE[report.report_type];
    if (style) {
      navigate(`${style.path}?saved_report_id=${report.id}`);
    }
  };

  return (
    <SectionPaper
      icon="bookmarks"
      iconColor="#1976d2"
      title={t("common:dashboard.workspace.mySavedReports")}
      action={
        <ViewAllLink to="/reports/saved" label={t("common:actions.viewAll")} />
      }
    >
      {loading ? (
        <LinearProgress />
      ) : reports.length === 0 ? (
        <EmptyState message={t("common:dashboard.workspace.empty.savedReports")} />
      ) : (
        <Box>
          {reports.map((report) => {
            const style = REPORT_TYPE_STYLE[report.report_type];
            const typeLabel = reportTypeLabels[report.report_type] || report.report_type;
            return (
              <Box
                key={report.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                  px: 1,
                  borderRadius: 1,
                  cursor: style ? "pointer" : "default",
                  "&:hover": style ? { bgcolor: "action.hover" } : undefined,
                }}
                onClick={() => style && handleOpen(report)}
              >
                <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                  {report.name}
                </Typography>
                {style && (
                  <Chip
                    icon={<MaterialSymbol icon={style.icon} size={14} />}
                    label={typeLabel}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      bgcolor: `${style.color}14`,
                      color: style.color,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </SectionPaper>
  );
}
