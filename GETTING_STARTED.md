# Getting Started - Developer Alert Dashboard

Welcome! This guide will get you up and running in **5 minutes**.

## The Big Picture

You have a **real-time alert dashboard** that:
1. Displays alerts from your backend via WebSocket
2. Allows developers to mark alerts as resolved
3. Shows alert severity, escalation counts, and custom details
4. Updates in real-time across all connected browsers

## ⚡ 5-Minute Quick Start

### Step 1: Install Dependencies (1 min)
```bash
cd /vercel/share/v0-project
pnpm install
```

### Step 2: Start the Test Backend (1 min)
```bash
node mock-backend.js
```

You should see:
```
╔════════════════════════════════════════════╗
║   Mock Alert Backend Server Running       ║
║   WebSocket: ws://localhost:8080          ║
╚════════════════════════════════════════════╝

📋 Initial Alerts:
   - DB_TIMEOUT_001: Database connection timeout detected
   - MEMORY_HIGH_001: High memory usage detected
   - API_SLOW_001: API response time exceeds threshold
```

### Step 3: Start the Dashboard (1 min)
In a **new terminal**:
```bash
pnpm dev
```

You should see:
```
  VITE v8.0.10  ready in 456 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### Step 4: Open in Browser (1 min)
Click or visit: **http://localhost:3000**

You should see:
- ✅ **Green "Connected" badge** (top right)
- ✅ **3 open alerts** from the mock backend
- ✅ **Statistics** showing alerts by severity
- ✅ **"Mark Resolved" buttons** on each alert

### Step 5: Test Interaction (1 min)
Click **"Mark Resolved"** on any alert and watch it:
1. Move to the "Resolved" tab
2. Show a green checkmark
3. Become dimmed
4. Count decrease in "Open Alerts"

**Congratulations! 🎉 The dashboard is working!**

---

## 🎯 What Just Happened

### The Flow
1. **Mock backend** creates a WebSocket connection
2. **Dashboard** connects to the backend
3. **Backend sends** initial 3 test alerts
4. **Dashboard displays** them in real-time
5. **You click "Mark Resolved"**
6. **Dashboard sends** resolve message to backend
7. **Backend updates** and broadcasts back
8. **Dashboard updates** the UI

### The Key Insight
The backend explicitly tells the dashboard when an alert is resolved. The dashboard doesn't guess or use timers - it tracks actual state.

---

## 📚 Next: Connect Your Real Backend

### Choose Your Language

#### Node.js
1. Open [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md#nodejs--express--ws)
2. Copy the Node.js code
3. Integrate into your project
4. Update `.env`: `VITE_WEBSOCKET_URL=ws://your-backend:8080`
5. Run your backend
6. Dashboard auto-reconnects

#### Python
1. Open [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md#python--flask--flask-socketio)
2. Copy the Python code
3. Follow setup instructions
4. Update `.env`: `VITE_WEBSOCKET_URL=ws://your-backend:8080`
5. Run your backend
6. Dashboard auto-reconnects

#### Go
1. Open [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md#go--gorilla-websocket)
2. Copy the Go code
3. Follow setup instructions
4. Update `.env`: `VITE_WEBSOCKET_URL=ws://your-backend:8080`
5. Run your backend
6. Dashboard auto-reconnects

#### Other Languages
See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for protocol details and implement in your language.

---

## 🔧 Configuration

### Set Backend URL
Create `.env`:
```env
VITE_WEBSOCKET_URL=ws://your-backend-server:8080
```

### Customize Styling
- Colors: Edit `tailwind.config.ts`
- Components: Edit files in `src/components/`
- Fonts: Edit `src/globals.css`

---

## 🐛 Troubleshooting

### Dashboard shows "Connecting..."
1. Start mock backend: `node mock-backend.js`
2. Check `.env` has correct URL
3. Verify port 8080 is not in use

### No alerts appear
1. Refresh page: `F5`
2. Check mock backend is running
3. Try creating a test alert:
   ```bash
   curl -X POST http://localhost:8080/api/test-alert \
     -H "Content-Type: application/json" \
     -d '{"description": "Test", "severity": "CRITICAL"}'
   ```

### "Mark Resolved" doesn't work
1. Check "Connected" badge is green
2. Make sure mock backend is running
3. Check browser DevTools Network tab

**For more troubleshooting:** See [TESTING.md](./TESTING.md#troubleshooting)

---

## 📖 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| [README.md](./README.md) | Overview & features | 5 min |
| [SETUP.md](./SETUP.md) | Installation guide | 3 min |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | Protocol & specs | 15 min |
| [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md) | Code examples | 10 min |
| [TESTING.md](./TESTING.md) | Testing guide | 10 min |
| [DOCS_INDEX.md](./DOCS_INDEX.md) | Navigation index | 2 min |

---

## 🚀 Common Next Steps

### "I want to understand how it works"
→ Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

### "I need to build the backend"
→ Go to [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md) and pick your language

### "I want to test different scenarios"
→ Follow [TESTING.md](./TESTING.md) for detailed test cases

### "I need to customize the dashboard"
→ See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#customization)

### "I'm ready to deploy"
→ See [SETUP.md](./SETUP.md#building-for-production)

---

## 💡 Key Concepts

### Alerts
An alert represents an issue detected by your backend. It has:
- **ID** - Unique identifier
- **Description** - What went wrong
- **Severity** - LOW, MEDIUM, or CRITICAL
- **Escalation Count** - How many times it occurred
- **Custom Details** - Any error context
- **Status** - `open` or `resolved`

### Resolution
When a developer clicks "Mark Resolved":
1. Dashboard sends message to backend
2. Backend updates database
3. Backend confirms issue is fixed
4. Backend broadcasts resolved status
5. Dashboard updates UI

### WebSocket
Real-time two-way connection between dashboard and backend:
- Backend can push alerts instantly
- Dashboard can request resolution
- No polling or page refreshes needed

---

## ✅ Checklist

- [ ] Ran `pnpm install`
- [ ] Started mock backend with `node mock-backend.js`
- [ ] Started dashboard with `pnpm dev`
- [ ] Opened http://localhost:3000
- [ ] Saw 3 test alerts
- [ ] Marked an alert as resolved
- [ ] Saw "Connected" badge is green
- [ ] Watched alert move to "Resolved" tab

**If all checked:** You're ready to integrate your real backend! 🎉

---

## 🎓 Learning Resources

### Understand the Code
1. Start: `src/main.tsx` - Entry point
2. Then: `src/App.tsx` - Root component
3. Then: `src/hooks/useWebSocket.ts` - WebSocket logic
4. Then: `src/components/Dashboard.tsx` - Main UI
5. Then: `src/components/AlertCard.tsx` - Alert display

### Understand the Protocol
1. Start: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Message format
2. Then: [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md) - Implementation
3. Then: Mock backend code in `mock-backend.js` - Reference

### Understand the System
1. Start: [README.md](./README.md) - Features
2. Then: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - How it works
3. Then: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Full spec

---

## 🎯 Success Criteria

Your integration is successful when:

✅ Dashboard connects to your backend  
✅ Dashboard displays alerts from your backend  
✅ Alerts update in real-time when new issues occur  
✅ Developers can mark alerts as resolved  
✅ Backend confirms resolution and broadcasts update  
✅ Dashboard shows resolved badge on closed alerts  

---

## 🆘 Need Help?

1. **Quick Issues?** → [TESTING.md#troubleshooting](./TESTING.md#troubleshooting)
2. **Protocol Questions?** → [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
3. **Code Examples?** → [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md)
4. **Navigation?** → [DOCS_INDEX.md](./DOCS_INDEX.md)

---

## 🚀 Ready to Deploy?

1. Update `.env` with your real backend URL
2. Stop mock backend
3. Start your real backend
4. Dashboard auto-connects
5. Build for production: `pnpm build`
6. Deploy `dist/` folder to your hosting

---

## What's Next?

1. ✅ **You are here** - Quick start complete
2. → Read [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) to understand the protocol
3. → Pick your language in [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md)
4. → Implement your backend
5. → Use [TESTING.md](./TESTING.md) to verify integration
6. → Deploy to production

---

**Questions?** Start with [DOCS_INDEX.md](./DOCS_INDEX.md) to find what you need.

**Ready to dive deeper?** Open [README.md](./README.md) for the full overview.

**Let's build! 🚀**
