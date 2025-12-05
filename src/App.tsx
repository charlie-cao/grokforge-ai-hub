import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { APITester } from "./APITester";
import { queryQwen3 } from "./lib/utils";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

// Extract repeated button styles for consistency and maintainability
const NEON_BUTTON_CLASSES = "w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-500 dark:hover:to-pink-500 text-white font-semibold shadow-lg shadow-[0_0_15px_rgba(139,92,246,0.4)] dark:shadow-[0_0_15px_rgba(139,92,246,0.6)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] dark:hover:shadow-[0_0_25px_rgba(139,92,246,0.8)] transition-all duration-300";

export function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [agentCode, setAgentCode] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toggle dark mode by adding/removing 'dark' class on html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleQuery = useCallback(async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setResponse("");
    setIsDeployed(false);
    setAgentCode("");
    
    // Clear any existing toast timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    
    try {
      const result = await queryQwen3(input);
      setResponse(result);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleDeploy = useCallback(async () => {
    if (!response.trim()) return;
    
    setIsDeploying(true);
    setAgentCode("");
    
    // Clear any existing toast timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    try {
      // Create a summary of the response for the prompt
      const responseSummary = response.length > 200 
        ? `${response.substring(0, 200)}...` 
        : response;
      
      // Generate agent script using Qwen3
      const prompt = `Generate Python code for "${responseSummary}" as a Zapier-like automation bot. The code should be a complete, runnable Python script that implements the business advice as an automated agent. Include proper error handling and logging. Format as clean Python code with comments.`;
      
      const generatedCode = await queryQwen3(prompt);
      setAgentCode(generatedCode);
      setIsDeployed(true);
      
      // Auto-hide toast after 4 seconds - store timeout ref for cleanup
      toastTimeoutRef.current = setTimeout(() => {
        setIsDeployed(false);
        toastTimeoutRef.current = null;
      }, 4000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAgentCode(`# Error generating agent code\n# ${errorMessage}`);
    } finally {
      setIsDeploying(false);
    }
  }, [response]);

  const handleDownload = useCallback(() => {
    if (!agentCode.trim()) return;
    
    // Browser download using data URI (works in all browsers)
    const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(agentCode)}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'bot.py';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [agentCode]);

  return (
    <div className="container mx-auto p-4 sm:p-8 text-center relative z-10 dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
      {/* Success Toast - Agent Deployed */}
      {isDeployed && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg shadow-lg shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-bounce-subtle">
          <p className="font-semibold">✨ Agent deployed! Your solo empire just leveled up! 🚀</p>
        </div>
      )}

      {/* Dark Mode Toggle - Top Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsDark(!isDark)}
          variant="outline"
          size="sm"
          className="rounded-full w-10 h-10 p-0 border-2 dark:border-purple-400 border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 transition-all duration-300"
          aria-label="Toggle dark mode"
        >
          {isDark ? "☀️" : "🌙"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-8 pt-12 sm:pt-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-24 sm:h-36 p-4 sm:p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="h-24 sm:h-36 p-4 sm:p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
        />
      </div>
      
      {/* Qwen3 Integration Card - Enhanced with Neon Glow */}
      <Card className="mb-8 border-2 border-transparent bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 shadow-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] dark:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.7)]">
        <CardHeader className="gap-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-bounce-subtle">
            GrokForge AI - Qwen3 Wisdom
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Ask for solo business advice and summon the wisdom of Qwen3
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for solo business advice, e.g., 'Fix time trap'"
            className="min-h-[100px] resize-y border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-colors duration-300"
          />
          <Button 
            onClick={handleQuery} 
            disabled={isLoading || !input.trim()}
            className={`${NEON_BUTTON_CLASSES} disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
          >
            {isLoading ? (
              <>
                <span className="animate-spin-emoji mr-2">🌀</span>
                Summoning...
              </>
            ) : (
              "Summon Qwen3 Wisdom"
            )}
          </Button>
          {response && (
            <>
              <Card className="mt-4 border-2 border-purple-300/50 dark:border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg shadow-[0_0_15px_rgba(139,92,246,0.2)] dark:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Qwen3's Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-left whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{response}</p>
                </CardContent>
              </Card>
              {/* Deploy Agent Button */}
              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className={`mt-4 ${NEON_BUTTON_CLASSES} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isDeploying ? (
                  <>
                    <span className="animate-spin-emoji mr-2">🌀</span>
                    Generating Agent...
                  </>
                ) : (
                  "🚀 Deploy Agent"
                )}
              </Button>
              
              {/* Generated Agent Code Block */}
              {agentCode && (
                <Card className="mt-4 border-2 border-purple-300/50 dark:border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg shadow-[0_0_15px_rgba(139,92,246,0.2)] dark:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      ✨ Generated Agent Code - From advice to code, deploy your empire!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border-2 border-purple-500/30 dark:border-purple-400/30 shadow-inner">
                      <code className="text-sm sm:text-base font-mono whitespace-pre-wrap leading-relaxed">
                        {agentCode}
                      </code>
                    </pre>
                    {/* Download Bot.py Button */}
                    <Button
                      onClick={handleDownload}
                      className={NEON_BUTTON_CLASSES}
                    >
                      💾 Download Bot.py - Export your empire code!
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Original API Tester Card */}
      <Card className="border-2 dark:border-gray-700">
        <CardHeader className="gap-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Bun + React</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Edit <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono">src/App.tsx</code> and save to
            test HMR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <APITester />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
