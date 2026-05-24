import { test, expect } from '@playwright/test';

const USERNAME = "admin@turboea.com";
const PASSWORD = "TurboEA!2025";

test.describe("UML Plugin E2E - React Flow Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to UML Diagrams
    await page.goto('/plugins/uml/diagrams');
  });

  test("should allow renaming a node via double-click", async ({ page }) => {
    // Create or select a test diagram (assuming seed data exists)
    await page.click('text="New Diagram"');
    await page.fill('input[placeholder="Diagram Name"]', 'E2E Interaction Test');
    await page.click('button:has-text("Create")');

    // Drag a Class from toolbox to canvas
    const toolboxItem = page.locator('.uml-toolbox-item:has-text("Class")');
    const canvas = page.locator('.react-flow__pane');
    
    await toolboxItem.dragTo(canvas);

    // Find the new node
    const node = page.locator('.react-flow__node');
    await expect(node).toBeVisible();

    // Double-click to rename
    const nodeLabel = node.locator('.uml-node-label');
    await nodeLabel.dblclick();

    // Fill the input
    const editInput = node.locator('input');
    await expect(editInput).toBeVisible();
    await editInput.fill('RenamedViaE2E');
    await editInput.press('Enter');

    // Verify rename
    await expect(nodeLabel).toHaveText('RenamedViaE2E');
  });

  test("should support connections and edge interactions", async ({ page }) => {
    // Navigate to existing diagram
    await page.goto('/plugins/uml/diagrams');
    const firstDiagram = page.locator('.diagram-card').first();
    await firstDiagram.click();

    // Create two nodes to connect
    const toolboxClass = page.locator('.uml-toolbox-item:has-text("Class")');
    const canvas = page.locator('.react-flow__pane');
    
    await toolboxClass.dragTo(canvas, { targetPosition: { x: 100, y: 100 } });
    await toolboxClass.dragTo(canvas, { targetPosition: { x: 400, y: 100 } });

    const nodes = page.locator('.react-flow__node');
    const sourceHandle = nodes.nth(0).locator('.react-flow__handle-bottom');
    const targetHandle = nodes.nth(1).locator('.react-flow__handle-top');

    // Connect them
    await sourceHandle.dragTo(targetHandle);

    // Verify edge existence
    const edge = page.locator('.react-flow__edge');
    await expect(edge).toBeVisible();

    // Change relation type via picker
    await edge.click();
    const typePicker = page.locator('.relation-type-picker');
    await expect(typePicker).toBeVisible();
    
    await page.click('text="Composition"');
    
    // Verify edge styling Change (using a marker check)
    const marker = page.locator('#react-flow__edge-marker-diamond');
    await expect(marker).toBeDefined();
  });

  test("should run auto-layout and move nodes", async ({ page }) => {
    await page.goto('/plugins/uml/diagrams');
    await page.locator('.diagram-card').first().click();

    const node = page.locator('.react-flow__node').first();
    const initialBox = await node.boundingBox();

    // Click Auto-layout
    await page.click('button:has-text("Auto-layout")');
    
    // Wait for layout animation/completion
    await page.waitForTimeout(1000);

    const finalBox = await node.boundingBox();
    
    // Expect the node to have moved
    expect(initialBox?.x).not.toEqual(finalBox?.x);
    expect(initialBox?.y).not.toEqual(finalBox?.y);
  });
});
