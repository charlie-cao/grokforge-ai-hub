import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "./components/ChatMessage";
import { AnalysisCanvas } from "./components/AnalysisCanvas";
import { modelManager, LEADS_BOT_SYSTEM_PROMPT, DECISION_BOT_SYSTEM_PROMPT } from "./lib/models";
import { generatePromptFromPain } from "./lib/utils";
import { cleanCode } from "./components/CodeEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wand2, Plus, History, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [promptHelperOpen, setPromptHelperOpen] = useState(false);
  const [painPoint, setPainPoint] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<Array<{step: number; desc: string; tool?: string}>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    setIsAnalyzing(true);
    setAnalysisSteps([]);

    try {
      // 第一步：动态分析痛点（流式展示）
      const analysisPrompt = `Analyze the user's pain point: "${input.trim()}". Break it down into 3-5 tools/solutions. Output JSON format: {"steps": [{"step": 1, "desc": "分析获客痛点", "tool": "LeadsBot"}, {"step": 2, "desc": "需要CRM管理", "tool": "CRM"}], "tools": [{"name": "LeadsBot", "type": "bot", "priority": 1}]}. Output ONLY valid JSON, no markdown.`;
      
      try {
        const analysisResponse = await modelManager.query(analysisPrompt);
        
        // 尝试解析 JSON
        const jsonMatch = analysisResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          if (analysisData.steps && Array.isArray(analysisData.steps)) {
            // 逐个添加步骤（流式效果）
            analysisData.steps.forEach((step: any, index: number) => {
              setTimeout(() => {
                setAnalysisSteps(prev => [...prev, step]);
              }, index * 500);
            });
          }
        }
      } catch (parseError) {
        // 如果解析失败，创建默认步骤
        const defaultSteps = [
          { step: 1, desc: "分析用户痛点", tool: "Analysis" },
          { step: 2, desc: "识别所需工具", tool: "Tools" },
          { step: 3, desc: "生成解决方案", tool: "Solution" }
        ];
        defaultSteps.forEach((step, index) => {
          setTimeout(() => {
            setAnalysisSteps(prev => [...prev, step]);
          }, index * 500);
        });
      }

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
      setIsAnalyzing(false);
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

  const handleGeneratePrompt = useCallback(async () => {
    if (!painPoint.trim()) return;
    
    setIsGeneratingPrompt(true);
    try {
      const prompt = await generatePromptFromPain(painPoint.trim());
      setGeneratedPrompt(prompt);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(prompt);
    } catch (error) {
      console.error("Prompt generation error:", error);
      setGeneratedPrompt("Error generating prompt. Please try again.");
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [painPoint]);

  const handleInsertPrompt = useCallback(() => {
    if (generatedPrompt) {
      setInput(generatedPrompt);
      setPromptHelperOpen(false);
      setPainPoint("");
      setGeneratedPrompt("");
    }
  }, [generatedPrompt]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">GrokForge AI</h1>
            <Button
              onClick={() => window.location.href = '/demo1'}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Demo 1
            </Button>
            <Button
              onClick={() => window.location.href = '/demo2'}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Demo 2
            </Button>
            <Button
              onClick={handleNewChat}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
            <Select defaultValue="today">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="History" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content Area - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Analysis Steps */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">分析步骤</h2>
          <div className="space-y-3">
            {analysisSteps.map((step, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900 dark:text-slate-100">{step.desc}</div>
                    {step.tool && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{step.tool}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isAnalyzing && analysisSteps.length === 0 && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">分析中...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Tldraw Canvas + Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tldraw Canvas */}
          {isAnalyzing && (
            <div className="h-64 border-b border-slate-200 dark:border-slate-700">
              <AnalysisCanvas analysisSteps={analysisSteps} isAnalyzing={isAnalyzing} />
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                    GrokForge AI
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    输入痛点，如"找客户"或"决策困难"，AI将为您生成解决方案
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
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-sm">G</span>
                </div>
                <div className="bg-blue-500 text-white rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2 max-w-4xl mx-auto"
          >
            <Dialog open={promptHelperOpen} onOpenChange={setPromptHelperOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  title="AI帮生成提示"
                >
                  <Wand2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Prompt Helper</DialogTitle>
                  <DialogDescription>
                    输入您的痛点描述，AI将为您生成优化的提示词
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="例如：找客户"
                    value={painPoint}
                    onChange={(e) => setPainPoint(e.target.value)}
                    className="min-h-20"
                  />
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={!painPoint.trim() || isGeneratingPrompt}
                    className="w-full"
                  >
                    {isGeneratingPrompt ? "生成中..." : "生成提示词"}
                  </Button>
                  {generatedPrompt && (
                    <div className="space-y-2">
                      <Textarea
                        value={generatedPrompt}
                        readOnly
                        className="min-h-20 bg-slate-50 dark:bg-slate-900"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleInsertPrompt}
                          className="flex-1"
                        >
                          插入到输入框
                        </Button>
                        <Button
                          onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                          variant="outline"
                        >
                          复制
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入痛点，如'找客户'、'决策困难'..."
              className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              rows={1}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-md"
            >
              {isLoading ? "发送中..." : "发送"}
            </Button>
          </form>
          </div>
        </div>

        {/* Right: Tool Cards (Placeholder for now) */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">生成的工具</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                分析完成后，工具卡片将在这里显示
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
