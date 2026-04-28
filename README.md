# Developer Alert Dashboard

A real-time alert management dashboard built with **React** (Vite) that displays backend alerts and allows developers to mark them as resolved.

![Dashboard Features](./docs/features.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- pnpm (or npm/yarn)

### Installation
```bash
pnpm install
```

### Configuration
Create a `.env` file:
```env
VITE_WEBSOCKET_URL=ws://your-backend-server:8080
```

### Development
```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## 📋 Features

✅ **Real-time Alert Updates** - WebSocket connection for instant notifications
✅ **Severity Levels** - LOW, MEDIUM, CRITICAL with color coding
✅ **Alert Filtering** - View all, open, or resolved alerts
✅ **Escalation Tracking** - See how many times an alert has occurred
✅ **Custom Context** - Display additional error details
✅ **Connection Status** - Visual indicator of WebSocket connection
✅ **Statistics Dashboard** - Quick overview of alert metrics
✅ **Resolution Tracking** - Mark alerts as resolved with backend sync
✅ **Dark Mode Support** - Built-in dark theme

## 🏗️ Architecture

```
React Dashboard (Vite)
        ↓ (WebSocket)
Backend Alert Server
        ↓
Database / Monitoring Systems
```

## 📝 Alert Data Structure

Each alert contains:
- **id** - Unique identifier
- **description** - What triggered the alert
- **severity** - LOW, MEDIUM, CRITICAL
- **lastRaisedTime** - ISO 8601 timestamp
- **escalationCount** - Number of times re-triggered
- **customParams** - Additional error context
- **status** - open or resolved

## 🔗 Integration

Your backend communicates via WebSocket messages:

### Backend → Dashboard
```json
{
  "type": "alert_update",
  "alert": { ... }
}
```

### Dashboard → Backend
```json
{
  "type": "resolve_alert",
  "alertId": "ALERT_001"
}
```

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Installation and configuration guide
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Complete WebSocket protocol specification
- **[BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md)** - Code examples in Node.js, Python, Go

## 🔍 How It Detects Resolution

The system uses an **Inverse Trigger** approach:

1. **Alert Raised** - Backend detects issue → sends `alert_update` with `status: 'open'`
2. **Developer Reviews** - Dashboard displays alert with "Mark Resolved" button
3. **Developer Resolves** - Clicks button → dashboard sends `resolve_alert` message
4. **Backend Updates** - Backend calls `resolveAlert(alertId)` → updates database
5. **Dashboard Syncs** - Backend broadcasts updated alert with `status: 'resolved'`
6. **Alert Marked Done** - Dashboard shows checkmark badge, disables button

**Key Insight:** Resolution is determined by explicit backend action, not by polling or heuristics. The backend knows when an issue is fixed and broadcasts that state.

## 🛠️ Technology Stack

- **React 19** - UI framework
- **Vite 8** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **lucide-react** - Icons
- **date-fns** - Time formatting
- **WebSocket API** - Real-time communication

## 📁 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx    # Main dashboard
│   └── AlertCard.tsx    # Alert display
├── hooks/
│   └── useWebSocket.ts  # WebSocket management
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── globals.css          # Tailwind styles
```

## 🔧 Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_WEBSOCKET_URL` | `ws://localhost:8080` | Backend WebSocket URL |

### Customization
- **Colors** - Edit `tailwind.config.ts`
- **Refresh Rate** - Modify WebSocket reconnection logic in `useWebSocket.ts`
- **Alert Fields** - Update `Alert` interface in `useWebSocket.ts`

## 🚢 Production Build

```bash
pnpm build
pnpm preview
```

Built files are in the `dist/` directory.

## 🐛 Troubleshooting

### Dashboard shows "Connecting..."
- Verify backend WebSocket server is running
- Check `VITE_WEBSOCKET_URL` environment variable
- Look for CORS/firewall issues

### No alerts appear
- Check backend is sending `all_alerts` message on connection
- Verify alert data structure matches specification
- Inspect browser DevTools Network tab

### "Mark Resolved" not working
- Backend must listen for `resolve_alert` messages
- Backend must update database and broadcast response
- Check WebSocket is still connected

## 📖 Example Workflows

### Scenario 1: Database Connection Fails
1. Backend detects connection timeout
2. Calls `raiseAlert('DB_CONNECTION', 'Database timeout', 'CRITICAL', {...})`
3. Dashboard receives and displays alert
4. DBA fixes database
5. Backend detects recovery
6. Calls `resolveAlert('DB_CONNECTION')`
7. Dashboard updates to show resolved status

### Scenario 2: Memory Leak
1. Monitoring detects memory > 85%
2. `raiseAlert('HIGH_MEMORY', 'Memory exceeds 85%', 'CRITICAL', {...})`
3. Developer investigates and fixes code
4. Backend confirms memory normal
5. `resolveAlert('HIGH_MEMORY')`
6. Dashboard marks resolved

## 📞 Support

For detailed backend implementation, see:
- **BACKEND_INTEGRATION.md** - Protocol specification
- **BACKEND_EXAMPLES.md** - Working code examples

## 📄 License

MIT

---

**Ready to integrate?** Start with [SETUP.md](./SETUP.md) and [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
