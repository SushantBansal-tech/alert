#!/usr/bin/env node

/**
 * Mock Backend Server for Testing the Alert Dashboard
 * 
 * This is a simple WebSocket server that simulates an alert system.
 * Great for testing the dashboard without a real backend.
 * 
 * Usage:
 *   node mock-backend.js
 * 
 * Then set VITE_WEBSOCKET_URL=ws://localhost:8080 in your .env
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Store alerts in memory
const alerts = new Map();

// Add some initial test alerts
function initializeTestAlerts() {
  const testAlerts = [
    {
      id: 'DB_TIMEOUT_001',
      description: 'Database connection timeout detected',
      severity: 'CRITICAL',
      lastRaisedTime: new Date(Date.now() - 5 * 60000).toISOString(),
      escalationCount: 3,
      customParams: {
        database: 'users_db',
        timeout: '5000ms',
        retries: 2,
        lastError: 'ECONNREFUSED'
      },
      status: 'open'
    },
    {
      id: 'MEMORY_HIGH_001',
      description: 'High memory usage detected',
      severity: 'MEDIUM',
      lastRaisedTime: new Date(Date.now() - 2 * 60000).toISOString(),
      escalationCount: 1,
      customParams: {
        memoryUsage: '85%',
        threshold: '80%',
        process: 'worker_1',
        heapUsed: '850MB',
        heapTotal: '1000MB'
      },
      status: 'open'
    },
    {
      id: 'API_SLOW_001',
      description: 'API response time exceeds threshold',
      severity: 'LOW',
      lastRaisedTime: new Date(Date.now() - 10 * 60000).toISOString(),
      escalationCount: 2,
      customParams: {
        endpoint: '/api/users',
        avgResponseTime: '2500ms',
        threshold: '2000ms',
        failureRate: '5%'
      },
      status: 'open'
    }
  ];

  testAlerts.forEach(alert => {
    alerts.set(alert.id, alert);
  });
}

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  console.log(`✅ Dashboard client connected. Total clients: ${clients.size + 1}`);
  clients.add(ws);

  // Send all existing alerts on connection
  const alertsList = Array.from(alerts.values());
  console.log(`📤 Sending ${alertsList.length} existing alerts to client`);
  
  ws.send(JSON.stringify({
    type: 'all_alerts',
    alerts: alertsList
  }));

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📥 Received message:`, data);

      if (data.type === 'resolve_alert') {
        const alert = alerts.get(data.alertId);
        if (alert) {
          console.log(`🔧 Resolving alert: ${data.alertId}`);
          alert.status = 'resolved';
          
          // Broadcast the resolved alert to all clients
          broadcastAlert(alert);
          console.log(`✅ Alert marked as resolved and broadcasted`);
        } else {
          console.log(`⚠️  Alert not found: ${data.alertId}`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`❌ Client disconnected. Total clients: ${clients.size}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

// Broadcast alert to all connected clients
function broadcastAlert(alert) {
  const message = JSON.stringify({
    type: 'alert_update',
    alert: alert
  });

  let sentCount = 0;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sentCount++;
    }
  });

  console.log(`📢 Broadcasted to ${sentCount} client(s)`);
}

// Create a new alert
function createAlert(id, description, severity, customParams = {}) {
  const existing = alerts.get(id);
  const escalationCount = existing ? existing.escalationCount + 1 : 1;

  const alert = {
    id,
    description,
    severity,
    lastRaisedTime: new Date().toISOString(),
    escalationCount,
    customParams,
    status: 'open'
  };

  alerts.set(id, alert);
  broadcastAlert(alert);
  console.log(`🚨 New alert created: ${id} (${severity})`);
}

// Simulate random alerts every 15-30 seconds
function startRandomAlerts() {
  const alertTemplates = [
    {
      id: 'API_ERROR_',
      description: 'API error rate spike detected',
      severity: 'CRITICAL',
      customParams: (id) => ({
        endpoint: '/api/data',
        errorRate: '12%',
        threshold: '5%',
        errors: ['TIMEOUT', 'INTERNAL_ERROR'],
        affectedRequests: Math.floor(Math.random() * 100)
      })
    },
    {
      id: 'CACHE_HIT_',
      description: 'Cache hit rate below threshold',
      severity: 'MEDIUM',
      customParams: (id) => ({
        cacheType: 'redis',
        hitRate: `${Math.floor(Math.random() * 30)}%`,
        threshold: '70%'
      })
    },
    {
      id: 'DISK_SPACE_',
      description: 'Disk space running low',
      severity: 'CRITICAL',
      customParams: (id) => ({
        partition: '/data',
        used: '92%',
        remaining: '50GB',
        threshold: '90%'
      })
    }
  ];

  function createRandomAlert() {
    if (clients.size > 0) {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const timestamp = Date.now().toString().slice(-6);
      const alertId = template.id + timestamp;
      
      createAlert(
        alertId,
        template.description,
        template.severity,
        template.customParams(alertId)
      );
    }

    const delay = 15000 + Math.random() * 15000; // 15-30 seconds
    setTimeout(createRandomAlert, delay);
  }

  createRandomAlert();
}

// HTTP endpoint to manually create alerts (for testing)
server.on('request', (req, res) => {
  if (req.method === 'POST' && req.url === '/api/test-alert') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        createAlert(
          data.id || `ALERT_${Date.now()}`,
          data.description || 'Test alert',
          data.severity || 'MEDIUM',
          data.customParams || {}
        );
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start server
server.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Mock Alert Backend Server Running       ║');
  console.log(`║   WebSocket: ws://localhost:${PORT}             ║`);
  console.log('║   HTTP Test: POST http://localhost:8080   ║');
  console.log('║              /api/test-alert             ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  console.log('📋 Initial Alerts:');
  alerts.forEach((alert, id) => {
    console.log(`   - ${id}: ${alert.description}`);
  });
  
  console.log('\n🎯 Features:');
  console.log('   ✓ Sends initial alerts on connection');
  console.log('   ✓ Listens for resolve_alert messages');
  console.log('   ✓ Generates random alerts every 15-30 seconds');
  console.log('   ✓ Broadcasts resolved alerts to all clients');
  console.log('\n📝 Test Commands:\n');
  
  console.log('   # Test alert creation:');
  console.log('   curl -X POST http://localhost:8080/api/test-alert \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"description": "Test alert", "severity": "CRITICAL"}\'\n');
  
  console.log('   # Watch logs:');
  console.log('   tail -f server.log\n');
});

// Initialize with test data
initializeTestAlerts();

// Start generating random alerts when clients connect
startRandomAlerts();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  wss.clients.forEach(client => client.close());
  server.close();
  process.exit(0);
});
