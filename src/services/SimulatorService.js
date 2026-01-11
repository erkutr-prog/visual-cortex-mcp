/**
 * SimulatorService - Single Responsibility: Handle simulator-specific operations
 * Follows Single Responsibility Principle
 */
import { CommandExecutor } from "./CommandExecutor.js";

export class SimulatorService {
  constructor(commandExecutor) {
    this.commandExecutor = commandExecutor || new CommandExecutor();
  }

  /**
   * Check if any simulator is booted
   * @returns {boolean}
   */
  isSimulatorBooted() {
    try {
      const devices = this.commandExecutor.executeSync(
        "xcrun simctl list devices booted"
      );
      return devices.includes("Booted");
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of all devices
   * @returns {object} Parsed device data
   */
  async getDevices() {
    const result = this.commandExecutor.execute([
      "xcrun",
      "simctl",
      "list",
      "devices",
      "--json",
    ]);

    return JSON.parse(result.stdout);
  }

  /**
   * Take a screenshot of the booted simulator
   * @returns {Buffer} PNG image buffer
   */
  takeScreenshot() {
    const result = this.commandExecutor.execute(
      ["xcrun", "simctl", "io", "booted", "screenshot", "-"],
      {
        encoding: null,
        maxBuffer: 10 * 1024 * 1024,
      }
    );

    return result.stdout;
  }
}
