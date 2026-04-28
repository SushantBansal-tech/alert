# Backend Implementation Examples

This document provides code examples for implementing the WebSocket alert system in different backend technologies.

## Node.js + Express + ws

```javascript
const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 8080;
const clients = new Set();

// In-memory alert store (replace with database)
const alerts = new Map();

wss.on('connection', (ws) => {
  console.log('New dashboard client connected');
  clients.add(ws);

  // Send all existing alerts on connection
  const alertList = Array.from(alerts.values());
  ws.send(JSON.stringify({
    type: 'all_alerts',
    alerts: alertList
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'resolve_alert') {
        const alert = alerts.get(data.alertId);
        if (alert) {
          alert.status = 'resolved';
          // Persist to database here
          broadcastAlert(alert);
          console.log(`Alert ${data.alertId} marked as resolved`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Dashboard client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast alert to all connected dashboards
function broadcastAlert(alert) {
  const message = JSON.stringify({
    type: 'alert_update',
    alert: alert
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Function to raise a new alert (call from your business logic)
function raiseAlert(id, description, severity, customParams = {}) {
  const existing = alerts.get(id);
  const escalationCount = existing ? existing.escalationCount + 1 : 1;

  const alert = {
    id,
    description,
    severity, // 'LOW', 'MEDIUM', 'CRITICAL'
    lastRaisedTime: new Date().toISOString(),
    escalationCount,
    customParams,
    status: 'open'
  };

  alerts.set(id, alert);
  broadcastAlert(alert);
  console.log(`Alert raised: ${id}`);
}

// Function to resolve an alert (call when issue is fixed)
function resolveAlert(alertId) {
  const alert = alerts.get(alertId);
  if (alert) {
    alert.status = 'resolved';
    broadcastAlert(alert);
    console.log(`Alert resolved: ${alertId}`);
  }
}

// Example: Monitor database connection
setInterval(() => {
  checkDatabaseHealth()
    .then(() => {
      if (alerts.has('DB_CONNECTION')) {
        resolveAlert('DB_CONNECTION');
      }
    })
    .catch((error) => {
      raiseAlert(
        'DB_CONNECTION',
        'Database connection failed',
        'CRITICAL',
        {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      );
    });
}, 10000);

async function checkDatabaseHealth() {
  // Your database health check logic
  return Promise.resolve();
}

// HTTP endpoint to test alert manually
app.post('/api/test-alert', (req, res) => {
  raiseAlert(
    `ALERT_${Date.now()}`,
    'Test alert from API',
    'MEDIUM',
    { source: 'api_endpoint' }
  );
  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`Alert server running on ws://localhost:${PORT}`);
});
```

## Python + Flask + Flask-SocketIO

```python
from flask import Flask, request
from flask_socketio import SocketIO, emit, send, disconnect
from datetime import datetime
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory alert store
alerts = {}
connected_clients = 0

@socketio.on('connect')
def handle_connect():
    global connected_clients
    connected_clients += 1
    print(f'Dashboard connected. Total clients: {connected_clients}')
    
    # Send all existing alerts
    alerts_list = list(alerts.values())
    emit('message', {
        'type': 'all_alerts',
        'alerts': alerts_list
    })

@socketio.on('message')
def handle_message(data):
    if data.get('type') == 'resolve_alert':
        alert_id = data.get('alertId')
        if alert_id in alerts:
            alerts[alert_id]['status'] = 'resolved'
            broadcast_alert(alerts[alert_id])
            print(f'Alert {alert_id} marked as resolved')

@socketio.on('disconnect')
def handle_disconnect():
    global connected_clients
    connected_clients -= 1
    print(f'Dashboard disconnected. Total clients: {connected_clients}')

def broadcast_alert(alert):
    """Send alert to all connected clients"""
    socketio.emit('message', {
        'type': 'alert_update',
        'alert': alert
    }, broadcast=True)

def raise_alert(alert_id, description, severity, custom_params=None):
    """Raise a new alert"""
    existing = alerts.get(alert_id)
    escalation_count = (existing['escalationCount'] + 1) if existing else 1
    
    alert = {
        'id': alert_id,
        'description': description,
        'severity': severity,  # 'LOW', 'MEDIUM', 'CRITICAL'
        'lastRaisedTime': datetime.utcnow().isoformat() + 'Z',
        'escalationCount': escalation_count,
        'customParams': custom_params or {},
        'status': 'open'
    }
    
    alerts[alert_id] = alert
    broadcast_alert(alert)
    print(f'Alert raised: {alert_id}')

def resolve_alert(alert_id):
    """Resolve an alert"""
    if alert_id in alerts:
        alerts[alert_id]['status'] = 'resolved'
        broadcast_alert(alerts[alert_id])
        print(f'Alert resolved: {alert_id}')

# Example monitoring task
def monitor_system():
    while True:
        try:
            # Your monitoring logic here
            if check_cpu_usage() > 90:
                raise_alert(
                    'HIGH_CPU',
                    'CPU usage exceeds 90%',
                    'CRITICAL',
                    {'cpu_usage': check_cpu_usage()}
                )
            else:
                resolve_alert('HIGH_CPU')
        except Exception as e:
            print(f'Monitoring error: {e}')
        
        time.sleep(10)

def check_cpu_usage():
    # Implement your CPU check
    return 0

# Start monitoring in background
monitor_thread = threading.Thread(target=monitor_system, daemon=True)
monitor_thread.start()

# Test endpoint
@app.route('/api/test-alert', methods=['POST'])
def test_alert():
    import uuid
    raise_alert(
        f'ALERT_{uuid.uuid4().hex[:8]}',
        'Test alert from API',
        'MEDIUM',
        {'source': 'api_endpoint'}
    )
    return {'success': True}

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8080, debug=True)
```

## Go + Gorilla WebSocket

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

type Alert struct {
	ID               string                 `json:"id"`
	Description      string                 `json:"description"`
	Severity         string                 `json:"severity"`
	LastRaisedTime   string                 `json:"lastRaisedTime"`
	EscalationCount  int                    `json:"escalationCount"`
	CustomParams     map[string]interface{} `json:"customParams"`
	Status           string                 `json:"status"`
}

type WebSocketMessage struct {
	Type   string `json:"type"`
	AlertID string `json:"alertId,omitempty"`
	Alert  *Alert `json:"alert,omitempty"`
	Alerts []*Alert `json:"alerts,omitempty"`
}

var (
	clients = make(map[*websocket.Conn]bool)
	alerts  = make(map[string]*Alert)
	mutex   = &sync.Mutex{}
	broadcast = make(chan interface{})
)

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	mutex.Lock()
	clients[conn] = true
	
	// Send all existing alerts
	alertsList := make([]*Alert, 0)
	for _, alert := range alerts {
		alertsList = append(alertsList, alert)
	}
	
	message := WebSocketMessage{
		Type:   "all_alerts",
		Alerts: alertsList,
	}
	
	jsonMsg, _ := json.Marshal(message)
	conn.WriteMessage(websocket.TextMessage, jsonMsg)
	mutex.Unlock()

	fmt.Println("Dashboard client connected")

	for {
		var msg WebSocketMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			fmt.Println("Dashboard client disconnected")
			break
		}

		if msg.Type == "resolve_alert" {
			mutex.Lock()
			if alert, exists := alerts[msg.AlertID]; exists {
				alert.Status = "resolved"
				BroadcastAlert(alert)
				fmt.Printf("Alert %s marked as resolved\n", msg.AlertID)
			}
			mutex.Unlock()
		}
	}
}

func BroadcastAlert(alert *Alert) {
	message := WebSocketMessage{
		Type:  "alert_update",
		Alert: alert,
	}
	broadcast <- message
}

func RaiseAlert(id, description, severity string, customParams map[string]interface{}) {
	mutex.Lock()
	defer mutex.Unlock()

	escalationCount := 1
	if existing, exists := alerts[id]; exists {
		escalationCount = existing.EscalationCount + 1
	}

	alert := &Alert{
		ID:              id,
		Description:     description,
		Severity:        severity,
		LastRaisedTime:  time.Now().UTC().Format(time.RFC3339),
		EscalationCount: escalationCount,
		CustomParams:    customParams,
		Status:          "open",
	}

	alerts[id] = alert
	BroadcastAlert(alert)
	fmt.Printf("Alert raised: %s\n", id)
}

func ResolveAlert(alertID string) {
	mutex.Lock()
	defer mutex.Unlock()

	if alert, exists := alerts[alertID]; exists {
		alert.Status = "resolved"
		BroadcastAlert(alert)
		fmt.Printf("Alert resolved: %s\n", alertID)
	}
}

func handleBroadcast() {
	for msg := range broadcast {
		mutex.Lock()
		for client := range clients {
			jsonMsg, _ := json.Marshal(msg)
			client.WriteMessage(websocket.TextMessage, jsonMsg)
		}
		mutex.Unlock()
	}
}

func testAlertHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	RaiseAlert(
		fmt.Sprintf("ALERT_%d", time.Now().UnixNano()),
		"Test alert from API",
		"MEDIUM",
		map[string]interface{}{"source": "api_endpoint"},
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func main() {
	go handleBroadcast()

	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/api/test-alert", testAlertHandler)

	fmt.Println("Alert server running on ws://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
```

## Integration with Monitoring Tools

### Health Check Example (Any Backend)

```
Every 30 seconds:
1. Check database connection
2. Check API response time
3. Check memory usage
4. If threshold exceeded → raiseAlert()
5. If threshold normal → resolveAlert()
```

### Error Tracking Integration

When your error tracker (Sentry, etc.) detects an error:
```
error_count_in_last_5min > threshold
  → raiseAlert('APP_ERRORS', ...)
  
error_count_in_last_5min < threshold
  → resolveAlert('APP_ERRORS')
```

---

Choose the backend language that matches your infrastructure, then implement the `RaiseAlert()` and `ResolveAlert()` functions in your alert-generating code.
