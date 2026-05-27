import { useTranslation } from "react-i18next";
import Chip from "@mui/material/Chip";
import type { BranchStatus } from "./rwf.types";
import { STATUS_COLOR, STATUS_BG } from "./rwf.utils";

interface Props {
  status: BranchStatus;
  size?: "small" | "medium";
}

export default function RwfStatusChip({ status, size = "small" }: Props) {
  const { t } = useTranslation("rwf");
  return (
    <Chip
      label={t(`branch.status.${status}`)}
      size={size}
      sx={{
        color: STATUS_COLOR[status],
        bgcolor: STATUS_BG[status],
        fontWeight: 600,
        borderRadius: 1,
      }}
    />
  );
}
