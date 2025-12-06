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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import "../index.css";

// ==================== Zustand Store ====================
interface AppState {
  flowNodes: Node[];
  flowEdges: Edge[];
  gridLayout: Layout[];
  updateFlowNodes: (nodes: Node[]) => void;
  updateFlowEdges: (edges: Edge[]) => void;
  updateGridLayout: (layout: Layout[]) => void;
}

const useAppStore = create<AppState>((set) => ({
  flowNodes: [],
  flowEdges: [],
  gridLayout: [],
  updateFlowNodes: (nodes) => set({ flowNodes: nodes }),
  updateFlowEdges: (edges) => set({ flowEdges: edges }),
  updateGridLayout: (layout) => set({ gridLayout: layout }),
}));

// ==================== Jotai Atoms ====================
const editorContentAtom = atom<string>("");
const codeContentAtom = atom<string>("// Write your code here\nconsole.log('Hello World');");
const validationErrorAtom = atom<string>("");

// ==================== Zod Schemas ====================
const NodeDataSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["input", "process", "output"]),
  description: z.string().optional(),
});

const CodeSchema = z.object({
  code: z.string().min(10, "Code must be at least 10 characters"),
  language: z.enum(["javascript", "typescript", "python"]),
});

// ==================== React Flow Nodes ====================
const FlowNode = ({ data, selected }: { data: any; selected?: boolean }) => {
  return (
    <div
      className={`px-4 py-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg min-w-[180px] transition-all ${
        selected ? "ring-2 ring-yellow-400 scale-105" : ""
      }`}
    >
      <div className="text-sm font-semibold mb-1">{data.label || "Node"}</div>
      {data.description && <div className="text-xs opacity-90">{data.description}</div>}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

// ==================== Tiptap Editor Component ====================
const RichTextEditor = () => {
  const [content, setContent] = useAtom(editorContentAtom);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your rich text here...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm">Tiptap Rich Text Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex gap-1 mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            <strong>B</strong>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            <em>I</em>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            <s>S</s>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            •
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            1.
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "bg-slate-200 dark:bg-slate-700" : ""}
          >
            {"</>"}
          </Button>
        </div>

        {/* Editor */}
        <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded p-4 overflow-y-auto bg-white dark:bg-slate-900">
          <EditorContent editor={editor} className="prose prose-sm dark:prose-invert max-w-none" />
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== Monaco Code Editor Component ====================
const CodeEditorPanel = () => {
  const [code, setCode] = useAtom(codeContentAtom);
  const [error, setError] = useAtom(validationErrorAtom);
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python">("javascript");

  const validateCode = useCallback(() => {
    try {
      const result = CodeSchema.parse({ code, language });
      setError("");
      return result;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return null;
    }
  }, [code, language, setError]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Monaco Code Editor</CardTitle>
          <div className="flex gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
            <Button size="sm" onClick={validateCode}>
              Validate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme={document.documentElement.classList.contains("dark") ? "vs-dark" : "light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              automaticLayout: true,
            }}
          />
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ==================== React Flow Panel ====================
const FlowEditorPanel = () => {
  const { flowNodes, flowEdges, updateFlowNodes, updateFlowEdges } = useAppStore();
  const reactFlowInstance = useRef<any>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, flowNodes);
      updateFlowNodes(newNodes);
    },
    [flowNodes, updateFlowNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, flowEdges);
      updateFlowEdges(newEdges);
    },
    [flowEdges, updateFlowEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      updateFlowEdges(addEdge(newEdge, flowEdges));
    },
    [flowEdges, updateFlowEdges]
  );

  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "flowNode",
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      data: { label: "New Node", description: "Click to edit" },
    };
    updateFlowNodes([...flowNodes, newNode]);
  }, [flowNodes, updateFlowNodes]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">React Flow Editor</CardTitle>
          <Button size="sm" onClick={addNode}>
            Add Node
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-full border border-slate-200 dark:border-slate-700 rounded">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
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
            <Background variant="dots" gap={12} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

// ==================== Main Demo Component ====================
export function Demo4() {
  const { gridLayout, updateGridLayout } = useAppStore();
  const [layouts, setLayouts] = useState<Layout[]>([]);

  // Initialize default grid layout
  useEffect(() => {
    if (layouts.length === 0) {
      const defaultLayout: Layout[] = [
        { i: "flow", x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "editor", x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
        { i: "code", x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
      ];
      setLayouts(defaultLayout);
      updateGridLayout(defaultLayout);
    }
  }, []);

  const onLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setLayouts(newLayout);
      updateGridLayout(newLayout);
    },
    [updateGridLayout]
  );

  return (
    <div className="w-screen h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="h-full">
        <GridLayout
          className="layout"
          layout={layouts}
          cols={12}
          rowHeight={100}
          width={window.innerWidth - 32}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          isResizable={true}
        >
          <div key="flow" className="bg-transparent">
            <FlowEditorPanel />
          </div>
          <div key="editor" className="bg-transparent">
            <RichTextEditor />
          </div>
          <div key="code" className="bg-transparent">
            <CodeEditorPanel />
          </div>
        </GridLayout>
      </div>

      {/* Info Panel */}
      <Panel position="top-center" className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 m-2">
        <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
          <strong>Tech Stack Demo:</strong> React Flow • Tiptap • Monaco • RGL • Zustand • Jotai • Zod • Shadcn • Radix UI
        </div>
      </Panel>
    </div>
  );
}

export default Demo4;

