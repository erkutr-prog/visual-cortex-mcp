/**
 * ToolRegistry - Single Responsibility: Manage tool registration and lookup
 * Follows Single Responsibility Principle and Dependency Inversion Principle
 */
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a tool
   * @param {BaseTool} tool - Tool instance
   */
  register(tool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a tool by name
   * @param {string} name - Tool name
   * @returns {BaseTool|undefined} Tool instance
   */
  get(name) {
    return this.tools.get(name);
  }

  /**
   * Get all tool definitions for MCP
   * @returns {Array} Array of tool definitions
   */
  getAllDefinitions() {
    return Array.from(this.tools.values()).map((tool) =>
      tool.getDefinition()
    );
  }

  /**
   * Check if a tool exists
   * @param {string} name - Tool name
   * @returns {boolean}
   */
  has(name) {
    return this.tools.has(name);
  }
}
