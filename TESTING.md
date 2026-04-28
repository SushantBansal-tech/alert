# Testing Guide - Developer Alert Dashboard

## Quick Testing with Mock Backend

The project includes a mock backend server for testing without a real backend.

### Step 1: Start the Mock Backend

```bash
node mock-backend.js
```

You should see:
```
╔════════════════════════════════════════════╗
║   Mock Alert Backend Server Running       ║
║   WebSocket: ws://localhost:8080          ║
║   HTTP Test: POST http://localhost:8080   ║
║              /api/test-alert              ║
╚════════════════════════════════════════════╝

📋 Initial Alerts:
   - DB_TIMEOUT_001: Database connection timeout detected
   - MEMORY_HIGH_001: High memory usage detected
   - API_SLOW_001: API response time exceeds threshold
```

### Step 2: Start the Dashboard

In a new terminal:
```bash
pnpm dev
```

Dashboard opens at `http://localhost:3000`

### Step 3: Test the Connection

You should see:
- **Green "Connected" badge** in the top-right
- **3 open alerts** from the mock backend
- **Alert statistics** showing CRITICAL (1), MEDIUM (1), LOW (1)

## Testing Scenarios

### Scenario 1: View and Resolve an Alert

1. Dashboard is running with mock backend
2. You see 3 open alerts
3. Click "Mark Resolved" on one alert
4. Alert disappears from "Open" tab
5. Alert appears in "Resolved" tab with green checkmark
6. Check mock backend logs: `🔧 Resolving alert: DB_TIMEOUT_001`

### Scenario 2: Receive New Alert

The mock backend automatically generates new alerts every 15-30 seconds.

1. Wait for a new alert to appear
2. Check logs: `🚨 New alert created: API_ERROR_XXXXX (CRITICAL)`
3. New alert appears at the top of the list
4. Statistics update automatically

### Scenario 3: Escalation Tracking

1. Note the "Escalation Count" on an existing alert
2. The mock backend may create another alert with the same ID prefix
3. It increments `escalationCount` and updates the alert
4. Watch the count increase in the dashboard

### Scenario 4: Connection Loss

1. Stop the mock backend: `Ctrl+C` in backend terminal
2. Dashboard shows **red "Connecting..." badge**
3. Connection attempts every 3 seconds
4. Restart backend: `node mock-backend.js`
5. Dashboard reconnects automatically and refetches alerts

## Manual Testing via HTTP

### Create Custom Alert

```bash
curl -X POST http://localhost:8080/api/test-alert \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CUSTOM_ALERT_001",
    "description": "My custom test alert",
    "severity": "CRITICAL",
    "customParams": {
      "service": "my-service",
      "environment": "production",
      "errorMessage": "Custom error details"
    }
  }'
```

Response:
```json
{"success": true}
```

Alert appears in dashboard immediately!

### Create Medium Severity Alert

```bash
curl -X POST http://localhost:8080/api/test-alert \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test medium alert",
    "severity": "MEDIUM"
  }'
```

### Create Multiple Alerts

```bash
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/test-alert \
    -H "Content-Type: application/json" \
    -d "{\"description\": \"Batch alert $i\", \"severity\": \"LOW\"}"
  sleep 1
done
```

## Testing Resolution Flow

### Test 1: Mark Alert as Resolved

1. Open dashboard at http://localhost:3000
2. Click "Mark Resolved" on any open alert
3. Check backend logs for: `🔧 Resolving alert: ALERT_ID`
4. Alert status changes to "resolved"
5. Button disappears from alert card
6. Alert appears dimmed in the UI
7. Resolved count increases

### Test 2: Filter by Status

1. Go to dashboard
2. Click **"open"** tab - shows only open alerts
3. Click **"resolved"** tab - shows only resolved alerts
4. Click **"all"** tab - shows all alerts

## Performance Testing

### Load Test: 100 Alerts

```bash
for i in {1..100}; do
  curl -s -X POST http://localhost:8080/api/test-alert \
    -H "Content-Type: application/json" \
    -d "{\"description\": \"Load test alert $i\", \"severity\": \"LOW\"}" &
done
wait
```

Monitor:
- Dashboard rendering performance
- Backend broadcast timing
- Message ordering

### Stress Test: Rapid Resolution

```bash
# Manually click "Mark Resolved" rapidly on multiple alerts
# Check that:
# - WebSocket messages are sent
# - Backend receives each message
# - Alerts resolve in correct order
# - Dashboard updates consistently
```

## DevTools Inspection

### Check WebSocket Messages

1. Open DevTools: `F12`
2. Go to **Network** tab
3. Filter for **WS** (WebSocket)
4. Click on the WebSocket connection
5. View **Messages** sub-tab

You should see:
- `all_alerts` message on connection
- `alert_update` messages when alerts change
- `resolve_alert` messages when you click button

### Check Browser Console

Monitor for:
- `[v0] WebSocket connected` - connection established
- `[v0] WebSocket message received:` - messages coming in
- Connection status changes

### Check Mock Backend Logs

Monitor for:
- `✅ Dashboard client connected` - client connected
- `📤 Sending X existing alerts` - initial data sent
- `📥 Received message:` - messages from dashboard
- `🔧 Resolving alert:` - resolution processed
- `📢 Broadcasted to X client(s)` - update sent

## Troubleshooting

### Dashboard shows "Connecting..." forever

**Problem:** Can't connect to backend

**Solutions:**
1. Verify mock backend is running: `ps aux | grep mock-backend`
2. Check port 8080 is not in use: `netstat -an | grep 8080`
3. Restart backend: `Ctrl+C` then `node mock-backend.js`
4. Check .env has correct URL: `VITE_WEBSOCKET_URL=ws://localhost:8080`

### No alerts appear

**Problem:** Connection works but no data

**Solutions:**
1. Check mock backend started with initial alerts
2. Refresh dashboard: `F5` or `Cmd+R`
3. Create a test alert via HTTP
4. Check browser console for errors

### Alerts won't resolve

**Problem:** "Mark Resolved" button not working

**Solutions:**
1. Check WebSocket is connected (green badge)
2. Verify backend is receiving messages (check logs)
3. Try refreshing dashboard
4. Restart backend

### Memory usage increasing

**Problem:** Dashboard memory grows over time

**Solutions:**
1. Stop auto-alert generation in mock backend (modify code)
2. Limit number of alerts displayed
3. Clear browser cache and devtools
4. Check for memory leaks in useWebSocket hook

## Continuous Testing

### Watch Mode

Run in one terminal:
```bash
# Terminal 1 - Backend
watch -n 5 'node mock-backend.js'
```

In another:
```bash
# Terminal 2 - Dashboard
pnpm dev
```

### Automated Test Script

Create `test.sh`:
```bash
#!/bin/bash

# Start backend
node mock-backend.js &
BACKEND_PID=$!

# Wait for startup
sleep 2

# Start dashboard
pnpm dev &
DASHBOARD_PID=$!

# Wait for dashboard to start
sleep 5

# Open browser
open http://localhost:3000

# Keep running
wait
```

Then:
```bash
chmod +x test.sh
./test.sh
```

## Integration Testing

Once confident with manual testing, integrate with real backend:

1. **Update .env:**
   ```env
   VITE_WEBSOCKET_URL=ws://your-real-backend:port
   ```

2. **Stop mock backend:**
   ```bash
   Ctrl+C
   ```

3. **Start your real backend**

4. **Reload dashboard:** `F5`

5. **Verify connection and alerts appear**

## Acceptance Criteria Checklist

- [ ] Dashboard connects via WebSocket
- [ ] Initial alerts display on connection
- [ ] New alerts appear in real-time
- [ ] Alerts can be filtered by status
- [ ] "Mark Resolved" sends message to backend
- [ ] Resolved alerts update and show badge
- [ ] Connection status displays correctly
- [ ] Statistics update in real-time
- [ ] Custom parameters display in details
- [ ] Escalation counts increment
- [ ] Dark mode works correctly
- [ ] Mobile responsive layout works

---

**Next:** After successful testing, check [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for production backend implementation.
