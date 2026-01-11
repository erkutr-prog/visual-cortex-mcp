/**
 * CommandExecutor - Single Responsibility: Execute shell commands
 * Follows Dependency Inversion Principle by being injectable
 *
 * SECURITY: All commands are executed via spawnSync with arguments as arrays,
 * which avoids shell interpretation and prevents command injection.
 */
import { spawnSync } from "child_process";

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = new Set(["xcrun", "axe"]);

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
    if (!ALLOWED_COMMANDS.has(commandName)) {
      throw new Error(`Command not allowed: ${commandName}`);
    }

    const defaultOptions = {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024, // 10MB default
      // Security: Don't use shell to prevent injection
      shell: false,
    };

    const result = spawnSync(command[0], command.slice(1), {
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
    if (!ALLOWED_COMMANDS.has(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }

    const result = spawnSync(command, args, {
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
