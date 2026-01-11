#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// 1. Find the Cursor Config Path
const homeDir = os.homedir();
const isMac = os.platform() === 'darwin';
const configPath = isMac 
  ? path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'cursor-mcp-config.json') // Note: Path might vary, check ~/.cursor/mcp.json too
  : path.join(homeDir, '.cursor', 'mcp.json'); // Fallback

// 2. Define the Entry Point
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.resolve(__dirname, '../src/server.js');

console.log("🧠 Visual Cortex Setup");
console.log("----------------------");

// 3. Inject into JSON
try {
  let config = { mcpServers: {} };
  
  // Try to load existing config
  const targetFile = path.join(homeDir, '.cursor', 'mcp.json'); // Standardizing on this for now
  
  if (fs.existsSync(targetFile)) {
    const raw = fs.readFileSync(targetFile, 'utf8');
    try { config = JSON.parse(raw); } catch (e) {}
  }

  // Add Visual Cortex
  config.mcpServers["visual-cortex"] = {
    command: "node",
    args: [serverPath]
  };

  // Write back
  fs.writeFileSync(targetFile, JSON.stringify(config, null, 2));
  console.log("✅ Successfully injected into ~/.cursor/mcp.json");
  console.log("🚀 Restart Cursor to give it sight!");

} catch (e) {
  console.error("❌ Failed to install:", e.message);
}