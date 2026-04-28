# Backend Integration Guide - Developer Alert Dashboard

This React dashboard connects to your backend via WebSocket to display real-time alerts and allow developers to mark them as resolved.

## Overview

The dashboard uses a **WebSocket connection** to receive real-time alert updates from your backend. When a developer marks an alert as resolved, it sends a message to your backend to update the alert status.

## Architecture

```
┌──────────────────────────────────────┐
│   React Dashboard (Vite + React)     │
│   - Real-time alert display          │
│   - Alert filtering (open/resolved)  │
│   - Severity levels (LOW/MEDIUM/etc) │
└─────────────────┬────────────────────┘
                  │ WebSocket
                  │
┌─────────────────▼────────────────────┐
│   Backend (Node.js/Python/Go/etc)    │
│   - Alert management                 │
│   - Database storage                 │
│   - WebSocket server                 │
└──────────────────────────────────────┘
```

## WebSocket Message Protocol

### 1. Initial Connection
When the dashboard connects, it establishes a WebSocket connection to your backend.

**Expected Response from Backend:**
```json
{
  "type": "all_alerts",
  "alerts": [
    {
      "id": "ALERT_001",
      "description": "Database connection timeout",
      "severity": "CRITICAL",
      "lastRaisedTime": "2024-04-28T08:30:00Z",
      "escalationCount": 3,
      "customParams": {
        "database": "users_db",
        "connectionTime": "5000ms",
        "retries": 2
      },
      "status": "open"
    }
  ]
}
```

### 2. Real-Time Alert Updates
When an alert is raised in your backend, send:

```json
{
  "type": "alert_update",
  "alert": {
    "id": "ALERT_002",
    "description": "High memory usage detected",
    "severity": "MEDIUM",
    "lastRaisedTime": "2024-04-28T08:35:00Z",
    "escalationCount": 1,
    "customParams": {
      "memoryUsage": "85%",
      "threshold": "80%",
      "process": "worker_1"
    },
    "status": "open"
  }
}
```

### 3. Resolving Alerts
When a developer clicks "Mark Resolved", the dashboard sends:

```json
{
  "type": "resolve_alert",
  "alertId": "ALERT_001"
}
```

**Your backend should:**
1. Receive this message
2. Update the alert status in your database to `resolved`
3. Broadcast the updated alert back to all connected dashboard clients:

```json
{
  "type": "alert_update",
  "alert": {
    "id": "ALERT_001",
    "description": "Database connection timeout",
    "severity": "CRITICAL",
    "lastRaisedTime": "2024-04-28T08:30:00Z",
    "escalationCount": 3,
    "customParams": { ... },
    "status": "resolved"
  }
}
```

## Alert Data Structure

### Required Fields
- **id** (string): Unique identifier for the alert
- **description** (string): Clear description of what triggered the alert
- **severity** (enum): `LOW`, `MEDIUM`, or `CRITICAL`
- **lastRaisedTime** (ISO 8601 string): When the alert was last triggered
- **escalationCount** (number): How many times the alert has been re-triggered
- **status** (enum): `open` or `resolved`
- **customParams** (object): Any additional context (errors, metrics, etc)

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Default: ws://localhost:8080
VITE_WEBSOCKET_URL=ws://your-backend-server:port
```

## How It Detects Resolution

The intelligent part of your system works like this:

**Option 2 (Inverse Trigger) - Recommended ✓**

1. **Backend raises alert** - When an issue is detected, backend calls `raiseAlert(alertId, details)`
2. **Backend explicitly resolves** - When the issue is FIXED, backend explicitly calls `resolveAlert(alertId)`
3. **Dashboard receives update** - Backend broadcasts the resolved status via WebSocket
4. **Developer sees it marked resolved** - Alert shows "Resolved" badge and becomes less opaque

### Key Advantages:
- ✓ Accurate tracking (only resolved when actually fixed)
- ✓ Explicit state management (no ambiguity)
- ✓ Works with fallback 24-hour TTL auto-close
- ✓ Supports manual override by backend (auto-close can be extended)

## Example Backend Implementation

### Node.js + ws Example

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const connectedClients = new Set();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  console.log('Dashboard connected');

  // Send all current alerts
  const alerts = getOpenAlerts(); // From your DB
  ws.send(JSON.stringify({
    type: 'all_alerts',
    alerts: alerts
  }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'resolve_alert') {
      // Update database
      updateAlertStatus(data.alertId, 'resolved');
      
      // Get updated alert and broadcast
      const alert = getAlertById(data.alertId);
      broadcastToAllClients({
        type: 'alert_update',
        alert: alert
      });
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

function broadcastToAllClients(message) {
  const json = JSON.stringify(message);
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// When backend detects an issue
function raiseAlert(alertId, description, severity, customParams) {
  const alert = {
    id: alertId,
    description,
    severity,
    lastRaisedTime: new Date().toISOString(),
    escalationCount: getEscalationCount(alertId) + 1,
    customParams,
    status: 'open'
  };
  
  saveToDatabase(alert);
  broadcastToAllClients({
    type: 'alert_update',
    alert
  });
}

// When backend fixes the issue
function resolveAlert(alertId) {
  const alert = getAlertById(alertId);
  alert.status = 'resolved';
  updateDatabase(alert);
  
  broadcastToAllClients({
    type: 'alert_update',
    alert
  });
}
```

## Features

### Dashboard Capabilities

1. **Real-time Updates** - Alerts appear instantly via WebSocket
2. **Status Filtering** - View all/open/resolved alerts
3. **Severity Indicators** - Color-coded severity levels with icons
4. **Escalation Tracking** - See how many times an alert has occurred
5. **Custom Context** - View additional error details in expandable sections
6. **Connection Status** - Visual indicator showing WebSocket connection status
7. **Statistics** - Quick overview of critical/medium/low counts

### Smart Features

- Alerts with `status: 'resolved'` show a checkmark badge and appear dimmed
- Only "open" alerts show the "Mark Resolved" button
- Filters help developers focus on actionable alerts
- Escalation count helps identify recurring issues
- Custom parameters display additional debugging information

## Testing

### Manual Testing with cURL (WebSocket)
```bash
# Install websocat: brew install websocat (macOS) or similar
websocat ws://localhost:8080
```

Then send:
```json
{"type": "resolve_alert", "alertId": "ALERT_001"}
```

### Simulating Alerts
Add test alert generation to your backend:

```javascript
// Simulate new alert every 5 seconds
setInterval(() => {
  raiseAlert(
    `ALERT_${Date.now()}`,
    'Test alert for dashboard validation',
    Math.random() > 0.5 ? 'CRITICAL' : 'MEDIUM',
    { timestamp: new Date().toISOString() }
  );
}, 5000);
```

## Troubleshooting

### Dashboard shows "Connecting..."
- Check `VITE_WEBSOCKET_URL` in `.env`
- Verify backend WebSocket server is running
- Check browser console for connection errors

### Alerts not updating
- Verify WebSocket messages follow the protocol exactly
- Check that `status` field is either `'open'` or `'resolved'`
- Ensure `lastRaisedTime` is a valid ISO 8601 string

### "Mark Resolved" doesn't work
- Backend must be connected and listening for `resolve_alert` messages
- Backend must update database and broadcast the updated alert
- Check network tab in DevTools to see if message is sent

## Next Steps

1. **Start your backend WebSocket server** on the configured port
2. **Test the connection** by checking the connection status indicator
3. **Implement alert raising logic** in your backend
4. **Implement resolution logic** triggered by developers clicking "Mark Resolved"
5. **Add database persistence** to store alerts long-term

---

**Dashboard URL:** http://localhost:3000 (by default)
**Expected Backend URL:** ws://localhost:8080 (configurable in .env)
