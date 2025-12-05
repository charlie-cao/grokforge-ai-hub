import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sidebar } from "./components/Sidebar";
import { ChatMessage } from "./components/ChatMessage";
import { modelManager, LEADS_BOT_SYSTEM_PROMPT, DECISION_BOT_SYSTEM_PROMPT } from "./lib/models";
import { cleanCode } from "./components/CodeEditor";
import "./index.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentCode?: string;
  leads?: Array<{ name: string; email: string; company: string }>;
  decisionPerspectives?: {
    ceo: string;
    coo: string;
    investor: string;
    summary: string;
    nextSteps: string;
  };
}

const MOCK_LEADS = [
  { name: "Alice AI", email: "alice@neon.com", company: "NeonAI" },
  { name: "Bob Builder", email: "bob@startup.io", company: "StartupIO" },
  { name: "Charlie Code", email: "charlie@tech.co", company: "TechCo" },
];

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      return saved === "true";
    }
    return true; // Default to dark mode
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set dark mode on mount and persist
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDark]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isLeadsQuery = useCallback((text: string) => {
    return text.toLowerCase().includes("leads");
  }, []);

  const isDecisionQuery = useCallback((text: string) => {
    return text.toLowerCase().includes("decision") || text.toLowerCase().includes("dilemma");
  }, []);

  const isLeadsBot = useCallback((code: string) => {
    return code.toLowerCase().includes("apollo") || code.toLowerCase().includes("leads");
  }, []);

  const isDecisionBot = useCallback((code: string) => {
    return code.toLowerCase().includes("decision") || code.toLowerCase().includes("perspective") || 
           (code.toLowerCase().includes("ceo") && code.toLowerCase().includes("coo"));
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Detect query type and set appropriate system prompt
      let systemPrompt: string | undefined;
      if (isLeadsQuery(input)) {
        systemPrompt = LEADS_BOT_SYSTEM_PROMPT;
      } else if (isDecisionQuery(input)) {
        systemPrompt = DECISION_BOT_SYSTEM_PROMPT;
      }
      
      // Query model
      const response = await modelManager.query(input, {
        systemPrompt,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      // Check if we should generate code
      if (response.content.length > 50) {
        try {
          const codePrompt = `Generate Python code for "${response.content.substring(0, 200)}" as a Zapier-like automation bot. The code should be a complete, runnable Python script. Include proper error handling and logging. Output ONLY the Python code, no markdown, no explanations.`;
          
          const codeResponse = await modelManager.query(codePrompt, {
            systemPrompt: isLeadsQuery(input) ? LEADS_BOT_SYSTEM_PROMPT : 
                         isDecisionQuery(input) ? DECISION_BOT_SYSTEM_PROMPT : undefined,
          });

          const cleanedCode = cleanCode(codeResponse.content);
          assistantMessage.agentCode = cleanedCode;

          // Simulate leads if it's a leads bot
          if (isLeadsBot(cleanedCode)) {
            assistantMessage.leads = MOCK_LEADS;
            // Log CSV path for real deploy
            console.log("LeadsBot detected. CSV would be saved to: leads.csv");
          }

          // Simulate decision perspectives if it's a decision bot
          if (isDecisionBot(cleanedCode)) {
            assistantMessage.decisionPerspectives = {
              ceo: "Launch MVP now. Speed beats perfection. Get feedback fast.",
              coo: "Validate core features first. Ensure basic infrastructure is ready.",
              investor: "Show traction before full launch. Build waitlist, get 10 committed users.",
              summary: "Balanced approach: Launch MVP with core features, track metrics, iterate based on feedback.",
              nextSteps: "1. Deploy MVP 2. Track user engagement 3. Gather feedback 4. Iterate weekly"
            };
            console.log("DecisionBot detected. Decision log would be saved to: decision_log.txt");
          }
        } catch (codeError) {
          console.error("Code generation error:", codeError);
        }
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isLeadsQuery, isDecisionQuery, isLeadsBot, isDecisionBot]);

  const handleDownload = useCallback((code: string) => {
    const cleanedCode = cleanCode(code);
    const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(cleanedCode)}`;
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = "bot.py";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
  }, []);

  const handleSearch = useCallback((query: string) => {
    // TODO: Implement search
    console.log("Search:", query);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar onNewChat={handleNewChat} onSearch={handleSearch} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                  GrokForge AI
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Ask me anything about solo business advice
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onDownload={handleDownload}
            />
          ))}

          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 max-w-4xl mx-auto"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              rows={1}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-md"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
