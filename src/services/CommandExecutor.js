/**
 * CommandExecutor - Single Responsibility: Execute shell commands
 * Follows Dependency Inversion Principle by being injectable
 *
 * SECURITY: All commands are executed via spawnSync with arguments as arrays,
 * which avoids shell interpretation and prevents command injection.
 * Commands use full paths to prevent PATH manipulation attacks.
 */
import { spawnSync } from "child_process";

// Whitelist of allowed commands with their full paths for security
// Using full paths prevents PATH manipulation attacks
const ALLOWED_COMMANDS = {
  "axe": "/opt/homebrew/bin/axe",
  "xcrun": "/usr/bin/xcrun"
};

export class CommandExecutor {
  /**
   * Execute a command and return the result
   * @param {string[]} command - Command and arguments as array
   * @param {object} options - Execution options
   * @returns {object} Result with stdout, stderr, status, error
   */
  execute(command, options = {}) {
    const commandName = command[0];

    // Security: Only allow whitelisted commands
    if (!(commandName in ALLOWED_COMMANDS)) {
      throw new Error(`Command not allowed: ${commandName}`);
    }

    const defaultOptions = {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024, // 10MB default
      // Security: Don't use shell to prevent injection
      shell: false,
    };

    // Use full path to prevent PATH manipulation attacks
    const fullPath = ALLOWED_COMMANDS[commandName];
    const result = spawnSync(fullPath, command.slice(1), {
      ...defaultOptions,
      ...options,
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      const errorMsg = result.stderr
        ? result.stderr.toString()
        : `Command failed with status ${result.status}`;
      throw new Error(errorMsg);
    }

    return result;
  }

  /**
   * Execute a known safe command (internal use only)
   * Only for hardcoded commands with no user input
   * @param {string} command - Command name (must be in whitelist)
   * @param {string[]} args - Arguments array
   * @returns {string} Command output
   */
  executeSafeCommand(command, args = []) {
    if (!(command in ALLOWED_COMMANDS)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    // Use full path to prevent PATH manipulation attacks
    const fullPath = ALLOWED_COMMANDS[command];
    const result = spawnSync(fullPath, args, {
      encoding: "utf8",
      shell: false,
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      const errorMsg = result.stderr
        ? result.stderr.toString()
        : `Command failed with status ${result.status}`;
      throw new Error(errorMsg);
    }

    return result.stdout;
  }
}
