/**
 * ScreenshotTool - Single Responsibility: Handle screenshot operations
 * Follows Single Responsibility Principle and Liskov Substitution Principle
 */
import { BaseTool } from "./BaseTool.js";
import { SimulatorService } from "../services/SimulatorService.js";

export class ScreenshotTool extends BaseTool {
  constructor(simulatorService) {
    super(
      "get_screenshot",
      "Take a screenshot of the currently running iOS Simulator to see the UI. Use this when the user asks you to check visual alignment, colors, or layout bugs.",
      {
        type: "object",
        properties: {},
      }
    );
    this.simulatorService = simulatorService || new SimulatorService();
  }

  async execute(args) {
    try {
      if (!this.simulatorService.isSimulatorBooted()) {
        return this.createErrorResponse(
          new Error("No iOS Simulator is currently running"),
          "Error: Please launch a simulator first"
        );
      }

      const buffer = this.simulatorService.takeScreenshot();
      const base64Image = buffer.toString("base64");

      return this.createImageResponse(
        base64Image,
        "image/png",
        "Here is the current screen of the iOS Simulator."
      );
    } catch (error) {
      return this.createErrorResponse(error, "Failed to take screenshot");
    }
  }
}
