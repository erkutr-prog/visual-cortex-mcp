# Visual Cortex

🧠 **MCP Server for iOS Simulator Management and Screenshots**

Visual Cortex is a Model Context Protocol (MCP) server that provides AI assistants (like Cursor) with the ability to interact with iOS Simulators. Take screenshots, list devices, and manage simulators directly from your AI coding assistant.

## Features

- 📸 **Take Screenshots** - Capture the current screen of your iOS Simulator
- 📱 **List Devices** - Discover all available iOS Simulators with their status, UDID, and runtime version
- 🔍 **Device Discovery** - Find which simulators are booted and ready to use

## Requirements

- **macOS** - iOS Simulator only runs on macOS
- **Xcode** - Required for `xcrun simctl` command-line tools
- **Node.js** - Version 18 or higher (ES modules support)
- **Cursor** - Or any MCP-compatible client

## Installation

### Option 1: Install via npm (Recommended)

```bash
npm install -g visual-cortex
```

Then run the setup script:

```bash
visual-cortex
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/erkutr-prog/visual-cortex-mcp.git
cd visual-cortex-mcp

# Install dependencies
npm install

# Run setup
npm run setup
# or directly: node bin/setup.js
```

The setup script will automatically configure Cursor's MCP settings at `~/.cursor/mcp.json`.

## Configuration

After installation, the setup script automatically configures Cursor. The configuration is written to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "visual-cortex": {
      "command": "node",
      "args": ["/path/to/visual-cortex/src/server.js"]
    }
  }
}
```

### Manual Configuration

If you need to configure manually, edit `~/.cursor/mcp.json` and add:

```json
{
  "mcpServers": {
    "visual-cortex": {
      "command": "node",
      "args": ["/absolute/path/to/visual-cortex/src/server.js"]
    }
  }
}
```

**Important:** After configuration, restart Cursor for the changes to take effect.

## Usage

Once installed and configured, you can use Visual Cortex through Cursor's AI assistant:

### Take a Screenshot

Simply ask Cursor:
- "Take a screenshot of the iOS Simulator"
- "Show me what's on the simulator screen"
- "Capture the current simulator state"

The AI will automatically use the `get_screenshot` tool to capture and display the simulator screen.

### List iOS Simulators

Ask Cursor:
- "List all iOS simulators"
- "Show me available iOS devices"
- "Which simulators are currently booted?"

The AI will use the `list_devices` tool to show you all available simulators with their status.

## Optimizing AI Behavior with .cursorrules

To get the most out of Visual Cortex, add these rules to your project's `.cursorrules` file. This teaches Cursor's AI when and how to use the screenshot tools effectively.

Create or edit `.cursorrules` in your project root:

```markdown
# Visual Cortex MCP Integration

## Available MCP Tools
- `get_screenshot` - Takes a screenshot of the iOS Simulator
- `list_devices` - Lists all available iOS Simulators

## When to Use Screenshots

**ALWAYS take a screenshot when:**
- User asks about visual appearance, styling, layout, or UI issues
- User mentions "looks wrong", "alignment", "colors", "spacing", "design"
- User asks to "check the UI" or "see what it looks like"
- Before making visual/style changes to understand current state
- After making visual changes to verify the result

**Example triggers:**
- "Fix the button alignment"
- "The colors look off"
- "Check the home screen layout"
- "Make the spacing consistent"

## Screenshot Workflow

1. **Before Making Changes:**
   - Take a screenshot first to see the current state
   - Analyze the screenshot to understand the issue
   - Make code changes based on what you see

2. **After Making Changes:**
   - Wait 2-3 seconds after code changes (React Native may reload)
   - Take a verification screenshot
   - Compare with the original to confirm fixes

3. **Handling Full Reloads:**
   - React Native may do a full reload, resetting to entry point
   - If screenshot shows entry point but user was on another screen:
     - Inform the user: "The app reloaded to the entry point. Please navigate back to [screen name] and I'll take another screenshot."
     - OR wait a moment and take another screenshot if navigation is automatic

## Proactive Behavior

- Don't wait for explicit request - if user mentions visual issues, automatically take screenshot
- Be proactive: "I'll take a screenshot to see the current state and identify the issue"
- Use screenshots as evidence for your suggestions

## React Native Notes

- React Native Fast Refresh preserves navigation state (preferred)
- Full reloads reset to entry point (be aware of this)
- Wait 2-3 seconds after code changes before screenshot
- Component-only changes usually preserve state
```

This configuration will make Cursor's AI:
- ✅ Automatically take screenshots when you mention visual issues
- ✅ Handle React Native reloads gracefully
- ✅ Use screenshots to make informed style fixes
- ✅ Be proactive about visual debugging

### Example Interactions

```
You: "Take a screenshot of the iOS Simulator"
Cursor: [Uses get_screenshot tool and displays the image]

You: "List all iOS simulators"
Cursor: [Uses list_devices tool and shows formatted list]

You: "Show me only available simulators"
Cursor: [Uses list_devices with available_only=true]
```

## Available Tools

### `get_screenshot`

Takes a screenshot of the currently running iOS Simulator.

**Arguments:** None

**Returns:** Base64-encoded PNG image

**Example:**
```javascript
// Called automatically by Cursor when you ask for a screenshot
```

### `list_devices`

Lists all available iOS Simulators with their status, UDID, and runtime version.

**Arguments:**
- `available_only` (boolean, optional): If `true`, only shows available devices (filters out devices with runtime errors). Default: `false`

**Returns:** Formatted text list of devices

**Example:**
```javascript
// List all devices
list_devices()

// List only available devices
list_devices({ available_only: true })
```

## Troubleshooting

### "No iOS Simulator is currently running"

Make sure you have at least one iOS Simulator booted:
1. Open Xcode
2. Go to **Window > Devices and Simulators**
3. Select a simulator and click **Boot**

Or use the command line:
```bash
xcrun simctl boot "iPhone 15 Pro"
```

### "Command failed" errors

Ensure Xcode command-line tools are installed:
```bash
xcode-select --install
```

Verify `xcrun` is available:
```bash
xcrun simctl list devices
```

### MCP server not working in Cursor

1. Check that `~/.cursor/mcp.json` exists and contains the visual-cortex configuration
2. Restart Cursor completely (not just reload the window)
3. Verify the path to `server.js` is correct and absolute
4. Check Cursor's developer console for MCP errors

### Screenshot returns empty or corrupted image

- Ensure the simulator is fully booted (not just starting)
- Try taking a screenshot manually: `xcrun simctl io booted screenshot test.png`
- Check that the simulator window is visible (not minimized)

```

### Running Locally

```bash
# Install dependencies
npm install

# Run the server directly (for testing)
node src/server.js
```

## Support

For issues, questions, or feature requests, please open an issue on [GitHub](https://github.com/erkutr-prog/visual-cortex-mcp).

---

