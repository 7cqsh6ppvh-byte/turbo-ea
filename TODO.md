# TODO

## Goal

Implement ArchiMate relationship validation in the ArchiMate diagram editor (ReactFlow-based). When users connect elements, show only valid relationship types per ArchiMate 3.2 spec, and prompt to create missing valid relation types.

## Tasks

### 1. Update ArchimateRelationSelector to filter valid relations
- [x] Read current `ArchimateRelationSelector.tsx` - shows all 11 relations without filtering
- [ ] Import `isValidArchimateRelation` and `getValidRelationKeys` from `AllowedArchiMateRelations.ts`
- [ ] Filter relation types based on source/target element type keys
- [ ] Show "No valid relations" message when none match ArchiMate spec
- [ ] Add create-missing-relation button when valid relations exist but none registered in metamodel

### 2. Add "Create Missing Relation" dialog for ArchiMate
- [ ] Create `ArchimateMissingRelationDialog.tsx`:
  - User draws edge between ArchiMate elements
  - Relation is valid per ArchiMate spec but NOT registered in Turbo EA metamodel
  - Dialog: "The [relation name] relationship is valid in ArchiMate between [source] and [target] but is not yet enabled in this workspace. Create it?"
  - On confirm: call `POST /api/v1/archimate/relation-types`
  - On success: toast "The [relation name] relationship has been created. Please draw the edge again."
  - Non-admin users: show toast "This ArchiMate relation is valid but requires admin permission to enable."

### 3. Create backend API endpoint for ad-hoc ArchiMate relation type creation
- [ ] New route: `POST /api/v1/archimate/relation-types` (in archimate.py)
- [ ] Request body: `{ source_type_key, target_type_key, relation_name }`
- [ ] Validates: admin permission, both types exist, relation is valid per ArchiMate spec
- [ ] Creates `RelationType` with:
  - `key=arch_rel_{source}_{target}_{relation}` or simpler format
  - `plugin_id="archimate"`, `built_in=False`
  - Injects `reverse_label` automatically
- [ ] Returns created `RelationType`

### 4. Update ArchimateCanvas to integrate relation selector
- [x] Read current `onConnect` callback - defaults to Association without selection
- [ ] When edge is drawn, show `ArchimateRelationSelector` dialog
- [ ] Pass source/target element type keys to the selector
- [ ] On selection, update edge with chosen relation type
- [ ] Handle "missing relation" case: show `ArchimateMissingRelationDialog`

### 5. Add translations for new UI strings
- [ ] Add translation keys for ArchiMate relation selector and missing relation dialog
- [ ] Update all 8 locale files (en, de, fr, es, it, pt, zh, ru)

### 6. Create tests
- [ ] Unit tests for `AllowedArchiMateRelations.ts`
- [ ] Tests for `ArchimateRelationSelector` filtering logic
- [ ] Tests for backend relation creation endpoint

## Notes
- **Archimate editor uses ReactFlow** (not DrawIO) - the `onConnect` callback in `ArchimateCanvas.tsx` handles edge creation
- The `archimateShapes.ts` already defines all 11 ArchiMate relation types with their visual styles
- The `AllowedArchiMateRelations.ts` file contains the full ArchiMate 3.2 relationship matrix
- The seed data has representative pairs but we validate dynamically and can create missing relations
- ArchiMate elements use `arch_` prefix (e.g., `arch_ApplicationComponent`)