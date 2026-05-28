/**
 * ModuleGate — wraps a route element for an optional module (BPM, PPM,
 * TurboLens, ArchiMate, C4, AWS, Azure, GCP) and renders a friendly
 * "module disabled" placeholder when the admin has turned the module off.
 */
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MaterialSymbol from "@/components/MaterialSymbol";
import { useArchiMateEnabled } from "@/hooks/useArchiMateEnabled";
import { useBpmEnabled } from "@/hooks/useBpmEnabled";
import { useC4Enabled } from "@/hooks/useC4Enabled";
import { useGrcEnabled } from "@/hooks/useGrcEnabled";
import { usePpmEnabled } from "@/hooks/usePpmEnabled";
import { useTurboLensReady } from "@/hooks/useTurboLensReady";

type ModuleKey = "archimate" | "bpm" | "c4" | "grc" | "ppm" | "turbolens";

interface Props {
  module: ModuleKey;
  children: React.ReactNode;
}

const SETTINGS_TAB: Record<ModuleKey, string> = {
  archimate: "/admin/settings?tab=archimate",
  bpm: "/admin/settings?tab=bpm",
  c4: "/admin/settings?tab=c4",
  grc: "/admin/settings",
  ppm: "/admin/settings?tab=ppm",
  turbolens: "/admin/settings?tab=turbolens",
};

const MODULE_ICON: Record<ModuleKey, string> = {
  archimate: "schema",
  bpm: "schema",
  c4: "account_tree",
  grc: "policy",
  ppm: "rocket_launch",
  turbolens: "psychology",
};

export default function ModuleGate({ module, children }: Props) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { archiMateEnabled, archiMateLoaded } = useArchiMateEnabled();
  const { bpmEnabled, bpmLoaded } = useBpmEnabled();
  const { c4Enabled, c4Loaded } = useC4Enabled();
  const { ppmEnabled, ppmLoaded } = usePpmEnabled();
  const { turboLensEnabled, turboLensLoaded } = useTurboLensReady();
  const { grcEnabled, grcLoaded } = useGrcEnabled();

  const enabled =
    module === "archimate"
      ? archiMateEnabled
      : module === "bpm"
        ? bpmEnabled
        : module === "c4"
          ? c4Enabled
          : module === "ppm"
            ? ppmEnabled
            : module === "grc"
              ? grcEnabled
              : turboLensEnabled;

  const loaded =
    module === "archimate"
      ? archiMateLoaded
      : module === "bpm"
        ? bpmLoaded
        : module === "c4"
          ? c4Loaded
          : module === "ppm"
            ? ppmLoaded
            : module === "grc"
              ? grcLoaded
              : turboLensLoaded;

  if (!loaded) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (enabled) return <>{children}</>;

  const moduleLabel = t(`modules.${module}`);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", mt: { xs: 4, sm: 8 }, px: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Stack alignItems="center" spacing={2}>
          <MaterialSymbol icon={MODULE_ICON[module]} size={56} color="#888" />
          <Typography variant="h5" fontWeight={600}>
            {t("moduleDisabled.title", { module: moduleLabel })}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("moduleDisabled.body", { module: moduleLabel })}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
            <Button variant="outlined" onClick={() => navigate("/")}>
              {t("moduleDisabled.backToDashboard")}
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(SETTINGS_TAB[module])}
              startIcon={<MaterialSymbol icon="settings" size={18} />}
            >
              {t("moduleDisabled.openSettings")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
