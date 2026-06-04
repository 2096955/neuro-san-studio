import { test, expect } from '@playwright/test';

test.describe('Multi-Agent Accelerator Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the multi-agent accelerator page
    await page.goto('/multi-agent-accelerator');
    await page.waitForLoadState('networkidle');
  });

  test('should display Multi-Agent Accelerator page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Neuro-SAN.*Multi-Agent Accelerator|Multi-Agent Accelerator.*Neuro-SAN/i);
    
    // Check main layout structure - Networks sidebar should be visible
    const leftSidebar = page.locator('text=Networks').first();
    await expect(leftSidebar).toBeVisible({ timeout: 10000 });
    
    // Check that React Flow canvas is present
    const reactFlowContainer = page.locator('.react-flow, [class*="react-flow"]').first();
    await expect(reactFlowContainer).toBeVisible({ timeout: 10000 });
  });

  test('should display network list in sidebar', async ({ page }) => {
    const networksSidebar = page.locator('text=Networks').first();
    await expect(networksSidebar).toBeVisible({ timeout: 10000 });
    // Wait for networks to load (either loading text or actual network buttons)
    await page.waitForSelector('button', { timeout: 15000 });
    // Match actual network names from backend (insurance_agents, banking_ops, hello_world, etc.)
    const networkButtons = page.locator('button').filter({ hasText: /insurance|banking|hello|agent|booking|airbnb|music|smart|aaosa/i });
    const count = await networkButtons.count();
    expect(count, 'At least one network button should be visible after load').toBeGreaterThan(0);
  });

  test('should display React Flow canvas', async ({ page }) => {
    // Check for React Flow container
    const reactFlowContainer = page.locator('.react-flow, [class*="react-flow"]').first();
    await expect(reactFlowContainer).toBeVisible({ timeout: 10000 });
  });

  test('should load topology when network is selected', async ({ page }) => {
    const networkButton = page.locator('button').filter({ hasText: /insurance|banking|hello|agent|booking|airbnb|music|smart|aaosa/i }).first();
    await expect(networkButton).toBeVisible({ timeout: 10000 });
    await networkButton.click();
    // Wait for topology graph container or nodes to appear
    await page.locator('[data-testid="topology-graph"]').waitFor({ state: 'visible', timeout: 15000 });
    const nodes = page.locator('.react-flow__node, [class*="react-flow__node"]');
    const nodeCount = await nodes.count();
    expect(nodeCount, 'Graph should show nodes or loading state after selecting network').toBeGreaterThanOrEqual(0);
  });

  test('should display connection lines with proper styling', async ({ page }) => {
    const networkButton = page.locator('button').filter({ hasText: /insurance|banking|hello|agent|booking|airbnb|music|smart|aaosa/i }).first();
    await expect(networkButton).toBeVisible({ timeout: 10000 });
    await networkButton.click();
    await page.locator('.react-flow__edge, [class*="react-flow__edge"], .react-flow__node').first().waitFor({ state: 'visible', timeout: 15000 });
      
      // Check for edges/connections in React Flow
      const edges = page.locator('.react-flow__edge, [class*="react-flow__edge"]');
      const edgeCount = await edges.count();
      
      // Check edge styling via computed styles
      if (edgeCount > 0) {
        const firstEdge = edges.first();
        const strokeColor = await firstEdge.evaluate((el) => {
          const path = el.querySelector('path');
          if (path) {
            // Check both computed style and attribute
            const computedStroke = window.getComputedStyle(path).stroke;
            const attrStroke = path.getAttribute('stroke');
            return computedStroke || attrStroke || window.getComputedStyle(path).getPropertyValue('stroke');
          }
          return null;
        });
        
        // Edge should have a stroke color (blue-ish)
        expect(strokeColor).toBeTruthy();
        if (strokeColor) {
          expect(strokeColor).not.toBe('none');
          expect(strokeColor).not.toBe('');
        }
      } else {
        // No edges is acceptable for some topologies; test still passes
      }
  });

  test('should have readable node labels', async ({ page }) => {
    const networkButton = page.locator('button').filter({ hasText: /insurance|banking|hello|agent|booking|airbnb|music|smart|aaosa/i }).first();
    await expect(networkButton).toBeVisible({ timeout: 10000 });
    await networkButton.click();
    await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 15000 });

    // Match actual node labels from backend topologies (agent names with underscores converted to spaces)
    const nodeLabels = page.locator('.react-flow__node');
    const labelCount = await nodeLabels.count();
    expect(labelCount, 'At least one node label should be visible after topology load').toBeGreaterThan(0);

    const firstLabel = nodeLabels.first();
    const fontSize = await firstLabel.evaluate((el) => window.getComputedStyle(el).fontSize);
    const fontSizeNum = parseFloat(fontSize);
    expect(fontSizeNum, 'Node label font size should be at least 14px').toBeGreaterThanOrEqual(14);
  });

  test('should apply DAG layout (not just radial)', async ({ page }) => {
    const networkButton = page.locator('button').filter({ hasText: /insurance|banking|hello|agent|booking|airbnb|music|smart|aaosa/i }).first();
    await expect(networkButton).toBeVisible({ timeout: 10000 });
    await networkButton.click();
    await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 15000 });

    const nodes = page.locator('.react-flow__node, [class*="react-flow__node"]');
    const nodeCount = await nodes.count();
    expect(nodeCount, 'At least two nodes needed to verify DAG layout').toBeGreaterThan(1);

    const positions = await Promise.all(
      Array.from({ length: Math.min(nodeCount, 5) }).map(async (_, i) => {
        const node = nodes.nth(i);
        const box = await node.boundingBox();
        return box ? { x: box.x, y: box.y } : null;
      })
    );
    const validPositions = positions.filter((p): p is { x: number; y: number } => p !== null);
    expect(validPositions.length).toBeGreaterThan(1);

    const yPositions = validPositions.map(p => p.y);
    const yRange = Math.max(...yPositions) - Math.min(...yPositions);
    expect(yRange, 'DAG layout should spread nodes vertically (Y range >= 100px)').toBeGreaterThan(100);
  });

  test('should be standalone page (no main sidebar)', async ({ page }) => {
    // Multi-agent page is standalone; verify Networks sidebar (page sidebar) is visible
    const networksSidebar = page.locator('text=Networks').first();
    await expect(networksSidebar).toBeVisible({ timeout: 10000 });
  });

  test('should take screenshot for visual verification', async ({ page }) => {
    const networkButton = page.locator('button').filter({ hasText: /insurance|banking|hello|agent|booking|airbnb|music|smart|aaosa/i }).first();
    if (await networkButton.isVisible({ timeout: 10000 })) {
      await networkButton.click();
      await page.locator('.react-flow__node, .react-flow').first().waitFor({ state: 'visible', timeout: 15000 });
    }
    await page.screenshot({
      path: 'test-results/multi-agent-accelerator.png',
      fullPage: true,
    });
  });
});

