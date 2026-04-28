# Documentation Index

## 📖 Start Here

**New to the project?** → Start with **[README.md](./README.md)**

---

## 📚 Documentation Roadmap

### For Getting Started
1. **[README.md](./README.md)** - Overview, features, architecture
2. **[SETUP.md](./SETUP.md)** - Installation and configuration
3. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What you have, how it works

### For Understanding the System
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Complete WebSocket protocol specification
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - File structure and component guide

### For Building Your Backend
- **[BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md)** - Working code examples
  - Node.js + Express + ws
  - Python + Flask + SocketIO
  - Go + Gorilla WebSocket
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Integration details and protocols

### For Testing
- **[TESTING.md](./TESTING.md)** - Scenarios, manual tests, troubleshooting
- **[mock-backend.js](./mock-backend.js)** - Pre-built test server

---

## 🎯 Quick Navigation by Use Case

### "I just want to see it work"
1. Run: `node mock-backend.js`
2. Run: `pnpm dev`
3. Open http://localhost:3000
4. Read: [TESTING.md](./TESTING.md)

### "I'm building a Node.js backend"
1. Read: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
2. Copy code from: [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md#nodejs--express--ws)
3. Integrate with your project
4. Test with: [TESTING.md](./TESTING.md)

### "I'm building a Python backend"
1. Read: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
2. Copy code from: [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md#python--flask--flask-socketio)
3. Integrate with your project
4. Test with: [TESTING.md](./TESTING.md)

### "I'm building a Go backend"
1. Read: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
2. Copy code from: [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md#go--gorilla-websocket)
3. Integrate with your project
4. Test with: [TESTING.md](./TESTING.md)

### "I need to customize the dashboard"
1. Read: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - File-by-file guidance
2. Modify files in `src/components/` for UI changes
3. Modify `src/hooks/useWebSocket.ts` for protocol changes

### "I'm troubleshooting issues"
1. Check: [TESTING.md](./TESTING.md#troubleshooting)
2. Check: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#troubleshooting)
3. Use mock backend for isolation: [TESTING.md](./TESTING.md#quick-testing-with-mock-backend)

---

## 📋 File Descriptions

### Documentation
| File | Purpose | Read Time |
|------|---------|-----------|
| [README.md](./README.md) | Overview & feature list | 5 min |
| [SETUP.md](./SETUP.md) | Quick start guide | 3 min |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | How everything works | 10 min |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | Full technical spec | 15 min |
| [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md) | Code samples in 3 languages | 10 min |
| [TESTING.md](./TESTING.md) | Testing guide & scenarios | 10 min |
| [DOCS_INDEX.md](./DOCS_INDEX.md) | This file | 2 min |

### Source Code
| File | Purpose |
|------|---------|
| `src/App.tsx` | Root React component |
| `src/main.tsx` | Entry point |
| `src/components/Dashboard.tsx` | Main dashboard component |
| `src/components/AlertCard.tsx` | Individual alert display |
| `src/hooks/useWebSocket.ts` | WebSocket connection management |
| `src/globals.css` | Tailwind base styles |

### Configuration
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript configuration |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variable template |

### Testing
| File | Purpose |
|------|---------|
| `mock-backend.js` | Test WebSocket server with alerts |

---

## 🚀 Reading Recommendations by Role

### Frontend Developer
1. [README.md](./README.md) - Understand what you're building
2. [SETUP.md](./SETUP.md) - Set up your environment
3. [src/components/](./src/components/) - Review component structure
4. [src/hooks/useWebSocket.ts](./src/hooks/useWebSocket.ts) - Understand data flow
5. [TESTING.md](./TESTING.md) - Test with mock backend
6. Customize colors/styling in components and tailwind.config.ts

### Backend Developer
1. [README.md](./README.md) - Understand the dashboard
2. [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Learn the protocol
3. [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md) - Pick your language
4. Copy code example and integrate
5. Use [TESTING.md](./TESTING.md) to verify integration

### Full Stack Developer
1. [README.md](./README.md)
2. [SETUP.md](./SETUP.md)
3. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
4. [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
5. [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md)
6. [TESTING.md](./TESTING.md)

### DevOps / Operations
1. [README.md](./README.md) - Features and requirements
2. [SETUP.md](./SETUP.md) - Deployment preparation
3. [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Infrastructure needs
4. `.env.example` - Environment variables to configure
5. [TESTING.md](./TESTING.md) - Health checks and verification

---

## 🔍 Protocol Quick Reference

### Alert Object Structure
```json
{
  "id": "ALERT_001",
  "description": "What went wrong",
  "severity": "CRITICAL|MEDIUM|LOW",
  "lastRaisedTime": "2024-04-28T08:30:00Z",
  "escalationCount": 3,
  "customParams": { "any": "object" },
  "status": "open|resolved"
}
```

### WebSocket Messages

**Backend → Dashboard:**
```json
{ "type": "all_alerts", "alerts": [...] }
{ "type": "alert_update", "alert": {...} }
```

**Dashboard → Backend:**
```json
{ "type": "resolve_alert", "alertId": "ALERT_001" }
```

For details, see [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#websocket-message-protocol).

---

## ⚡ Common Commands

```bash
# Setup
pnpm install
echo 'VITE_WEBSOCKET_URL=ws://localhost:8080' > .env

# Development
pnpm dev                    # Start dashboard
node mock-backend.js        # Start test server

# Testing
curl -X POST http://localhost:8080/api/test-alert \
  -H "Content-Type: application/json" \
  -d '{"description": "Test", "severity": "CRITICAL"}'

# Production
pnpm build
pnpm preview
```

---

## 🆘 Quick Help

### Where do I...

**...find the resolution logic?**
→ [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#resolution-logic) and [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#how-it-detects-resolution)

**...set up the backend?**
→ [BACKEND_EXAMPLES.md](./BACKEND_EXAMPLES.md) (pick your language)

**...test without a real backend?**
→ [TESTING.md](./TESTING.md#quick-testing-with-mock-backend)

**...customize the dashboard UI?**
→ [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#customization)

**...understand the data flow?**
→ [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#key-components-explained)

**...troubleshoot issues?**
→ [TESTING.md](./TESTING.md#troubleshooting) and [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md#troubleshooting)

**...deploy to production?**
→ [SETUP.md](./SETUP.md#building-for-production) and [README.md](./README.md#-production-build)

---

## 📞 Next Steps

1. ✅ **Explore** - Read README.md to understand features
2. ✅ **Setup** - Follow SETUP.md to install
3. ✅ **Test** - Run mock-backend.js with pnpm dev
4. ✅ **Integrate** - Use BACKEND_EXAMPLES.md for your language
5. ✅ **Deploy** - Build and deploy to production

---

**Questions?** Check [TESTING.md](./TESTING.md#troubleshooting) for common issues.

**Ready to dive in?** Start with [README.md](./README.md) or [SETUP.md](./SETUP.md)!
