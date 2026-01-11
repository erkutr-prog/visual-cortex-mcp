/**
 * DeviceFormatter - Single Responsibility: Format device data for display
 * Follows Single Responsibility Principle
 */
export class DeviceFormatter {
  /**
   * Extract iOS version from runtime string
   * @param {string} runtime - Runtime identifier
   * @returns {string} Formatted iOS version
   */
  static extractIOSVersion(runtime) {
    const runtimeMatch = runtime.match(/iOS-(\d+)-(\d+)/);
    return runtimeMatch ? `iOS ${runtimeMatch[1]}.${runtimeMatch[2]}` : runtime;
  }

  /**
   * Parse devices from simctl JSON output
   * @param {object} devicesData - Raw device data from simctl
   * @param {boolean} availableOnly - Filter unavailable devices
   * @returns {Array} Parsed device array
   */
  static parseDevices(devicesData, availableOnly = false) {
    const devices = [];

    for (const [runtime, deviceList] of Object.entries(
      devicesData.devices || {}
    )) {
      for (const device of deviceList) {
        if (availableOnly && !device.isAvailable) {
          continue;
        }

        devices.push({
          name: device.name,
          udid: device.udid,
          state: device.state,
          runtime: this.extractIOSVersion(runtime),
          isAvailable: device.isAvailable,
          deviceType: device.deviceTypeIdentifier,
        });
      }
    }

    return devices;
  }

  /**
   * Sort devices: booted first, then alphabetically
   * @param {Array} devices - Device array
   * @returns {Array} Sorted devices
   */
  static sortDevices(devices) {
    return [...devices].sort((a, b) => {
      if (a.state === "Booted" && b.state !== "Booted") return -1;
      if (a.state !== "Booted" && b.state === "Booted") return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Format devices for display
   * @param {Array} devices - Device array
   * @returns {string} Formatted output
   */
  static formatDevices(devices) {
    let output = `Found ${devices.length} iOS Simulator${
      devices.length !== 1 ? "s" : ""
    }:\n\n`;

    for (const device of devices) {
      const statusIcon = device.state === "Booted" ? "🟢" : "⚪";
      const statusText = device.state === "Booted" ? "BOOTED" : device.state;
      const availableText = device.isAvailable ? "" : " (⚠️ Unavailable)";

      output += `${statusIcon} **${device.name}** (${device.runtime})${availableText}\n`;
      output += `   State: ${statusText}\n`;
      output += `   UDID: ${device.udid}\n`;
      output += `\n`;
    }

    const bootedCount = devices.filter((d) => d.state === "Booted").length;
    if (bootedCount > 0) {
      output += `\n📱 ${bootedCount} simulator${
        bootedCount !== 1 ? "s are" : " is"
      } currently booted.`;
    } else {
      output += `\n💡 No simulators are currently booted. Use "boot" command to start one.`;
    }

    return output;
  }
}
