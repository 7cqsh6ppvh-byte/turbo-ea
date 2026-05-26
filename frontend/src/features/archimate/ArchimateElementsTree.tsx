import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import MaterialSymbol from "@/components/MaterialSymbol";
import type { CardType } from "@/types";
import { useResolveMetaLabel } from "@/hooks/useResolveLabel";
import { useCardSearch } from "@/features/diagrams/useCardSearch";

interface Props {
  activeTypes: CardType[];
  nodeCardIds: Set<string>;
  search: string;
  onSearchChange: (v: string) => void;
}

function displayCategory(category: string): string {
  return category.startsWith("ArchiMate:") ? category.slice("ArchiMate:".length) : category;
}

export function ArchimateElementsTree({
  activeTypes,
  nodeCardIds,
  search,
  onSearchChange,
}: Props) {
  const { t } = useTranslation("archimate");
  const rml = useResolveMetaLabel();
  const typeKeys = useMemo(() => activeTypes.map((t) => t.key), [activeTypes]);
  const typeMap = useMemo(
    () => new Map(activeTypes.map((t) => [t.key, t])),
    [activeTypes],
  );

  const { items, total, loading, hasMore, loadMore } = useCardSearch({
    types: typeKeys,
    search,
    enabled: typeKeys.length > 0,
    pageSize: 500,
  });

  const groups = useMemo(() => {
    const catMap = new Map<string, Map<string, typeof items>>();
    for (const card of items) {
      const ct = typeMap.get(card.type);
      if (!ct) continue;
      const cat = ct.category ?? "Other";
      if (!catMap.has(cat)) catMap.set(cat, new Map());
      const typeGroup = catMap.get(cat)!;
      if (!typeGroup.has(card.type)) typeGroup.set(card.type, []);
      typeGroup.get(card.type)!.push(card);
    }

    const categoryOrder = [...new Set(activeTypes.map((t) => t.category ?? "Other"))];
    return categoryOrder
      .map((cat) => ({
        category: cat,
        typeGroups: [...(catMap.get(cat)?.entries() ?? [])].map(([typeKey, cards]) => ({
          typeKey,
          cardType: typeMap.get(typeKey)!,
          cards,
        })),
      }))
      .filter((g) => g.typeGroups.length > 0);
  }, [items, typeMap, activeTypes]);

  const [expandedCat, setExpandedCat] = useState<string | false>(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Box sx={{ p: 1.5, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={t("sidebar.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MaterialSymbol icon="search" size={16} color="#999" />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiInputBase-input": { fontSize: "12px" } }}
        />
        {!loading && items.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, px: 0.5 }}>
            {hasMore
              ? t("sidebar.showingOf", { loaded: items.length, total })
              : t("sidebar.cardsCount", { count: total })}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading && items.length === 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {!loading && items.length === 0 && typeKeys.length > 0 && (
          <Box sx={{ textAlign: "center", py: 4, color: "text.disabled" }}>
            <MaterialSymbol icon="search_off" size={28} color="#bbb" />
            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
              {search ? t("sidebar.noCardsMatch") : t("sidebar.noCardsFound")}
            </Typography>
          </Box>
        )}

        {groups.map(({ category, typeGroups }) => (
          <Accordion
            key={category}
            expanded={expandedCat === category}
            onChange={(_, open) => setExpandedCat(open ? category : false)}
            disableGutters
            elevation={0}
            sx={{ "&:before": { display: "none" }, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <AccordionSummary
              sx={{
                minHeight: 32,
                px: 1.5,
                "& .MuiAccordionSummary-content": { my: 0.25 },
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "10px", color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {displayCategory(category)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              {typeGroups.map(({ typeKey, cardType, cards }) => (
                <Box key={typeKey}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 2,
                      py: 0.5,
                      bgcolor: "rgba(0,0,0,0.03)",
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "3px",
                        bgcolor: cardType.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MaterialSymbol icon={cardType.icon} size={9} color="#fff" />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "11px" }}>
                      {rml(typeKey, cardType.translations, "label")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", fontSize: "10px" }}>
                      {cards.length}
                    </Typography>
                  </Box>

                  {cards.map((card) => {
                    const onCanvas = nodeCardIds.has(card.id);
                    return (
                      <Box
                        key={card.id}
                        draggable
                        aria-label={`${card.name}${onCanvas ? ` — ${t("sidebar.alreadyInDiagram")}` : ""}`}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "archimate/existing-card",
                            JSON.stringify({ cardId: card.id, typeKey: card.type, name: card.name }),
                          );
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 0.5,
                          cursor: "grab",
                          opacity: onCanvas ? 0.6 : 1,
                          borderBottom: "1px solid rgba(0,0,0,0.04)",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Typography variant="caption" sx={{ flex: 1, fontSize: "11px", lineHeight: 1.3 }} noWrap>
                          {card.name}
                        </Typography>
                        {onCanvas && (
                          <Chip
                            label="✓"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: "9px",
                              bgcolor: "success.light",
                              color: "#fff",
                              "& .MuiChip-label": { px: 0.5 },
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}

        {hasMore && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              py: 1.5,
              color: "text.secondary",
              cursor: "pointer",
            }}
            onClick={loadMore}
          >
            <CircularProgress size={14} />
            <Typography variant="caption">{t("sidebar.loadingMore")}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
