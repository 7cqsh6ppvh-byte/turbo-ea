import { lazy } from 'react';

export const UmlPlugin = {
  name: "uml-diagrams",
  routes: [
    {
      path: "/workspace/:workspaceId/uml-diagrams",
      component: lazy(() => import("./pages/UmlDiagramList")),
    },
    {
      path: "/workspace/:workspaceId/uml-diagrams/:diagramId",
      component: lazy(() => import("./pages/UmlCanvasEditor")),
    },
  ],
  navItems: [
    {
      label: "UML Diagrams",
      icon: "AccountTree",
      path: "/uml-diagrams",
      requiredPermission: "uml_diagrams.view",
    },
  ],
};

export default UmlPlugin;
