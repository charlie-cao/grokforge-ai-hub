import { CodeEditor, cleanCode } from "./CodeEditor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

interface ChatMessageProps {
  message: Message;
  onDownload?: (code: string) => void;
}

export function ChatMessage({ message, onDownload }: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasCode = message.agentCode && message.agentCode.trim();
  const hasLeads = message.leads && message.leads.length > 0;
  const hasDecision = message.decisionPerspectives !== undefined;

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          G
        </div>
      )}
      
      <div className={`flex-1 max-w-3xl ${isUser ? "order-2" : ""}`}>
        <div
          className={`rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-md ${
            isUser
              ? "bg-blue-500 text-white ml-auto"
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          }`}
        >
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>

          {/* Generated Code */}
          {hasCode && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                ✨ Generated Agent Code
              </div>
              <CodeEditor
                code={message.agentCode!}
                language="python"
                readOnly={false}
              />
              {onDownload && (
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => onDownload(message.agentCode!)}
                    className="bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-md"
                    size="sm"
                  >
                    💾 Download
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Leads Table */}
          {hasLeads && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                📊 Simulated Leads
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-600 dark:text-blue-400">Name</TableHead>
                      <TableHead className="text-blue-600 dark:text-blue-400">Email</TableHead>
                      <TableHead className="text-blue-600 dark:text-blue-400">Company</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {message.leads!.map((lead, index) => (
                      <TableRow key={index}>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.company}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Decision Perspectives */}
          {hasDecision && message.decisionPerspectives && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                🎯 Decision Perspectives - Virtual Board
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">CEO Perspective:</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{message.decisionPerspectives.ceo}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">COO Perspective:</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{message.decisionPerspectives.coo}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Investor Perspective:</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{message.decisionPerspectives.investor}</div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Summary:</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{message.decisionPerspectives.summary}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Next Steps:</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{message.decisionPerspectives.nextSteps}</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                💡 On real deploy, decision log would be saved to: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">decision_log.txt</code>
              </p>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
}

