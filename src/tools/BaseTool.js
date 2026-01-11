/**
 * BaseTool - Abstract base class for all tools
 * Follows Open/Closed Principle and Liskov Substitution Principle
 */
export class BaseTool {
  constructor(name, description, inputSchema) {
    if (this.constructor === BaseTool) {
      throw new Error("BaseTool is abstract and cannot be instantiated");
    }
    this.name = name;
    this.description = description;
    this.inputSchema = inputSchema;
  }

  /**
   * Get tool definition for MCP
   * @returns {object} Tool definition
   */
  getDefinition() {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    };
  }

  /**
   * Execute the tool - must be implemented by subclasses
   * @param {object} args - Tool arguments
   * @returns {Promise<object>} Tool result
   */
  async execute(args) {
    throw new Error("execute() must be implemented by subclass");
  }

  /**
   * Create error response
   * @param {Error} error - Error object
   * @param {string} context - Error context message
   * @returns {object} Error response
   */
  createErrorResponse(error, context) {
    return {
      content: [
        {
          type: "text",
          text: `${context}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  /**
   * Create success response with text
   * @param {string} text - Response text
   * @returns {object} Success response
   */
  createTextResponse(text) {
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }

  /**
   * Create success response with image
   * @param {string} base64Image - Base64 encoded image
   * @param {string} mimeType - MIME type
   * @param {string} text - Accompanying text
   * @returns {object} Success response
   */
  createImageResponse(base64Image, mimeType = "image/png", text = "") {
    const content = [
      {
        type: "image",
        data: base64Image,
        mimeType,
      },
    ];

    if (text) {
      content.push({
        type: "text",
        text,
      });
    }

    return { content };
  }
}
