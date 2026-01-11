/**
 * SwipeTool - Swipe or scroll on the iOS Simulator screen
 * Supports both coordinate-based swipes and preset gestures
 */
import { BaseTool } from "./BaseTool.js";
import { SimulatorService } from "../services/SimulatorService.js";

export class SwipeTool extends BaseTool {
  constructor(simulatorService) {
    super(
      "swipe",
      "Perform a swipe or scroll gesture on the iOS Simulator. Use preset gestures like 'scroll-up', 'scroll-down', or provide custom coordinates for precise control.",
      {
        type: "object",
        properties: {
          direction: {
            type: "string",
            enum: [
              "scroll-up",
              "scroll-down",
              "scroll-left",
              "scroll-right",
              "swipe-from-left-edge",
              "swipe-from-right-edge",
              "swipe-from-top-edge",
              "swipe-from-bottom-edge",
            ],
            description:
              "Preset gesture direction. Use this for common gestures like scrolling.",
          },
          startX: {
            type: "number",
            description:
              "Starting X coordinate for custom swipe. Use with startY, endX, endY.",
          },
          startY: {
            type: "number",
            description:
              "Starting Y coordinate for custom swipe. Use with startX, endX, endY.",
          },
          endX: {
            type: "number",
            description:
              "Ending X coordinate for custom swipe. Use with startX, startY, endY.",
          },
          endY: {
            type: "number",
            description:
              "Ending Y coordinate for custom swipe. Use with startX, startY, endX.",
          },
          duration: {
            type: "number",
            description: "Duration of the swipe in seconds. Default is ~0.5s.",
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

      // Check if using preset gesture
      if (args?.direction) {
        const result = this.simulatorService.gesture(args.direction, {
          duration: args.duration,
        });
        return this.createTextResponse(`✓ Performed ${args.direction} gesture`);
      }

      // Check if using custom coordinates
      const hasCoordinates =
        args?.startX !== undefined &&
        args?.startY !== undefined &&
        args?.endX !== undefined &&
        args?.endY !== undefined;

      if (!hasCoordinates) {
        return this.createErrorResponse(
          new Error("Missing required arguments"),
          "Provide either 'direction' for preset gestures, or all coordinates (startX, startY, endX, endY) for custom swipe"
        );
      }

      const result = this.simulatorService.swipe({
        startX: args.startX,
        startY: args.startY,
        endX: args.endX,
        endY: args.endY,
        duration: args.duration,
      });

      return this.createTextResponse(
        `✓ Swiped from (${args.startX}, ${args.startY}) to (${args.endX}, ${args.endY})`
      );
    } catch (error) {
      return this.createErrorResponse(error, "Failed to swipe");
    }
  }
}
