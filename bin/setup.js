#!/usr/bin/env node
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

// Security: Only run on macOS (iOS Simulator requirement)
if (os.platform() !== "darwin") {
  console.error("❌ Visual Cortex only works on macOS (iOS Simulator requirement)");
  process.exit(1);
}

// Define paths
const homeDir = os.homedir();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.resolve(__dirname, "../src/server.js");
const cursorDir = path.join(homeDir, ".cursor");
const targetFile = path.join(cursorDir, "mcp.json");

console.log("🧠 Visual Cortex Setup");
console.log("----------------------");

// Validate server path exists
if (!fs.existsSync(serverPath)) {
  console.error("❌ Server file not found:", serverPath);
  process.exit(1);
}

try {
  let config = { mcpServers: {} };

  // Create .cursor directory if it doesn't exist
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { mode: 0o755 });
    console.log("📁 Created ~/.cursor directory");
  }

  // Try to load existing config
  if (fs.existsSync(targetFile)) {
    const raw = fs.readFileSync(targetFile, "utf8");
    try {
      config = JSON.parse(raw);
      // Validate structure
      if (typeof config !== "object" || config === null) {
        throw new Error("Invalid config format");
      }
      if (!config.mcpServers || typeof config.mcpServers !== "object") {
        config.mcpServers = {};
      }
    } catch (parseError) {
      // Backup corrupted config
      const backupPath = `${targetFile}.backup.${Date.now()}`;
      fs.copyFileSync(targetFile, backupPath);
      console.log(`⚠️  Existing config was invalid. Backed up to: ${backupPath}`);
      config = { mcpServers: {} };
    }
  }

  // Add Visual Cortex entry
  config.mcpServers["visual-cortex"] = {
    command: "node",
    args: [serverPath],
  };

  // Write config with restrictive permissions
  fs.writeFileSync(targetFile, JSON.stringify(config, null, 2), {
    mode: 0o644,
  });

  console.log("✅ Successfully configured ~/.cursor/mcp.json");
  console.log(`📍 Server path: ${serverPath}`);
  console.log("🚀 Restart Cursor to enable Visual Cortex!");
  console.log("");
  console.log("📋 Make sure you have AXe installed for UI interactions:");
  console.log("   brew tap cameroncooke/axe && brew install axe");
} catch (e) {
  console.error("❌ Failed to install:", e.message);
  process.exit(1);
}