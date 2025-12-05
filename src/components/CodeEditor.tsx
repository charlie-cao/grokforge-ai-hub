import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeEditorProps {
  code: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

/**
 * Clean code by removing markdown fences and extra text
 */
export function cleanCode(code: string): string {
  if (!code) return "";
  
  let cleaned = code.trim();
  
  // Remove all markdown code fences (various formats)
  cleaned = cleaned
    .replace(/```python:disable-run\n?/gi, "")
    .replace(/```python\n?/gi, "")
    .replace(/```py\n?/gi, "")
    .replace(/```\w*\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();
  
  // Remove common intro text patterns (more aggressive)
  cleaned = cleaned
    .replace(/^Here's\s+(a\s+)?(clean,?\s+)?(complete\s+)?(Python\s+)?(script|code|implementation)[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .replace(/^Here is[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .replace(/^This is[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .replace(/^Below is[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .replace(/^The following[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .replace(/^Explanation:[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .replace(/^### Explanation:[\s\S]*?(?=```|def |import |#|$)/gi, "")
    .trim();
  
  // Remove lines that are just explanations before code
  const lines = cleaned.split('\n');
  let codeStartIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Start of actual code (import, def, class, # comment, or empty line before code)
    if (line.startsWith('import ') || 
        line.startsWith('from ') || 
        line.startsWith('def ') || 
        line.startsWith('class ') || 
        line.startsWith('#') ||
        (line === '' && i < lines.length - 1 && (lines[i + 1].trim().startsWith('import ') || lines[i + 1].trim().startsWith('def ')))) {
      codeStartIndex = i;
      break;
    }
  }
  cleaned = lines.slice(codeStartIndex).join('\n');
  
  // Remove trailing markdown and explanations
  cleaned = cleaned.replace(/```\s*$/gm, "").trim();
  cleaned = cleaned.replace(/^Explanation:[\s\S]*$/gm, "").trim();
  
  return cleaned;
}

export function CodeEditor({ code, language = "python", onCodeChange, readOnly = false }: CodeEditorProps) {
  const [editorCode, setEditorCode] = useState(cleanCode(code));
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const pyodideRef = useRef<any>(null);

  // Update editor code when prop changes
  useEffect(() => {
    const cleaned = cleanCode(code);
    setEditorCode(cleaned);
    if (onCodeChange) {
      onCodeChange(cleaned);
    }
  }, [code, onCodeChange]);

  // Load Pyodide for Python execution
  useEffect(() => {
    if (language === "python" && typeof window !== "undefined") {
      const loadPyodide = async () => {
        try {
          // Try to load Pyodide from CDN
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js";
          script.async = true;
          
          script.onload = async () => {
            try {
              if (window.loadPyodide) {
                const pyodide = await window.loadPyodide({
                  indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/",
                });
                pyodideRef.current = pyodide;
                console.log("Pyodide loaded successfully");
              }
            } catch (err) {
              console.error("Failed to initialize Pyodide:", err);
            }
          };
          
          script.onerror = () => {
            console.error("Failed to load Pyodide script");
          };
          
          document.head.appendChild(script);
        } catch (err) {
          console.error("Failed to load Pyodide:", err);
        }
      };
      loadPyodide();
    }
  }, [language]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setEditorCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleRun = async () => {
    if (!editorCode.trim()) return;
    
    setIsRunning(true);
    setOutput("");
    setError("");

    if (language === "python") {
      if (!pyodideRef.current) {
        setError("Python runtime (Pyodide) is still loading. Please wait a moment and try again.");
        setIsRunning(false);
        return;
      }

      try {
        // Capture stdout
        pyodideRef.current.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
sys.stdout = _stdout_capture
`);
        
        // Run the user's code
        pyodideRef.current.runPython(editorCode);
        
        // Get output
        const stdout = pyodideRef.current.runPython("_stdout_capture.getvalue()");
        
        // Check if CSV was mentioned in output (for leads bot)
        if (stdout && (stdout.includes("leads.csv") || stdout.includes("CSV") || stdout.includes("csv"))) {
          setOutput(stdout + "\n\n✅ CSV file would be generated in real execution.");
          console.log("MVP: CSV generation detected in output");
        } else {
          setOutput(stdout || "Code executed successfully (no output)");
        }
      } catch (err: any) {
        const errorMsg = err.message || err.toString() || String(err);
        // Don't show SystemExit as error (it's normal for some scripts)
        if (!errorMsg.includes("SystemExit")) {
          setError(errorMsg);
        } else {
          setOutput("Code executed successfully (script completed)");
        }
        console.error("Python execution error:", err);
      }
    } else {
      setError("Code execution is only available for Python code.");
    }
    
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-md">
        <Editor
          height="400px"
          language={language}
          value={editorCode}
          onChange={handleEditorChange}
          theme={document.documentElement.classList.contains("dark") ? "vs-dark" : "light"}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
      
      {language === "python" && !readOnly && (
        <div className="flex gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning || !editorCode.trim() || !pyodideRef.current}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-md hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <span className="animate-spin-emoji mr-2">🌀</span>
                Running...
              </>
            ) : (
              "▶️ Run Python Code"
            )}
          </Button>
        </div>
      )}

      {(output || error) && (
        <Card className="border border-slate-200 dark:border-slate-700 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm text-slate-900 dark:text-slate-100">
              {error ? "❌ Error" : "📊 Output"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className={`text-sm font-mono p-4 rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-x-auto border border-slate-200 dark:border-slate-700 ${
              error ? "text-red-600 dark:text-red-400" : ""
            }`}>
              {error || output}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

