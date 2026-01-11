/**
 * DescribeUITool - Get the accessibility hierarchy of the current screen
 * Returns UI elements with their labels, identifiers, and frames
 */
import { BaseTool } from "./BaseTool.js";
import { SimulatorService } from "../services/SimulatorService.js";

export class DescribeUITool extends BaseTool {
  constructor(simulatorService) {
    super(
      "describe_ui",
      "Get the accessibility hierarchy of the current iOS Simulator screen. Returns all visible UI elements with their accessibility labels, identifiers, types, and positions. Useful for discovering element identifiers for tapping or understanding the current screen state.",
      {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["summary", "full"],
            description:
              "Output format: 'summary' for a readable list of interactive elements, 'full' for complete JSON hierarchy. Default is 'summary'.",
          },
        },
      }
    );
    this.simulatorService = simulatorService || new SimulatorService();
  }

  async execute(args) {
    try {
      if (!this.simulatorService.isSimulatorBooted()) {
        return this.createErrorResponse(
          new Error("No iOS Simulator is currently running"),
          "Please launch a simulator first"
        );
      }

      const format = args?.format || "summary";
      const uiHierarchy = this.simulatorService.describeUI();

      if (format === "full") {
        return this.createTextResponse(JSON.stringify(uiHierarchy, null, 2));
      }

      // Summary format: extract key elements
      const elements = this.extractElements(uiHierarchy);
      const output = this.formatSummary(elements);

      return this.createTextResponse(output);
    } catch (error) {
      return this.createErrorResponse(error, "Failed to describe UI");
    }
  }

  /**
   * Recursively extract elements from the UI hierarchy
   */
  extractElements(nodes, elements = []) {
    if (!Array.isArray(nodes)) {
      nodes = [nodes];
    }

    for (const node of nodes) {
      // Skip if not a valid node
      if (!node || typeof node !== "object") continue;

      // Extract relevant info
      const element = {
        type: node.type || node.role,
        label: node.AXLabel,
        id: node.AXUniqueId,
        value: node.AXValue,
        enabled: node.enabled,
        frame: node.frame,
      };

      // Only include elements with labels or IDs (interactive elements)
      if (element.label || element.id) {
        elements.push(element);
      }

      // Recursively process children
      if (node.children && Array.isArray(node.children)) {
        this.extractElements(node.children, elements);
      }
    }

    return elements;
  }

  /**
   * Format elements into a readable summary
   */
  formatSummary(elements) {
    if (elements.length === 0) {
      return "No accessible elements found on the current screen.";
    }

    let output = `📱 Found ${elements.length} accessible elements:\n\n`;

    // Group by type
    const grouped = {};
    for (const el of elements) {
      const type = el.type || "Unknown";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(el);
    }

    for (const [type, items] of Object.entries(grouped)) {
      output += `**${type}** (${items.length})\n`;

      for (const item of items) {
        const label = item.label ? `"${item.label}"` : "(no label)";
        const id = item.id ? `id="${item.id}"` : "";
        const position = item.frame
          ? `at (${Math.round(item.frame.x)}, ${Math.round(item.frame.y)})`
          : "";
        const enabled = item.enabled === false ? "[disabled]" : "";

        output += `  • ${label} ${id} ${position} ${enabled}\n`.trim() + "\n";
      }
      output += "\n";
    }

    output +=
      "\n💡 Tip: Use the 'tap' tool with --label or --id to interact with elements.";

    return output;
  }
}
