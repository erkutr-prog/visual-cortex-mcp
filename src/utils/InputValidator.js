/**
 * InputValidator - Security utility for validating and sanitizing user inputs
 * Prevents command injection and validates input ranges
 */

export class InputValidator {
  // Pattern for valid accessibility identifiers (alphanumeric, hyphens, underscores)
  static SAFE_ID_PATTERN = /^[a-zA-Z0-9_\-.:]+$/;

  // Pattern for valid accessibility labels (printable ASCII, no shell metacharacters)
  static SAFE_LABEL_PATTERN = /^[a-zA-Z0-9 _\-.,!?'"()]+$/;

  // Shell metacharacters that could be used for injection
  static SHELL_METACHARACTERS = /[;&|`$\\<>{}[\]()#*?~!]/;

  /**
   * Validate and sanitize an accessibility identifier
   * @param {string} id - The accessibility ID to validate
   * @returns {string} The validated ID
   * @throws {Error} If ID contains invalid characters
   */
  static validateAccessibilityId(id) {
    if (typeof id !== "string") {
      throw new Error("Accessibility ID must be a string");
    }

    if (id.length === 0) {
      throw new Error("Accessibility ID cannot be empty");
    }

    if (id.length > 256) {
      throw new Error("Accessibility ID is too long (max 256 characters)");
    }

    if (!this.SAFE_ID_PATTERN.test(id)) {
      throw new Error(
        "Accessibility ID contains invalid characters. Only alphanumeric, hyphens, underscores, dots, and colons are allowed."
      );
    }

    return id;
  }

  /**
   * Validate and sanitize an accessibility label
   * @param {string} label - The accessibility label to validate
   * @returns {string} The validated label
   * @throws {Error} If label contains invalid characters
   */
  static validateAccessibilityLabel(label) {
    if (typeof label !== "string") {
      throw new Error("Accessibility label must be a string");
    }

    if (label.length === 0) {
      throw new Error("Accessibility label cannot be empty");
    }

    if (label.length > 512) {
      throw new Error("Accessibility label is too long (max 512 characters)");
    }

    if (this.SHELL_METACHARACTERS.test(label)) {
      throw new Error(
        "Accessibility label contains potentially unsafe characters"
      );
    }

    return label;
  }

  /**
   * Validate text input for typing
   * @param {string} text - The text to validate
   * @returns {string} The validated text
   * @throws {Error} If text is invalid or too long
   */
  static validateTypeText(text) {
    if (typeof text !== "string") {
      throw new Error("Text must be a string");
    }

    if (text.length === 0) {
      throw new Error("Text cannot be empty");
    }

    // Reasonable limit for typing text
    if (text.length > 10000) {
      throw new Error("Text is too long (max 10000 characters)");
    }

    // Check for shell metacharacters that could be dangerous
    if (this.SHELL_METACHARACTERS.test(text)) {
      throw new Error(
        "Text contains potentially unsafe shell characters. Use only printable characters."
      );
    }

    return text;
  }

  /**
   * Validate a coordinate value
   * @param {*} value - The value to validate
   * @param {string} name - Name for error messages
   * @param {number} min - Minimum value (default -10000)
   * @param {number} max - Maximum value (default 10000)
   * @returns {number} The validated coordinate
   */
  static validateCoordinate(value, name, min = -10000, max = 10000) {
    const num = Number(value);

    if (!Number.isFinite(num)) {
      throw new Error(`${name} must be a valid number`);
    }

    if (num < min || num > max) {
      throw new Error(`${name} must be between ${min} and ${max}`);
    }

    return num;
  }

  /**
   * Validate a duration value
   * @param {*} value - The value to validate
   * @returns {number} The validated duration
   */
  static validateDuration(value) {
    const num = Number(value);

    if (!Number.isFinite(num)) {
      throw new Error("Duration must be a valid number");
    }

    if (num < 0 || num > 60) {
      throw new Error("Duration must be between 0 and 60 seconds");
    }

    return num;
  }

  /**
   * Validate a UDID format
   * @param {string} udid - The UDID to validate
   * @returns {string} The validated UDID
   */
  static validateUDID(udid) {
    if (typeof udid !== "string") {
      throw new Error("UDID must be a string");
    }

    // Standard Apple UDID format
    const udidPattern =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

    if (!udidPattern.test(udid)) {
      throw new Error("Invalid UDID format");
    }

    return udid.toUpperCase();
  }
}
