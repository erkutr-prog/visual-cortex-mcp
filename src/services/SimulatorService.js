/**
 * SimulatorService - Single Responsibility: Handle simulator-specific operations
 * Follows Single Responsibility Principle
 */
import { CommandExecutor } from "./CommandExecutor.js";
import { InputValidator } from "../utils/InputValidator.js";

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
      const devices = this.commandExecutor.executeSafeCommand("xcrun", [
        "simctl",
        "list",
        "devices",
        "booted",
      ]);
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

  /**
   * Get the UDID of the first booted simulator
   * @returns {string|null} UDID or null if no simulator is booted
   */
  getBootedUDID() {
    try {
      const output = this.commandExecutor.executeSafeCommand("xcrun", [
        "simctl",
        "list",
        "devices",
        "booted",
      ]);
      const match = output.match(
        /([0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12})/
      );
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Tap at coordinates or by accessibility identifier/label
   * @param {object} options - Tap options
   * @param {number} options.x - X coordinate
   * @param {number} options.y - Y coordinate
   * @param {string} options.id - Accessibility identifier
   * @param {string} options.label - Accessibility label
   * @returns {string} Result message
   */
  tap(options = {}) {
    const udid = this.getBootedUDID();
    if (!udid) {
      throw new Error("No simulator is currently booted");
    }

    // Validate UDID format for extra safety
    const validatedUdid = InputValidator.validateUDID(udid);
    const args = ["axe", "tap", "--udid", validatedUdid];

    if (options.x !== undefined && options.y !== undefined) {
      // Validate coordinates
      const x = InputValidator.validateCoordinate(options.x, "x", 0, 5000);
      const y = InputValidator.validateCoordinate(options.y, "y", 0, 5000);
      args.push("-x", String(x), "-y", String(y));
    } else if (options.id) {
      // Validate accessibility ID to prevent injection
      const validatedId = InputValidator.validateAccessibilityId(options.id);
      args.push("--id", validatedId);
    } else if (options.label) {
      // Validate accessibility label to prevent injection
      const validatedLabel = InputValidator.validateAccessibilityLabel(
        options.label
      );
      args.push("--label", validatedLabel);
    } else {
      throw new Error(
        "Must provide either coordinates (x, y), accessibility id, or label"
      );
    }

    const result = this.commandExecutor.execute(args, { encoding: "utf8" });
    return result.stdout || "Tap completed";
  }

  /**
   * Swipe from one point to another
   * @param {object} options - Swipe options
   * @param {number} options.startX - Starting X coordinate
   * @param {number} options.startY - Starting Y coordinate
   * @param {number} options.endX - Ending X coordinate
   * @param {number} options.endY - Ending Y coordinate
   * @param {number} options.duration - Duration in seconds
   * @returns {string} Result message
   */
  swipe(options) {
    const udid = this.getBootedUDID();
    if (!udid) {
      throw new Error("No simulator is currently booted");
    }

    // Validate all inputs
    const validatedUdid = InputValidator.validateUDID(udid);
    const startX = InputValidator.validateCoordinate(
      options.startX,
      "startX",
      0,
      5000
    );
    const startY = InputValidator.validateCoordinate(
      options.startY,
      "startY",
      0,
      5000
    );
    const endX = InputValidator.validateCoordinate(
      options.endX,
      "endX",
      0,
      5000
    );
    const endY = InputValidator.validateCoordinate(
      options.endY,
      "endY",
      0,
      5000
    );

    const args = [
      "axe",
      "swipe",
      "--start-x",
      String(startX),
      "--start-y",
      String(startY),
      "--end-x",
      String(endX),
      "--end-y",
      String(endY),
      "--udid",
      validatedUdid,
    ];

    if (options.duration !== undefined) {
      const duration = InputValidator.validateDuration(options.duration);
      args.push("--duration", String(duration));
    }

    const result = this.commandExecutor.execute(args, { encoding: "utf8" });
    return result.stdout || "Swipe completed";
  }

  /**
   * Perform a preset gesture (scroll, swipe from edge, etc.)
   * @param {string} preset - Gesture preset name
   * @param {object} options - Optional gesture options
   * @returns {string} Result message
   */
  gesture(preset, options = {}) {
    const udid = this.getBootedUDID();
    if (!udid) {
      throw new Error("No simulator is currently booted");
    }

    // Whitelist of valid presets - this IS the validation
    const validPresets = [
      "scroll-up",
      "scroll-down",
      "scroll-left",
      "scroll-right",
      "swipe-from-left-edge",
      "swipe-from-right-edge",
      "swipe-from-top-edge",
      "swipe-from-bottom-edge",
    ];

    if (!validPresets.includes(preset)) {
      throw new Error(
        `Invalid gesture preset. Valid options: ${validPresets.join(", ")}`
      );
    }

    const validatedUdid = InputValidator.validateUDID(udid);
    const args = ["axe", "gesture", preset, "--udid", validatedUdid];

    if (options.duration !== undefined) {
      const duration = InputValidator.validateDuration(options.duration);
      args.push("--duration", String(duration));
    }

    const result = this.commandExecutor.execute(args, { encoding: "utf8" });
    return result.stdout || `Gesture ${preset} completed`;
  }

  /**
   * Type text into the simulator
   * @param {string} text - Text to type
   * @returns {string} Result message
   */
  typeText(text) {
    const udid = this.getBootedUDID();
    if (!udid) {
      throw new Error("No simulator is currently booted");
    }

    // Validate text to prevent command injection
    const validatedText = InputValidator.validateTypeText(text);
    const validatedUdid = InputValidator.validateUDID(udid);

    const result = this.commandExecutor.execute(
      ["axe", "type", validatedText, "--udid", validatedUdid],
      { encoding: "utf8" }
    );
    return result.stdout || "Text typed successfully";
  }

  /**
   * Get the UI accessibility hierarchy
   * @returns {object} Parsed UI hierarchy JSON
   */
  describeUI() {
    const udid = this.getBootedUDID();
    if (!udid) {
      throw new Error("No simulator is currently booted");
    }

    const validatedUdid = InputValidator.validateUDID(udid);

    const result = this.commandExecutor.execute(
      ["axe", "describe-ui", "--udid", validatedUdid],
      { encoding: "utf8" }
    );

    return JSON.parse(result.stdout);
  }
}
