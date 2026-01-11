/**
 * ListDevicesTool - Single Responsibility: Handle device listing operations
 * Follows Single Responsibility Principle and Liskov Substitution Principle
 */
import { BaseTool } from "./BaseTool.js";
import { SimulatorService } from "../services/SimulatorService.js";
import { DeviceFormatter } from "../utils/DeviceFormatter.js";

export class ListDevicesTool extends BaseTool {
  constructor(simulatorService) {
    super(
      "list_devices",
      "List all available iOS Simulators with their status (Booted/Shutdown), UDID, and runtime version. Useful for discovering which simulators are available and which one is currently running.",
      {
        type: "object",
        properties: {
          available_only: {
            type: "boolean",
            description:
              "If true, only show available devices (not those with runtime errors). Default is false.",
          },
        },
      }
    );
    this.simulatorService = simulatorService || new SimulatorService();
  }

  async execute(args) {
    try {
      const availableOnly = args?.available_only || false;

      const devicesData = await this.simulatorService.getDevices();
      const devices = DeviceFormatter.parseDevices(devicesData, availableOnly);
      const sortedDevices = DeviceFormatter.sortDevices(devices);
      const formattedOutput = DeviceFormatter.formatDevices(sortedDevices);

      return this.createTextResponse(formattedOutput);
    } catch (error) {
      return this.createErrorResponse(error, "Failed to list devices");
    }
  }
}
