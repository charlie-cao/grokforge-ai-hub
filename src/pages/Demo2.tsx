import { useState, useEffect, useRef, useCallback } from "react";
import { ReactFlow, Node, Edge, applyNodeChanges, NodeChange, Connection, addEdge, Background, Controls, MiniMap, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { modelManager } from "../lib/models";
import "../index.css";

// 自定义输入节点 - 简化版，无边框，可内联编辑
const InputNode = ({ data, selected }: { data: { text: string; isDisabled: boolean; onTextChange: (text: string) => void; onSubmit: () => void }; selected?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(data.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalText(data.text);
  }, [data.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!data.isDisabled && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    data.onTextChange(localText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(false);
      data.onTextChange(localText);
      if (localText.trim()) {
        // 使用 setTimeout 确保状态更新后再提交
        setTimeout(() => {
          data.onSubmit();
        }, 0);
      }
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(false);
      setLocalText(data.text);
    }
  };

  return (
    <div 
      className={`px-4 py-3 rounded-lg ${data.isDisabled ? 'bg-slate-200' : 'bg-white'} shadow-md transition-all duration-300 cursor-text min-w-[200px]`}
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full text-sm text-slate-700 bg-transparent border-none outline-none"
          placeholder="输入痛点，如：找客户"
        />
      ) : (
        <div className="text-sm text-slate-700 whitespace-pre-wrap">
          {data.text || "输入痛点，如：找客户"}
        </div>
      )}
      {isEditing && localText.trim() && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(false);
            data.onTextChange(localText);
            data.onSubmit();
          }}
          className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-md transition-colors"
        >
          提交
        </button>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

// 思考中节点 - 带连接线，显示分析过程
const ThinkingNode = ({ data }: { data: { process: string; isExpanded: boolean; onToggle: () => void } }) => {
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
    <div className="relative">
      <div 
        className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center shadow-lg cursor-pointer"
        style={{ transform: `scale(${scale})` }}
        onClick={data.onToggle}
      >
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
        思考中
      </div>
      {data.isExpanded && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-blue-500 p-4 z-10">
          <div className="text-sm font-semibold text-blue-600 mb-2">分析过程</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {data.process || "正在分析..."}
          </div>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
    </div>
  );
};

// 步骤节点 - 可点击生成
const StepNode = ({ data, selected }: { data: { step: number; desc: string; tool?: string; isGenerating: boolean; onGenerate: () => void }; selected?: boolean }) => {
  return (
    <div 
      className={`px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg min-w-[280px] cursor-pointer transition-all hover:shadow-xl ${selected ? 'ring-2 ring-blue-400' : ''}`}
      onClick={data.onGenerate}
    >
      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
        {data.step}. {data.desc}
      </div>
      {data.tool && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          工具: {data.tool}
        </div>
      )}
      {data.isGenerating && (
        <div className="mt-2 text-xs text-blue-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          制作中...
        </div>
      )}
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
    </div>
  );
};

// 结果节点 - 显示生成结果，可折叠
const ResultNode = ({ data }: { data: { content: string; isExpanded: boolean; onToggle: () => void } }) => {
  return (
    <div className="relative">
      <div 
        className="px-4 py-3 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg min-w-[320px] max-w-[480px] cursor-pointer"
        onClick={data.onToggle}
      >
        <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
          生成结果 {data.isExpanded ? "▼" : "▶"}
        </div>
        {data.isExpanded && (
          <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
            {data.content || "暂无内容"}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
    </div>
  );
};

const nodeTypes = {
  input: InputNode,
  thinking: ThinkingNode,
  step: StepNode,
  result: ResultNode,
};

export function Demo2() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState("");
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const inputNodeId = "input-node";
  const thinkingNodeId = "thinking-node";
  const reactFlowInstance = useRef<any>(null);

  // 提交处理
  const handleSubmit = useCallback(async () => {
    // 从当前节点状态获取最新的输入文本
    setNodes((nds) => {
      const inputNode = nds.find((n) => n.id === inputNodeId);
      const currentText = inputNode?.data?.text || inputText || "";
      
      if (!currentText.trim() || isAnalyzing) return nds;

      setIsAnalyzing(true);
      setThinkingProcess("");

      // 1. 输入框变灰
      const updatedNodes = nds.map((node) => {
        if (node.id === inputNodeId) {
          return {
            ...node,
            data: { ...node.data, text: currentText, isDisabled: true },
          };
        }
        return node;
      });

      // 2. 检查是否已存在思考节点和旧的连接线，如果存在则先删除
      const filteredNodes = updatedNodes.filter((n) => n.id !== thinkingNodeId);
      setEdges((eds) => eds.filter((e) => !(e.source === inputNodeId && e.target === thinkingNodeId)));

      // 3. 创建思考节点（在输入框下方）
      const inputNode = filteredNodes.find((n) => n.id === inputNodeId);
      if (!inputNode) return filteredNodes;

      const thinkingNode: Node = {
        id: thinkingNodeId,
        type: "thinking",
        position: { 
          x: inputNode.position.x + ((inputNode.style?.width as number) || 200) / 2 - 32, 
          y: inputNode.position.y + 100 
        },
        data: {
          process: "",
          isExpanded: false,
          onToggle: () => setIsThinkingExpanded((prev) => !prev),
        },
        draggable: false,
      };

      // 4. 创建从输入到思考的连接线（使用唯一 ID）
      const edgeId = `edge-${inputNodeId}-${thinkingNodeId}-${Date.now()}`;
      const edge: Edge = {
        id: edgeId,
        source: inputNodeId,
        target: thinkingNodeId,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2 },
      };

      setEdges((eds) => [...eds, edge]);

      // 5. 开始分析（异步执行）
      (async () => {
        try {
          const analysisPrompt = `Analyze the user's pain point: "${currentText.trim()}". Break it down into 3-5 tools/solutions. Output JSON format: {"steps": [{"step": 1, "desc": "分析获客痛点", "tool": "LeadsBot"}, {"step": 2, "desc": "需要CRM管理", "tool": "CRM"}], "tools": [{"name": "LeadsBot", "type": "bot", "priority": 1}]}. Output ONLY valid JSON, no markdown.`;

          // 模拟流式显示分析过程
          const processSteps = [
            "正在分析用户痛点...",
            "识别核心需求...",
            "匹配解决方案...",
            "生成工具建议...",
          ];

          let currentProcess = "";
          processSteps.forEach((step, index) => {
            setTimeout(() => {
              currentProcess += step + "\n";
              setThinkingProcess(currentProcess);
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === thinkingNodeId) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        process: currentProcess,
                      },
                    };
                  }
                  return node;
                })
              );
            }, index * 500);
          });

          const response = await modelManager.query(analysisPrompt);

          // 解析分析结果
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[0]);

            // 完成分析过程
            setTimeout(() => {
              currentProcess += "分析完成！\n";
              setThinkingProcess(currentProcess);
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === thinkingNodeId) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        process: currentProcess,
                      },
                    };
                  }
                  return node;
                })
              );

              // 延迟折叠思考节点，然后显示步骤
              setTimeout(() => {
                setIsThinkingExpanded(false);
                
                // 流式显示分析步骤（在右侧）
                if (analysisData.steps && Array.isArray(analysisData.steps)) {
                  const rightX = 800;
                  const startY = 200;

                  analysisData.steps.forEach((step: any, index: number) => {
                    setTimeout(() => {
                      const stepNodeId = `step-${index}-${Date.now()}`;
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
                          isGenerating: false,
                          onGenerate: () => handleStepGenerate(stepNodeId, step),
                        },
                        draggable: false,
                      };

                      // 创建从思考节点到步骤的连接线（使用唯一 ID）
                      const stepEdge: Edge = {
                        id: `edge-${thinkingNodeId}-${stepNodeId}-${Date.now()}`,
                        source: thinkingNodeId,
                        target: stepNodeId,
                        type: "smoothstep",
                        animated: true,
                        style: { stroke: "#3b82f6", strokeWidth: 2 },
                      };

                      setNodes((nds) => [...nds, stepNode]);
                      setEdges((eds) => [...eds, stepEdge]);
                    }, index * 600);
                  });

                  // 延迟移除思考节点
                  setTimeout(() => {
                    setNodes((nds) => nds.filter((n) => n.id !== thinkingNodeId));
                    setEdges((eds) => eds.filter((e) => e.source !== thinkingNodeId && e.target !== thinkingNodeId));
                    setIsAnalyzing(false);
                  }, analysisData.steps.length * 600 + 1000);
                }
              }, 1000);
            }, processSteps.length * 500 + 500);
          }
        } catch (error) {
          console.error("Analysis error:", error);
          setNodes((nds) => nds.filter((n) => n.id !== thinkingNodeId));
          setEdges((eds) => eds.filter((e) => e.source !== thinkingNodeId && e.target !== thinkingNodeId));
          setIsAnalyzing(false);
        }
      })();

      return [...filteredNodes, thinkingNode];
    });
  }, [inputText, isAnalyzing, handleStepGenerate]);
  }, [inputText, isAnalyzing]);

  // 处理步骤生成
  const handleStepGenerate = useCallback(async (stepNodeId: string, step: any) => {
    // 标记为生成中
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === stepNodeId) {
          return {
            ...node,
            data: { ...node.data, isGenerating: true },
          };
        }
        return node;
      })
    );

    try {
      // 生成内容
      const generatePrompt = `Generate a solution for: ${step.desc}. Tool: ${step.tool || "N/A"}. Output a detailed implementation plan or code.`;
      const response = await modelManager.query(generatePrompt);

      // 创建结果节点（在步骤节点右侧）
      setNodes((nds) => {
        const stepNode = nds.find((n) => n.id === stepNodeId);
        if (!stepNode) return nds;

        const resultNodeId = `result-${stepNodeId}`;
        const resultNode: Node = {
          id: resultNodeId,
          type: "result",
          position: { x: stepNode.position.x + 350, y: stepNode.position.y },
          data: {
            content: response.content,
            isExpanded: true,
            onToggle: () => {
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === resultNodeId) {
                    return {
                      ...node,
                      data: { ...node.data, isExpanded: !node.data.isExpanded },
                    };
                  }
                  return node;
                })
              );
            },
          },
          draggable: false,
        };

        // 创建从步骤到结果的连接线
        const edge: Edge = {
          id: `edge-${stepNodeId}-${resultNodeId}`,
          source: stepNodeId,
          target: resultNodeId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
        };

        setEdges((eds) => [...eds, edge]);

        return [...nds, resultNode];
      });

      // 延迟折叠结果节点
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id.startsWith(`result-${stepNodeId}`)) {
              return {
                ...node,
                data: { ...node.data, isExpanded: false },
              };
            }
            return node;
          })
        );
      }, 3000);

      // 取消生成中状态
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === stepNodeId) {
            return {
              ...node,
              data: { ...node.data, isGenerating: false },
            };
          }
          return node;
        })
      );
    } catch (error) {
      console.error("Generate error:", error);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === stepNodeId) {
            return {
              ...node,
              data: { ...node.data, isGenerating: false },
            };
          }
          return node;
        })
      );
    }
  }, []);

  // 初始化输入节点（居中）
  useEffect(() => {
    const initialNode: Node = {
      id: inputNodeId,
      type: "input",
      position: { x: 400, y: 300 },
      data: { 
        text: "输入痛点，如：找客户", 
        isDisabled: false,
        onTextChange: (text: string) => {
          setInputText(text);
          // 动态调整节点宽度
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === inputNodeId) {
                const textLength = text.length || 0;
                const minWidth = 200;
                const maxWidth = 500;
                const newWidth = Math.min(maxWidth, Math.max(minWidth, textLength * 10 + 50));
                return {
                  ...node,
                  style: { width: newWidth },
                  data: { ...node.data, text },
                };
              }
              return node;
            })
          );
        },
        onSubmit: handleSubmit,
      },
      draggable: false,
    };
    setNodes([initialNode]);
  }, [handleSubmit]);

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

  return (
    <div className="w-screen h-screen bg-slate-50 dark:bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
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
    </div>
  );
}

export default Demo2;
