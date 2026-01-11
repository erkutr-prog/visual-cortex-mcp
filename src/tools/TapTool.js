/**
 * TapTool - Tap on the iOS Simulator screen
 * Supports tapping by coordinates or accessibility identifier/label
 */
import { BaseTool } from "./BaseTool.js";
import { SimulatorService } from "../services/SimulatorService.js";

export class TapTool extends BaseTool {
  constructor(simulatorService) {
    super(
      "tap",
      "Tap on a specific point on the iOS Simulator screen, or tap an element by its accessibility identifier or label. Use this to interact with buttons, links, and other UI elements.",
      {
        type: "object",
        properties: {
          x: {
            type: "number",
            description: "X coordinate to tap (in points). Use with y.",
          },
          y: {
            type: "number",
            description: "Y coordinate to tap (in points). Use with x.",
          },
          id: {
            type: "string",
            description:
              "Accessibility identifier (testID) of the element to tap. Alternative to coordinates.",
          },
          label: {
            type: "string",
            description:
              "Accessibility label of the element to tap. Alternative to coordinates or id.",
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

      // Validate arguments
      const hasCoordinates = args?.x !== undefined && args?.y !== undefined;
      const hasId = args?.id !== undefined;
      const hasLabel = args?.label !== undefined;

      if (!hasCoordinates && !hasId && !hasLabel) {
        return this.createErrorResponse(
          new Error("Missing required arguments"),
          "Provide either coordinates (x, y), accessibility id, or label"
        );
      }

      const result = this.simulatorService.tap({
        x: args.x,
        y: args.y,
        id: args.id,
        label: args.label,
      });

      let description;
      if (hasCoordinates) {
        description = `Tapped at coordinates (${args.x}, ${args.y})`;
      } else if (hasId) {
        description = `Tapped element with id "${args.id}"`;
      } else {
        description = `Tapped element with label "${args.label}"`;
      }

      return this.createTextResponse(`✓ ${description}`);
    } catch (error) {
      return this.createErrorResponse(error, "Failed to tap");
    }
  }
}
