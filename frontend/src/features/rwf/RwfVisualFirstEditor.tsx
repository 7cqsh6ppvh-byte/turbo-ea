/**
 * RwfVisualFirstEditor — thin route wrapper that reads branchId and diagramId
 * from the RWF workspace route params and renders VisualFirstDiagramEditor in
 * branch-scoped mode.
 *
 * Route: /rwf/branches/:id/workspace/visualfirst/:did
 */
import { useParams } from "react-router-dom";
import { VisualFirstDiagramEditor } from "@/features/visualfirst/VisualFirstDiagramEditor";

export default function RwfVisualFirstEditor() {
  const { id: branchId, did: diagramId } = useParams<{ id: string; did: string }>();

  return (
    <VisualFirstDiagramEditor
      branchId={branchId}
      diagramId={diagramId}
    />
  );
}
