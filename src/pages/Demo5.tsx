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
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  MarkerType,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Editor from "@monaco-editor/react";
import { create } from "zustand";
import { atom, useAtom } from "jotai";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  Code,
  Workflow,
  Database,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info,
  Play,
  Save,
  Download,
  Upload,
  Settings,
  Layers,
  Type,
  Layout,
  Cpu,
  Shield,
  Sparkles,
} from "lucide-react";
import "../index.css";

// ==================== Zustand Store (全局状态管理) ====================
interface FlowStore {
  nodes: Node[];
  edges: Edge[];
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
}

const useFlowStore = create<FlowStore>((set) => ({
  nodes: [],
  edges: [],
  updateNodes: (nodes) => set({ nodes }),
  updateEdges: (edges) => set({ edges }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  removeNode: (id) => set((state) => ({ nodes: state.nodes.filter((n) => n.id !== id) })),
}));

// ==================== Jotai Atoms (局部状态管理) ====================
const tiptapContentAtom = atom<string>("");
const monacoCodeAtom = atom<string>("// Welcome to Monaco Editor\n// This is a powerful code editor\nconsole.log('Hello, World!');");
const validationResultAtom = atom<{ success: boolean; message: string } | null>(null);
const gridLayoutAtom = atom<Layout[]>([]);

// ==================== Zod Schemas (数据验证) ====================
const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(["default", "input", "process", "output"]),
  data: z.object({
    label: z.string().min(1, "Label is required"),
    description: z.string().optional(),
  }),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const CodeSchema = z.object({
  code: z.string().min(10, "Code must be at least 10 characters"),
  language: z.enum(["javascript", "typescript", "python", "json"]),
});

// ==================== React Flow 自定义节点 ====================
const FlowNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg min-w-[200px] transition-all ${
        selected ? "ring-2 ring-yellow-400 scale-105" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Workflow className="w-4 h-4" />
        <div className="text-sm font-semibold">{data.label || "Node"}</div>
      </div>
      {data.description && (
        <div className="text-xs opacity-90 mb-2">{data.description}</div>
      )}
      <Badge variant="secondary" className="text-xs">
        {data.type || "default"}
      </Badge>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  default: FlowNode,
  input: FlowNode,
  process: FlowNode,
  output: FlowNode,
};

// ==================== Tiptap 富文本编辑器组件 ====================
const RichTextEditorPanel = () => {
  const [content, setContent] = useAtom(tiptapContentAtom);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your rich text here... Use the toolbar to format your content.",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter((word) => word.length > 0).length);
    },
  });

  if (!editor) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tiptap Rich Text Editor
          </CardTitle>
          <CardDescription>
            Loading editor...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tiptap Rich Text Editor
            </CardTitle>
            <CardDescription>
              Powerful headless rich text editor based on ProseMirror. Supports Markdown, formatting, and custom extensions.
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Type className="w-3 h-3" />
            {wordCount} words
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2">
        {/* Toolbar */}
        <div className="flex gap-1 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Strikethrough"
          >
            <s>S</s>
          </Button>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Heading 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Heading 3"
          >
            H3
          </Button>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Bullet List"
          >
            •
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Ordered List"
          >
            1.
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Code Block"
          >
            {"</>"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-slate-200 dark:bg-slate-700" : ""}
            title="Blockquote"
          >
            "
          </Button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded p-4 overflow-y-auto bg-white dark:bg-slate-900 min-h-[300px]">
          <EditorContent
            editor={editor}
            className="prose prose-sm dark:prose-invert max-w-none focus:outline-none"
          />
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4" />
          <span>Powered by Tiptap (ProseMirror). Content is managed by Jotai atom state.</span>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== Monaco 代码编辑器组件 ====================
const CodeEditorPanel = () => {
  const [code, setCode] = useAtom(monacoCodeAtom);
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python" | "json">("javascript");
  const [validationResult, setValidationResult] = useAtom(validationResultAtom);

  const validateCode = useCallback(() => {
    try {
      const result = CodeSchema.parse({ code, language });
      setValidationResult({ success: true, message: "Code validation passed!" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationResult({
          success: false,
          message: error.errors[0].message,
        });
      } else {
        setValidationResult({
          success: false,
          message: "Validation failed",
        });
      }
    }
  }, [code, language, setValidationResult]);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    setValidationResult(null);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Monaco Code Editor
            </CardTitle>
            <CardDescription>
              VS Code's editor in the browser. Full IntelliSense, syntax highlighting, and debugging support.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="json">JSON</option>
            </select>
            <Button size="sm" onClick={validateCode} className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Validate (Zod)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-2">
        <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme={document.documentElement.classList.contains("dark") ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
            }}
          />
        </div>
        {validationResult && (
          <div
            className={`p-3 rounded-md flex items-center gap-2 ${
              validationResult.success
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
            }`}
          >
            {validationResult.success ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{validationResult.message}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4" />
          <span>Code state managed by Jotai. Validation powered by Zod schema.</span>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== React Flow 编辑器组件 ====================
const FlowEditorPanel = () => {
  const { nodes, edges, updateNodes, updateEdges, addNode } = useFlowStore();
  const reactFlowInstance = useRef<any>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      updateNodes(newNodes);
    },
    [nodes, updateNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      updateEdges(newEdges);
    },
    [edges, updateEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#6366f1", strokeWidth: 2 },
      };
      updateEdges(addEdge(newEdge, edges));
    },
    [edges, updateEdges]
  );

  const handleAddNode = useCallback(
    (type: "input" | "process" | "output" | "default" = "default") => {
      const newNode: Node = {
        id: `node-${nodeIdCounter}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
        },
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node ${nodeIdCounter}`,
          description: `This is a ${type} node managed by Zustand`,
          type,
        },
      };
      addNode(newNode);
      setNodeIdCounter((prev) => prev + 1);
    },
    [nodeIdCounter, addNode]
  );

  const handleValidateNodes = useCallback(() => {
    try {
      nodes.forEach((node) => {
        NodeSchema.parse(node);
      });
      alert(`✅ All ${nodes.length} nodes are valid!`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert(`❌ Validation failed: ${error.errors[0].message}`);
      }
    }
  }, [nodes]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              React Flow Editor
            </CardTitle>
            <CardDescription>
              Interactive node-based editor. Drag nodes, connect them, and build visual workflows. State managed by Zustand.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAddNode("input")}>
              + Input
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddNode("process")}>
              + Process
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddNode("output")}>
              + Output
            </Button>
            <Button size="sm" onClick={handleValidateNodes} className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Validate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full border border-slate-200 dark:border-slate-700 rounded">
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
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
          >
            <Background variant="dots" gap={16} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "input":
                    return "#3b82f6";
                  case "process":
                    return "#a855f7";
                  case "output":
                    return "#10b981";
                  default:
                    return "#6366f1";
                }
              }}
            />
          </ReactFlow>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4" />
          <span>
            {nodes.length} nodes, {edges.length} edges. Global state managed by Zustand store.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== 主 Demo 组件 ====================
export function Demo5() {
  const [layouts, setLayouts] = useAtom(gridLayoutAtom);
  const [activeTab, setActiveTab] = useState("overview");

  // Initialize default grid layout
  useEffect(() => {
    if (layouts.length === 0) {
      const defaultLayout: Layout[] = [
        { i: "flow", x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
        { i: "editor", x: 6, y: 0, w: 6, h: 5, minW: 4, minH: 4 },
        { i: "code", x: 0, y: 5, w: 12, h: 5, minW: 6, minH: 4 },
      ];
      setLayouts(defaultLayout);
    }
  }, []);

  const onLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setLayouts(newLayout);
    },
    [setLayouts]
  );

  return (
    <div className="w-screen h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-500" />
                Demo 5: 完整技术栈展示
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                React Flow + Tiptap + react-grid-layout + Monaco + shadcn/ui + Zustand + Jotai + Zod
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                React Grid Layout
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Zustand + Jotai
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Zod Validation
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full max-w-[1800px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                概览
              </TabsTrigger>
              <TabsTrigger value="flow" className="flex items-center gap-2">
                <Workflow className="w-4 h-4" />
                React Flow
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tiptap
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Monaco
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                布局系统
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* React Flow Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5 text-blue-500" />
                      React Flow
                    </CardTitle>
                    <CardDescription>可视化流程图编辑器</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      React Flow 是一个强大的 React 图编辑器库，支持节点拖拽、连接、缩放、平移等功能。
                      适合构建工作流编辑器、流程图、数据流图等可视化应用。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">状态管理: Zustand</Badge>
                      <Badge variant="secondary">验证: Zod Schema</Badge>
                      <Badge variant="secondary">节点类型: 自定义</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Tiptap Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Tiptap
                    </CardTitle>
                    <CardDescription>富文本编辑器</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Tiptap 是基于 ProseMirror 的 headless 富文本编辑器。
                      支持 Markdown、格式化、自定义扩展，适合构建 CMS、文档编辑器等。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">状态管理: Jotai Atom</Badge>
                      <Badge variant="secondary">扩展: StarterKit</Badge>
                      <Badge variant="secondary">功能: 实时字数统计</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Monaco Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-green-500" />
                      Monaco Editor
                    </CardTitle>
                    <CardDescription>代码编辑器</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Monaco Editor 是 VS Code 的编辑器核心，提供完整的代码编辑体验。
                      支持语法高亮、IntelliSense、多语言等。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">状态管理: Jotai Atom</Badge>
                      <Badge variant="secondary">验证: Zod Schema</Badge>
                      <Badge variant="secondary">语言: JS/TS/Python/JSON</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* React Grid Layout Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-orange-500" />
                      React Grid Layout
                    </CardTitle>
                    <CardDescription>拖拽布局系统</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      React Grid Layout 提供可拖拽、可调整大小的网格布局。
                      适合构建 Dashboard、页面编辑器、可自定义布局的应用。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">状态管理: Jotai Atom</Badge>
                      <Badge variant="secondary">功能: 拖拽 + 调整大小</Badge>
                      <Badge variant="secondary">响应式: 支持</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Zustand Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-500" />
                      Zustand
                    </CardTitle>
                    <CardDescription>全局状态管理</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Zustand 是一个轻量级、极简的状态管理库。
                      用于管理 React Flow 的节点和边等全局状态，性能优异。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">类型: 全局状态</Badge>
                      <Badge variant="secondary">性能: 极快</Badge>
                      <Badge variant="secondary">API: 极简</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Jotai Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Jotai
                    </CardTitle>
                    <CardDescription>原子状态管理</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Jotai 采用原子化设计，适合管理局部状态。
                      用于管理编辑器内容、代码内容、布局等细粒度状态。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">类型: 原子状态</Badge>
                      <Badge variant="secondary">粒度: 细粒度</Badge>
                      <Badge variant="secondary">组合: 可组合</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Zod Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      Zod
                    </CardTitle>
                    <CardDescription>数据验证库</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Zod 是 TypeScript 生态最流行的 Schema 验证库。
                      用于验证节点数据、代码内容等，提供类型安全的验证。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">类型: Schema 验证</Badge>
                      <Badge variant="secondary">TypeScript: 完美支持</Badge>
                      <Badge variant="secondary">功能: 类型推断</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Shadcn UI Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-500" />
                      Shadcn UI
                    </CardTitle>
                    <CardDescription>UI 组件库</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Shadcn/ui 是基于 Radix UI + Tailwind CSS 的组件库。
                      所有组件都是可复制的代码，可完全自定义。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">基础: Radix UI</Badge>
                      <Badge variant="secondary">样式: Tailwind CSS</Badge>
                      <Badge variant="secondary">定制: 完全可定制</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Lucide Icons Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-cyan-500" />
                      Lucide Icons
                    </CardTitle>
                    <CardDescription>图标库</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Lucide Icons 提供 1500+ 精美的图标。
                      与 shadcn/ui 完美集成，支持 Tree-shaking。
                    </p>
                    <div className="space-y-2">
                      <Badge variant="secondary">数量: 1500+</Badge>
                      <Badge variant="secondary">Tree-shaking: 支持</Badge>
                      <Badge variant="secondary">类型: TypeScript</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="flow" className="flex-1">
              <FlowEditorPanel />
            </TabsContent>

            <TabsContent value="editor" className="flex-1">
              <RichTextEditorPanel />
            </TabsContent>

            <TabsContent value="code" className="flex-1">
              <CodeEditorPanel />
            </TabsContent>

            <TabsContent value="layout" className="flex-1 overflow-hidden">
              <div className="h-full">
                <Card className="h-full flex flex-col mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5" />
                      React Grid Layout - 拖拽布局系统
                    </CardTitle>
                    <CardDescription>
                      Drag and resize panels to customize your workspace. Layout state is managed by Jotai atom.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <GridLayout
                  className="layout"
                  layout={layouts}
                  cols={12}
                  rowHeight={100}
                  width={window.innerWidth - 64}
                  onLayoutChange={onLayoutChange}
                  isDraggable={true}
                  isResizable={true}
                >
                  <div key="flow" className="bg-transparent">
                    <FlowEditorPanel />
                  </div>
                  <div key="editor" className="bg-transparent">
                    <RichTextEditorPanel />
                  </div>
                  <div key="code" className="bg-transparent">
                    <CodeEditorPanel />
                  </div>
                </GridLayout>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Demo5;

