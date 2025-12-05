import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  NodeTypes,
  EdgeTypes,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType,
  ConnectionLineType,
  ConnectionMode,
  getSmoothStepPath,
  BaseEdge,
  EdgeLabelRenderer,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../index.css";
import { modelManager } from "../lib/models";

// 自定义节点类型 1: 数据输入节点
const DataInputNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="text-sm font-semibold">数据输入</div>
      </div>
      <div className="text-xs opacity-90">{data.label || "Input"}</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义节点类型 2: 处理节点
const ProcessNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg min-w-[180px] transition-all ${
        selected ? "ring-2 ring-yellow-400 scale-105" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="text-sm font-semibold">处理</div>
      </div>
      <div className="text-xs opacity-90">{data.label || "Process"}</div>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义节点类型 3: 决策节点（菱形）
const DecisionNode = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <div
        className="px-4 py-3 bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg transform rotate-45 min-w-[120px] min-h-[120px] flex items-center justify-center"
        style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
      >
        <div className="transform -rotate-45 text-center">
          <div className="text-xs font-semibold mb-1">决策</div>
          <div className="text-[10px] opacity-90">{data.label || "?"}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义节点类型 4: 输出节点
const OutputNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="text-sm font-semibold">输出</div>
      </div>
      <div className="text-xs opacity-90">{data.label || "Output"}</div>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义节点类型 5: 数据库节点
const DatabaseNode = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <div className="px-4 py-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg min-w-[160px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          <div className="text-sm font-semibold">数据库</div>
          <div className="text-xs opacity-90">{data.label || "DB"}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义节点类型 6: API 节点
const APINode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-lg">🌐</div>
        <div className="text-sm font-semibold">API</div>
      </div>
      <div className="text-xs opacity-90">{data.label || "Endpoint"}</div>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义节点类型 7: Agent 对话节点（流式）
const AgentNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      let fullResponse = "";
      const stream = modelManager.queryStream(userMessage, {
        systemPrompt: data.systemPrompt || "You are a helpful AI assistant.",
      });

      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
      setStreamingContent("");
    } catch (error) {
      console.error("Stream error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}` },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <div
        className={`px-4 py-3 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg min-w-[320px] max-w-[480px] transition-all ${
          selected ? "ring-2 ring-yellow-400" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-lg">🤖</div>
            <div className="text-sm font-semibold">AI Agent</div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            {isExpanded ? "收起" : "展开"}
          </button>
        </div>
        {!isExpanded && (
          <div className="text-xs opacity-90">
            {messages.length > 0 ? `${messages.length} 条消息` : "点击展开开始对话"}
          </div>
        )}
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {/* 对话历史 */}
            <div className="max-h-64 overflow-y-auto bg-white/10 rounded p-2 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-xs ${
                    msg.role === "user" ? "bg-blue-500/30 text-right" : "bg-white/20 text-left"
                  }`}
                >
                  <div className="font-semibold mb-1">{msg.role === "user" ? "你" : "AI"}</div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
              {isStreaming && streamingContent && (
                <div className="p-2 rounded text-xs bg-white/20 text-left">
                  <div className="font-semibold mb-1">AI</div>
                  <div className="whitespace-pre-wrap">
                    {streamingContent}
                    <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                disabled={isStreaming}
                className="flex-1 px-2 py-1 text-xs text-slate-900 bg-white rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isStreaming}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? "..." : "发送"}
              </button>
            </div>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

// 自定义边缘类型：带标签的边缘
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }: any) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: "#6366f1", strokeWidth: 2 }} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            <div className="px-2 py-1 bg-white dark:bg-slate-800 rounded shadow text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const nodeTypes: NodeTypes = {
  dataInput: DataInputNode,
  process: ProcessNode,
  decision: DecisionNode,
  output: OutputNode,
  database: DatabaseNode,
  api: APINode,
  agent: AgentNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "dataInput",
    position: { x: 100, y: 100 },
    data: { label: "用户输入" },
  },
  {
    id: "2",
    type: "process",
    position: { x: 300, y: 100 },
    data: { label: "数据验证" },
  },
  {
    id: "3",
    type: "decision",
    position: { x: 500, y: 100 },
    data: { label: "有效?" },
  },
  {
    id: "4",
    type: "process",
    position: { x: 700, y: 50 },
    data: { label: "处理数据" },
  },
  {
    id: "5",
    type: "database",
    position: { x: 700, y: 200 },
    data: { label: "存储" },
  },
  {
    id: "6",
    type: "api",
    position: { x: 900, y: 50 },
    data: { label: "发送通知" },
  },
  {
    id: "7",
    type: "output",
    position: { x: 1100, y: 50 },
    data: { label: "完成" },
  },
  {
    id: "8",
    type: "agent",
    position: { x: 500, y: 300 },
    data: { label: "AI 助手", systemPrompt: "You are a helpful AI assistant. Answer questions clearly and concisely." },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    animated: true,
    label: "数据流",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "smoothstep",
    animated: true,
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "smoothstep",
    label: "是",
    style: { stroke: "#10b981" },
  },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    type: "smoothstep",
    label: "否",
    style: { stroke: "#ef4444" },
  },
  {
    id: "e4-6",
    source: "4",
    target: "6",
    type: "smoothstep",
    animated: true,
  },
  {
    id: "e6-7",
    source: "6",
    target: "7",
    type: "smoothstep",
    animated: true,
  },
];

export function Demo3() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [variant, setVariant] = useState<"dots" | "lines" | "cross">("dots");
  const [nodeId, setNodeId] = useState(8);
  const reactFlowInstance = useRef<any>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  // 添加节点
  const addNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: `${nodeId}`,
        type,
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 400 + 100,
        },
        data: { label: `${type} Node ${nodeId}` },
      };
      setNodes((nds) => [...nds, newNode]);
      setNodeId((prev) => prev + 1);
    },
    [nodeId]
  );

  // 删除选中的节点和边
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, []);

  // 重置视图
  const resetView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2 });
    }
  }, []);

  // 清除所有
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  // 导出 JSON
  const exportJSON = useCallback(() => {
    const flow = reactFlowInstance.current?.toObject();
    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reactflow-export.json";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="w-screen h-screen bg-slate-50 dark:bg-slate-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
          instance.fitView({ padding: 0.2 });
        }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        <Background variant={variant} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "dataInput":
                return "#3b82f6";
              case "process":
                return "#a855f7";
              case "decision":
                return "#f59e0b";
              case "output":
                return "#10b981";
              case "database":
                return "#6366f1";
              case "api":
                return "#ec4899";
              default:
                return "#6b7280";
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* 顶部工具栏 */}
        <Panel position="top-center" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 m-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">添加节点:</div>
            <button
              onClick={() => addNode("dataInput")}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
            >
              数据输入
            </button>
            <button
              onClick={() => addNode("process")}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-md transition-colors"
            >
              处理
            </button>
            <button
              onClick={() => addNode("decision")}
              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-md transition-colors"
            >
              决策
            </button>
            <button
              onClick={() => addNode("output")}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
            >
              输出
            </button>
            <button
              onClick={() => addNode("database")}
              className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded-md transition-colors"
            >
              数据库
            </button>
            <button
              onClick={() => addNode("api")}
              className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white text-xs rounded-md transition-colors"
            >
              API
            </button>
            <button
              onClick={() => addNode("agent")}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded-md transition-colors"
            >
              AI Agent
            </button>
            <div className="border-l border-slate-300 dark:border-slate-600 h-6 mx-2"></div>
            <button
              onClick={deleteSelected}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors"
            >
              删除选中
            </button>
            <button
              onClick={resetView}
              className="px-3 py-1 bg-slate-500 hover:bg-slate-600 text-white text-xs rounded-md transition-colors"
            >
              重置视图
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-md transition-colors"
            >
              清除所有
            </button>
            <button
              onClick={exportJSON}
              className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-md transition-colors"
            >
              导出 JSON
            </button>
          </div>
        </Panel>

        {/* 背景样式选择 */}
        <Panel position="top-right" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 m-4">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">背景:</div>
            <button
              onClick={() => setVariant("dots")}
              className={`px-2 py-1 text-xs rounded ${
                variant === "dots"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              点
            </button>
            <button
              onClick={() => setVariant("lines")}
              className={`px-2 py-1 text-xs rounded ${
                variant === "lines"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              线
            </button>
            <button
              onClick={() => setVariant("cross")}
              className={`px-2 py-1 text-xs rounded ${
                variant === "cross"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              交叉
            </button>
          </div>
        </Panel>

        {/* 底部信息栏 */}
        <Panel position="bottom-center" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 m-4">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            💡 提示: 拖拽节点 | 连接节点 | 按 Delete 删除 | Shift+点击多选 | 双击节点编辑
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default Demo3;

