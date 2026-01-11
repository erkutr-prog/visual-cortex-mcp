#!/usr/bin/env node

/**
 * MCP Server for Visual Cortex
 * Follows SOLID principles:
 * - Single Responsibility: Server orchestration only
 * - Open/Closed: Easy to extend with new tools
 * - Liskov Substitution: All tools implement BaseTool interface
 * - Interface Segregation: Clean separation of concerns
 * - Dependency Inversion: Dependencies injected, not hardcoded
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Services
import { CommandExecutor } from "./services/CommandExecutor.js";
import { SimulatorService } from "./services/SimulatorService.js";

// Tools
import { ScreenshotTool } from "./tools/ScreenshotTool.js";
import { ListDevicesTool } from "./tools/ListDevicesTool.js";
import { ToolRegistry } from "./tools/ToolRegistry.js";

// Initialize dependencies (Dependency Inversion Principle)
const commandExecutor = new CommandExecutor();
const simulatorService = new SimulatorService(commandExecutor);

// Initialize tool registry
const toolRegistry = new ToolRegistry();

// Register tools (Open/Closed Principle - easy to add new tools)
toolRegistry.register(new ScreenshotTool(simulatorService));
toolRegistry.register(new ListDevicesTool(simulatorService));

// Initialize the MCP Server
const server = new Server(
  {
    name: "visual-cortex",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register ListTools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolRegistry.getAllDefinitions(),
  };
});

// Register CallTool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = toolRegistry.get(toolName);

  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  // Extract arguments (MCP can pass them in different formats)
  const args = request.params.arguments || {};

  // Execute tool (Liskov Substitution Principle - all tools have same interface)
  return await tool.execute(args);
});

// Start the Server via Stdio (Standard Input/Output)
const transport = new StdioServerTransport();
await server.connect(transport);
