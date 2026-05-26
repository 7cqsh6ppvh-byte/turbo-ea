import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { useMetamodel } from "@/hooks/useMetamodel";
import { ArchimateElementsTree } from "./ArchimateElementsTree";
import { ArchimateViewsTree } from "./ArchimateViewsTree";
import { ArchimateElementPalette } from "./ArchimateElementPalette";

type DiagramMode = "ea" | "archimate";
type SidebarTab = "elements" | "views" | "palette";

interface Props {
  currentDiagramId: string;
  nodeCardIds: Set<string>;
}

export function ArchimateLeftSidebar({ currentDiagramId, nodeCardIds }: Props) {
  const { t } = useTranslation("archimate");
  const { types } = useMetamodel();
  const [tab, setTab] = useState<SidebarTab>("elements");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<DiagramMode>("ea");

  const hasArch = useMemo(
    () => types.some((t) => t.key.startsWith("arch_") && !t.is_hidden),
    [types],
  );
  const hasStandard = useMemo(
    () => types.some((t) => !t.key.startsWith("arch_") && !t.is_hidden),
    [types],
  );
  const showSwitcher = hasArch && hasStandard;

  const activeTypes = useMemo(
    () =>
      types.filter(
        (t) =>
          !t.is_hidden &&
          (mode === "archimate" ? t.key.startsWith("arch_") : !t.key.startsWith("arch_")),
      ),
    [types, mode],
  );

  const handleModeChange = (_: unknown, next: DiagramMode | null) => {
    if (!next) return;
    setMode(next);
    setTab("elements");
    setSearch("");
  };

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      {showSwitcher && (
        <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
            fullWidth
          >
            <ToggleButton value="ea" sx={{ fontSize: "11px", py: 0.5 }}>
              {t("sidebar.modeEa")}
            </ToggleButton>
            <ToggleButton value="archimate" sx={{ fontSize: "11px", py: 0.5 }}>
              {t("sidebar.modeArchimate")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: "divider", minHeight: 36 }}
      >
        <Tab value="elements" label={t("sidebar.elementsTab")} sx={{ fontSize: "11px", minHeight: 36, py: 0 }} />
        <Tab value="views" label={t("sidebar.viewsTab")} sx={{ fontSize: "11px", minHeight: 36, py: 0 }} />
        <Tab value="palette" label={t("sidebar.paletteTab")} sx={{ fontSize: "11px", minHeight: 36, py: 0 }} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {tab === "elements" && (
          <ArchimateElementsTree
            activeTypes={activeTypes}
            nodeCardIds={nodeCardIds}
            search={search}
            onSearchChange={setSearch}
          />
        )}
        {tab === "views" && <ArchimateViewsTree currentDiagramId={currentDiagramId} />}
        {tab === "palette" && <ArchimateElementPalette activeTypes={activeTypes} />}
      </Box>
    </Box>
  );
}
