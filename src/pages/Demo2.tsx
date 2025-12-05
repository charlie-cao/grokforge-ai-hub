import { useState, useEffect, useRef, useCallback } from "react";
import { ReactFlow, Node, Edge, applyNodeChanges, NodeChange, Connection, addEdge, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { modelManager } from "../lib/models";
import "../index.css";

interface AnalysisStep {
  id: string;
  text: string;
  tool?: string;
}

// 自定义输入节点
const InputNode = ({ data }: { data: { text: string; isDisabled: boolean } }) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${data.isDisabled ? 'bg-slate-200 border-slate-300' : 'bg-white border-blue-500'} shadow-lg transition-all duration-300`}>
      <div className="text-sm text-slate-700 whitespace-pre-wrap">{data.text || "输入痛点，如：找客户"}</div>
    </div>
  );
};

// 自定义步骤节点
const StepNode = ({ data }: { data: { step: number; desc: string; tool?: string } }) => {
  return (
    <div className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg min-w-[280px]">
      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
        {data.step}. {data.desc}
      </div>
      {data.tool && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          工具: {data.tool}
        </div>
      )}
    </div>
  );
};

// 自定义 Loading 节点
const LoadingNode = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      const newScale = 1 + Math.sin(frame * 0.08) * 0.15;
      setScale(newScale);
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div 
      className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

const nodeTypes = {
  input: InputNode,
  step: StepNode,
  loading: LoadingNode,
};

export function Demo2() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputNodeId = "input-node";
  const loadingNodeId = "loading-node";
  const reactFlowInstance = useRef<any>(null);

  // 初始化输入节点（居中）
  useEffect(() => {
    const initialNode: Node = {
      id: inputNodeId,
      type: "input",
      position: { x: 400, y: 300 },
      data: { text: "输入痛点，如：找客户", isDisabled: false },
      draggable: false,
    };
    setNodes([initialNode]);
  }, []);

  // 处理节点变化
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 监听输入框编辑（通过双击节点进入编辑模式）
  useEffect(() => {
    if (!isInputFocused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isAnalyzing) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInputFocused, isAnalyzing, inputText]);

  // 处理输入文本变化
  const handleInputChange = useCallback((newText: string) => {
    setInputText(newText);
    
    // 动态调整输入框宽度（呼吸感）
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === inputNodeId) {
          const textLength = newText.length || 0;
          const minWidth = 300;
          const maxWidth = 600;
          const newWidth = Math.min(maxWidth, Math.max(minWidth, textLength * 12 + 50));
          
          return {
            ...node,
            style: { width: newWidth },
            data: { ...node.data, text: newText || "输入痛点，如：找客户", isDisabled: false },
          };
        }
        return node;
      })
    );
  }, []);

  // 提交处理
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);

    // 1. 输入框变灰
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === inputNodeId) {
          return {
            ...node,
            data: { ...node.data, text: inputText, isDisabled: true },
          };
        }
        return node;
      })
    );

    // 2. 创建 loading 节点（在输入框下方）
    setNodes((nds) => {
      const inputNode = nds.find((n) => n.id === inputNodeId);
      if (!inputNode) return nds;

      const loadingNode: Node = {
        id: loadingNodeId,
        type: "loading",
        position: { 
          x: inputNode.position.x + ((inputNode.style?.width as number) || 300) / 2 - 32, 
          y: inputNode.position.y + 80 
        },
        data: {},
        draggable: false,
      };

      return [...nds, loadingNode];
    });

    // 3. 开始分析
    try {
      const analysisPrompt = `Analyze the user's pain point: "${inputText.trim()}". Break it down into 3-5 tools/solutions. Output JSON format: {"steps": [{"step": 1, "desc": "分析获客痛点", "tool": "LeadsBot"}, {"step": 2, "desc": "需要CRM管理", "tool": "CRM"}], "tools": [{"name": "LeadsBot", "type": "bot", "priority": 1}]}. Output ONLY valid JSON, no markdown.`;

      const response = await modelManager.query(analysisPrompt);

      // 解析分析结果
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);

        // 流式显示分析步骤（在右侧）
        if (analysisData.steps && Array.isArray(analysisData.steps)) {
          const rightX = 800;
          const startY = 200;

          analysisData.steps.forEach((step: any, index: number) => {
            setTimeout(() => {
              const stepNodeId = `step-${index}`;
              const y = startY + index * 130;

              // 创建步骤节点
              const stepNode: Node = {
                id: stepNodeId,
                type: "step",
                position: { x: rightX, y },
                data: {
                  step: step.step,
                  desc: step.desc,
                  tool: step.tool,
                },
                draggable: false,
              };

              // 创建连接线
              const edge: Edge = {
                id: `edge-${inputNodeId}-${stepNodeId}`,
                source: inputNodeId,
                target: stepNodeId,
                type: "smoothstep",
                animated: true,
                style: { stroke: "#3b82f6", strokeWidth: 2 },
              };

              setNodes((nds) => [...nds, stepNode]);
              setEdges((eds) => [...eds, edge]);
            }, index * 800); // 流式显示，每个间隔 800ms
          });

          // 延迟移除 loading
          setTimeout(() => {
            setNodes((nds) => nds.filter((n) => n.id !== loadingNodeId));
            setIsAnalyzing(false);
          }, analysisData.steps.length * 800 + 1000);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setNodes((nds) => nds.filter((n) => n.id !== loadingNodeId));
      setIsAnalyzing(false);
    }
  }, [inputText, isAnalyzing]);

  // 处理节点点击（进入编辑模式）
  const onNodeClick = useCallback((event: any, node: Node) => {
    if (node.id === inputNodeId && !isAnalyzing) {
      setIsInputFocused(true);
      const currentText = node.data.text || "";
      if (currentText === "输入痛点，如：找客户") {
        setInputText("");
        handleInputChange("");
      } else {
        setInputText(currentText);
      }
    }
  }, [isAnalyzing, handleInputChange]);

  return (
    <div className="w-screen h-screen bg-slate-50 dark:bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
          instance.fitView();
        }}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50 dark:bg-slate-900"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* 输入对话框（当输入框被双击时显示） */}
      {isInputFocused && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsInputFocused(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">输入痛点</h2>
            <textarea
              value={inputText}
              onChange={(e) => {
                const newText = e.target.value;
                setInputText(newText);
                handleInputChange(newText);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                  setIsInputFocused(false);
                }
                if (e.key === "Escape") {
                  setIsInputFocused(false);
                }
              }}
              placeholder="输入痛点，如：找客户"
              className="w-full min-h-24 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  handleSubmit();
                  setIsInputFocused(false);
                }}
                disabled={!inputText.trim() || isAnalyzing}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交
              </button>
              <button
                onClick={() => setIsInputFocused(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Demo2;

