/**
 * CommandExecutor - Single Responsibility: Execute shell commands
 * Follows Dependency Inversion Principle by being injectable
 */
import { spawnSync, execSync } from "child_process";

export class CommandExecutor {
  /**
   * Execute a command and return the result
   * @param {string[]} command - Command and arguments as array
   * @param {object} options - Execution options
   * @returns {object} Result with stdout, stderr, status, error
   */
  execute(command, options = {}) {
    const defaultOptions = {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024, // 10MB default
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
   * Execute a command synchronously (for simple text commands)
   * @param {string} command - Command string
   * @returns {string} Command output
   */
  executeSync(command) {
    return execSync(command).toString();
  }
}
