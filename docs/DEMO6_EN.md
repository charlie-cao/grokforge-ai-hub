# Check Out This AI Development Foundation Framework I Built in 2 Hours with Vibecoding 🚀

> **Demo6: Enterprise-Grade Queue-Based AI Chat System**  
> A foundational framework for AI development workflows, built through vibecoding (AI-assisted collaborative development)

## Preface

Hey everyone! I've been experimenting with a new development approach called **vibecoding** (collaborative programming with AI). I spent about 2 hours building this Demo6 project using Cursor + AI assistant, and I wanted to share the experience with you all. I'd love to get your feedback and suggestions!

This project is essentially a **foundational framework for enterprise-grade AI chat systems**. The core idea is: **how to make AI development workflows more efficient, controllable, and scalable**.

## 🎯 Project Goals

In the AI era, we need more than just "working" code. We need:
- **Scalable architecture**: Easy integration with different AI models
- **Controllable workflows**: Task queues, priorities, retry mechanisms
- **Real-time feedback**: Users can see processing progress in real-time
- **Enterprise features**: Performance monitoring, error handling, concurrency control

This is what Demo6 aims to solve.

## 🛠️ Tech Stack

### Core Framework
- **Bun.js** - High-performance JavaScript runtime (4x faster than Node.js!)
- **BullMQ** - Modern queue system based on Redis
- **Redis** - In-memory database as queue backend
- **Ollama** - Local large language model service (qwen3:latest)

### Frontend Tech
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Shadcn UI** - Component library
- **Server-Sent Events (SSE)** - Real-time status push

### Why These Technologies?

1. **Bun.js**: Fast startup, native TypeScript support, built-in WebSocket/SSE - perfect for AI service backends
2. **BullMQ**: More modern than traditional Bull, supports priority, delay, retry - perfect for AI task queues
3. **Ollama**: Runs locally, data secure, and free!
4. **SSE**: Simpler than WebSocket, perfect for one-way push scenarios (task status updates)

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │  ← User interface, real-time queue status
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP + SSE
         ↓
┌─────────────────┐
│  Queue Service  │  ← Bun.js server, handles task queuing
│  (Port 3001)    │     status queries, SSE push
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Redis       │  ← Stores queue data, task status
│  (Port 6379)    │     supports persistence
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Worker Process │  ← Asynchronously processes tasks
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Ollama       │  ← Local LLM service
│  (Port 11434)   │     qwen3:latest model
└─────────────────┘
```

### Core Flow

1. **User sends message** → Frontend sends to queue service
2. **Task enqueued** → BullMQ stores task in Redis
3. **Worker processes** → Asynchronously calls Ollama to generate response
4. **Real-time push** → Status updates pushed to frontend via SSE
5. **Result display** → Frontend displays progress and results in real-time

## ✨ Core Features

### 1. Task Queue Management
- **Waiting/Processing/Completed** status tracking
- **Priority queue** support (High/Medium/Low)
- **Auto retry mechanism** (3 retries on failure)
- **Rate limiting** (prevents API overload)

### 2. Real-time Progress Tracking
- **0-100%** progress display
- **Queue position** display ("X tasks ahead")
- **Real-time status updates** (via SSE)

### 3. Concurrent Processing
- Process **3 tasks** simultaneously
- Smart scheduling, high-priority tasks first

### 4. Streaming Response
- **SSE real-time push**, no WebSocket needed
- Auto-reconnect mechanism

### 5. Performance Monitoring
- **Average response time**
- **Total requests**
- **Success rate**
- **Throughput** (requests per minute)

### 6. Task History
- Records last **50 tasks**
- Status tracking (Completed/Failed/Processing)

## 🚀 Quick Start

### Prerequisites
- Bun.js (v1.3.3+)
- Docker (for Redis)
- Ollama (local LLM service)

### Installation Steps

1. **Clone the project**
```bash
git clone <your-repo>
cd one_company
```

2. **Install dependencies**
```bash
bun install
```

3. **Start Redis**
```bash
docker-compose -f docker-compose.demo6.yml up -d
```

4. **Start Ollama** (if not already running)
```bash
ollama serve
# Make sure qwen3:latest model is downloaded
ollama pull qwen3:latest
```

5. **Start queue server**
```bash
bun run src/server/demo6-server.ts
```

6. **Start frontend**
```bash
bun dev
```

7. **Access the app**
Open browser and visit `http://localhost:3000/demo6`

## 💡 Usage Experience

### Basic Usage
1. Enter your question in the input box
2. Click "Send" or press Enter
3. View queue status and processing progress in real-time
4. Wait for AI response

### Advanced Features
- **AI Generate Question**: Click "AI Generate Question" button to let AI generate questions for you
- **Priority Settings**: Set task priority (Low/Medium/High) in sidebar
- **View History**: Check task history in sidebar
- **Performance Monitoring**: View system performance metrics in real-time

### Language Toggle
Language toggle button in top right, supports Chinese/English interface switching.

## 🤖 Vibecoding Development Experience

### What is Vibecoding?

Vibecoding is what I call this development approach: **"resonating" with AI while programming**. It's not just "AI writes code, I copy it", but rather:

1. **I describe requirements** → AI understands and provides solutions
2. **AI generates code** → I review and optimize
3. **Encounter problems** → We debug and solve together
4. **Iterate and improve** → Continuous optimization

### Development Timeline

- **0-30 minutes**: Architecture design + basic framework setup
- **30-60 minutes**: Queue system integration + Worker implementation
- **60-90 minutes**: Frontend UI + SSE real-time push
- **90-120 minutes**: Feature completion + i18n + error handling

### Challenges Encountered

1. **CORS issues**: Frontend-backend separation, need proper CORS configuration
2. **SSE connection management**: Need to handle disconnections, reconnections
3. **Error handling**: AbortError, network errors need graceful handling
4. **State synchronization**: Frontend state and queue state need real-time sync

### Advantages of AI Collaboration

- **Rapid prototyping**: Complete system in 2 hours
- **Code quality**: AI-generated code is well-structured, type-safe
- **Learning efficiency**: Learn while doing, understand new tech stacks
- **Iteration speed**: Fast trial and error, fast improvement

## 📊 Performance

- **Startup time**: < 1 second (Bun.js advantage)
- **Response time**: Depends on Ollama model speed (local qwen3 ~2-5 seconds)
- **Concurrency**: Process 3 tasks simultaneously
- **Throughput**: ~10-20 requests/minute (depends on model speed)

## 🔮 Future Plans

### Short-term (1-2 weeks)
- [ ] Support more AI models (OpenAI, Anthropic, etc.)
- [ ] Add user authentication system
- [ ] Implement conversation history persistence
- [ ] Add more monitoring metrics

### Medium-term (1-2 months)
- [ ] Support batch task processing
- [ ] Implement task scheduling (scheduled tasks)
- [ ] Add Webhook support
- [ ] Performance optimization (caching, connection pooling, etc.)

### Long-term (3-6 months)
- [ ] Distributed deployment support
- [ ] Multi-tenant architecture
- [ ] Plugin system
- [ ] Visual workflow editor

## 🤝 Looking for Feedback!

This project is still being improved, and I'd love your:

1. **Suggestions**: Architecture design, code optimization, feature improvements
2. **Bug reports**: If you find any issues, please open an Issue
3. **Experience sharing**: If you're working on similar projects, let's exchange ideas
4. **Star support**: If you find it useful, please give it a star!

### Questions I'd Love to Discuss

- **Architecture design**: Is this architecture reasonable? Any better approaches?
- **Performance optimization**: How to further improve concurrency and response speed?
- **Error handling**: What other error scenarios should enterprise applications consider?
- **Scalability**: How to better support multi-model, multi-tenant scenarios?

## 📝 Technical Details

### Queue Configuration
- **Default priority**: 5 (Medium)
- **Max retries**: 3
- **Concurrency**: 3
- **Rate limit**: 10 requests/minute

### API Endpoints
- `POST /api/chat` - Submit chat task
- `GET /api/queue/stats` - Get queue statistics
- `GET /stream/status/:jobId` - SSE status stream
- `GET /health` - Health check

### Data Flow
```
User input → Queue service → Redis → Worker → Ollama → Result → SSE → Frontend
```

## 🎓 Learning Resources

If you want to dive deeper into these technologies:

- [Bun.js Official Docs](https://bun.sh/docs)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Ollama Documentation](https://ollama.ai/docs)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## 📄 License

MIT License

## 🙏 Acknowledgments

- **Cursor AI** - Powerful AI programming assistant
- **Bun.js Team** - Excellent JavaScript runtime
- **BullMQ Team** - Powerful queue system
- **Ollama Team** - Local LLM solution

---

**Finally, thanks again for your attention! If this project helps you, or if you want to improve it together, let's connect!** 🚀

*P.S. If you're also trying vibecoding, please share your experiences and insights!*

