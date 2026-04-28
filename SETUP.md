# Developer Alert Dashboard - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure WebSocket URL
Create a `.env` file in the project root:

```env
VITE_WEBSOCKET_URL=ws://localhost:8080
```

Replace `localhost:8080` with your actual backend WebSocket server address.

### 3. Start the Development Server
```bash
pnpm dev
```

The dashboard will open at `http://localhost:3000`

### 4. Connect Your Backend

Your backend needs to:
1. Run a WebSocket server on the configured URL
2. Send alert updates in the correct format (see BACKEND_INTEGRATION.md)
3. Listen for `resolve_alert` messages from the dashboard

## Project Structure

```
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Main app component
│   ├── globals.css        # Tailwind CSS styles
│   ├── components/
│   │   ├── Dashboard.tsx  # Main dashboard component
│   │   └── AlertCard.tsx  # Individual alert display
│   └── hooks/
│       └── useWebSocket.ts # WebSocket connection hook
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── index.html             # HTML entry point
├── package.json
└── BACKEND_INTEGRATION.md # Integration guide
```

## Building for Production

```bash
pnpm build
pnpm preview
```

## Key Components

### Dashboard Component
- Main container for the alert display
- Handles filtering (all/open/resolved)
- Shows connection status
- Displays statistics

### Alert Card Component
- Shows individual alert details
- Color-coded by severity
- Displays escalation count
- Shows custom parameters
- "Mark Resolved" button for open alerts

### useWebSocket Hook
- Manages WebSocket connection
- Handles reconnection logic
- Parses incoming alert messages
- Sends resolve requests to backend

## Understanding Alert Lifecycle

1. **Backend raises alert** → Sends `alert_update` message
2. **Dashboard receives** → Displays in list with "Mark Resolved" button
3. **Developer clicks button** → Sends `resolve_alert` message
4. **Backend processes** → Updates database
5. **Backend broadcasts** → Sends updated alert with `status: 'resolved'`
6. **Dashboard updates** → Shows checkmark badge, disables button

## Message Protocol

All WebSocket messages are JSON:

```json
// Backend sends alert updates
{
  "type": "alert_update",
  "alert": {
    "id": "ALERT_001",
    "description": "Issue description",
    "severity": "CRITICAL",
    "lastRaisedTime": "2024-04-28T08:30:00Z",
    "escalationCount": 2,
    "customParams": { "key": "value" },
    "status": "open"
  }
}

// Dashboard sends resolve request
{
  "type": "resolve_alert",
  "alertId": "ALERT_001"
}
```

## Styling

The dashboard uses:
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **date-fns** for time formatting
- Dark mode support via Tailwind

Customize colors and styling in `tailwind.config.ts`

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_WEBSOCKET_URL` | `ws://localhost:8080` | Backend WebSocket server URL |

## Troubleshooting

### "Connecting..." stays forever
1. Check backend is running on configured URL
2. Verify firewall/network allows WebSocket
3. Check browser console for errors

### No alerts showing
1. Backend must send `all_alerts` message on connection
2. Check message format matches specification
3. Verify alert IDs are unique strings

### "Mark Resolved" not working
1. Backend must listen for `resolve_alert` messages
2. Backend must update database
3. Backend must broadcast updated alert back

## For More Details

See **BACKEND_INTEGRATION.md** for detailed implementation examples and the complete WebSocket protocol specification.
