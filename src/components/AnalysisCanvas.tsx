import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

interface AnalysisCanvasProps {
  analysisSteps?: Array<{
    step: number;
    desc: string;
    tool?: string;
  }>;
  isAnalyzing?: boolean;
}

export function AnalysisCanvas({ analysisSteps = [], isAnalyzing = false }: AnalysisCanvasProps) {
  return (
    <div className="w-full h-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Tldraw 
        persistenceKey="grokforge-analysis"
        hideUi={false}
      />
    </div>
  );
}

