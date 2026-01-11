/**
 * TypeTextTool - Type text into the iOS Simulator
 * Types characters using HID keyboard simulation
 */
import { BaseTool } from "./BaseTool.js";
import { SimulatorService } from "../services/SimulatorService.js";

export class TypeTextTool extends BaseTool {
  constructor(simulatorService) {
    super(
      "type_text",
      "Type text into the currently focused text field on the iOS Simulator. Supports US keyboard characters (A-Z, a-z, 0-9, and common symbols). Make sure a text field is focused before typing.",
      {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The text to type into the simulator.",
          },
        },
        required: ["text"],
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

      if (!args?.text) {
        return this.createErrorResponse(
          new Error("Missing required argument: text"),
          "Please provide text to type"
        );
      }

      const result = this.simulatorService.typeText(args.text);

      // Truncate display if text is very long
      const displayText =
        args.text.length > 50 ? args.text.substring(0, 47) + "..." : args.text;

      return this.createTextResponse(`✓ Typed: "${displayText}"`);
    } catch (error) {
      return this.createErrorResponse(error, "Failed to type text");
    }
  }
}
