/**
 * ModuleGate — wraps a route element for an optional module and renders a
 * friendly "module disabled" placeholder when the admin has turned the module
 * off, instead of letting the page load and issue API calls that would fail.
 *
 * Adding a new module requires only one change: add an entry to
 * src/config/modules.ts.  This component derives all its behaviour (icon,
 * settings tab, enabled state) from the MODULE_MAP registry — no edits here.
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
import { useModules } from "@/hooks/useModules";
import { MODULE_MAP, type ModuleKey } from "@/config/modules";

interface Props {
  module: ModuleKey;
  children: React.ReactNode;
}

export default function ModuleGate({ module, children }: Props) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { isEnabled, isLoaded } = useModules();

  const def = MODULE_MAP[module];

  // Wait for the first fetch to resolve before deciding — prevents the
  // disabled placeholder from flashing while the status request is in flight.
  if (!isLoaded(module)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEnabled(module)) return <>{children}</>;

  const moduleLabel = t(`modules.${module}`);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", mt: { xs: 4, sm: 8 }, px: 2 }}>
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Stack alignItems="center" spacing={2}>
          <MaterialSymbol icon={def.icon} size={56} color="#888" />
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
              onClick={() => navigate(def.settingsTab)}
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
