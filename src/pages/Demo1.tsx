import { useState, useEffect, useRef, useCallback } from "react";
import { Tldraw, useEditor, TLShapeId } from "tldraw";
import "tldraw/tldraw.css";
import { modelManager } from "../lib/models";
import "../index.css";

interface AnalysisStep {
  id: string;
  text: string;
  tool?: string;
  x: number;
  y: number;
}

export function Demo1() {
  const [inputShapeId, setInputShapeId] = useState<TLShapeId | null>(null);
  const [loadingShapeId, setLoadingShapeId] = useState<TLShapeId | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const editorRef = useRef<any>(null);

  return (
    <div className="w-screen h-screen bg-slate-50 dark:bg-slate-900">
      <Tldraw
        onMount={(editor) => {
          editorRef.current = editor;
          
          // 延迟创建输入框，确保 editor 完全初始化
          setTimeout(() => {
            // 创建初始输入框（居中）
            const centerX = editor.getViewportPageBounds().center.x;
            const centerY = editor.getViewportPageBounds().center.y;
            
            const inputShape = editor.createShape({
              type: "text",
              x: centerX - 150,
              y: centerY - 20,
              props: {
                text: "输入痛点，如：找客户",
                color: "black",
                size: "m",
                font: "draw",
                align: "start",
                w: 300,
                autoSize: false,
              },
            });

            setInputShapeId(inputShape.id);
            
            // 选中输入框，使其可编辑
            editor.setSelectedShapes([inputShape.id]);
          }, 100);
        }}
        // 移除 persistenceKey 以避免 localStorage 错误
        // 如果需要持久化，可以后续添加自定义存储适配器
      >
        <CanvasController
          inputShapeId={inputShapeId}
          loadingShapeId={loadingShapeId}
          setLoadingShapeId={setLoadingShapeId}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
          analysisSteps={analysisSteps}
          setAnalysisSteps={setAnalysisSteps}
        />
      </Tldraw>
    </div>
  );
}

// 画布控制器组件
function CanvasController({
  inputShapeId,
  loadingShapeId,
  setLoadingShapeId,
  isAnalyzing,
  setIsAnalyzing,
  analysisSteps,
  setAnalysisSteps,
}: {
  inputShapeId: TLShapeId | null;
  loadingShapeId: TLShapeId | null;
  setLoadingShapeId: (id: TLShapeId | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  analysisSteps: AnalysisStep[];
  setAnalysisSteps: (steps: AnalysisStep[]) => void;
}) {
  const editor = useEditor();
  const inputTextRef = useRef<string>("");
  const animationFrameRef = useRef<number | null>(null);

  // 监听输入框文本变化
  useEffect(() => {
    if (!inputShapeId) return;

    const unsubscribe = editor.store.listen(() => {
      const shape = editor.getShape(inputShapeId);
      if (shape && shape.type === "text") {
        const text = (shape as any).props.text || "";
        const placeholder = "输入痛点，如：找客户";
        
        // 如果文本不是占位符，更新宽度
        if (text !== placeholder && text !== inputTextRef.current) {
          inputTextRef.current = text;
          
          // 根据文本长度动态调整宽度（呼吸感）
          const textLength = text.length;
          const minWidth = 300;
          const maxWidth = 600;
          const newWidth = Math.min(maxWidth, Math.max(minWidth, textLength * 12 + 50));
          
          editor.updateShape({
            id: inputShapeId,
            type: "text",
            props: {
              ...shape.props,
              w: newWidth,
            },
          });
        }
      }
    });

    return unsubscribe;
  }, [editor, inputShapeId]);

  // 监听回车键提交
  useEffect(() => {
    if (!inputShapeId || isAnalyzing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const selectedShapes = editor.getSelectedShapeIds();
        if (selectedShapes.includes(inputShapeId)) {
          const shape = editor.getShape(inputShapeId);
          if (shape && shape.type === "text") {
            const text = (shape as any).props.text || "";
            const placeholder = "输入痛点，如：找客户";
            
            if (text && text !== placeholder) {
              e.preventDefault();
              handleSubmit(text);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, inputShapeId, isAnalyzing, handleSubmit]);

  // 提交处理
  const handleSubmit = useCallback(async (text: string) => {
    if (!inputShapeId || isAnalyzing) return;

    setIsAnalyzing(true);

    // 1. 输入框变灰
    const inputShape = editor.getShape(inputShapeId);
    if (inputShape) {
      editor.updateShape({
        id: inputShapeId,
        type: "text",
        props: {
          ...inputShape.props,
          color: "grey",
        },
      });
    }

    // 2. 创建 loading 圆形（在输入框下方）
    const inputBounds = editor.getShapePageBounds(inputShapeId);
    let analysisData: any = null;
    let currentLoadingId: TLShapeId | null = null;
    
    if (inputBounds) {
      const loadingShape = editor.createShape({
        type: "geo",
        x: inputBounds.center.x - 30,
        y: inputBounds.maxY + 40,
        props: {
          geo: "ellipse",
          w: 60,
          h: 60,
          fill: "semi",
          color: "blue",
        },
      });

      currentLoadingId = loadingShape.id;
      setLoadingShapeId(loadingShape.id);

      // 3. 开始分析
      try {
        const analysisPrompt = `Analyze the user's pain point: "${text.trim()}". Break it down into 3-5 tools/solutions. Output JSON format: {"steps": [{"step": 1, "desc": "分析获客痛点", "tool": "LeadsBot"}, {"step": 2, "desc": "需要CRM管理", "tool": "CRM"}], "tools": [{"name": "LeadsBot", "type": "bot", "priority": 1}]}. Output ONLY valid JSON, no markdown.`;

        const response = await modelManager.query(analysisPrompt);

        // 解析分析结果
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
          
          // 流式显示分析步骤（在右侧）
          if (analysisData.steps && Array.isArray(analysisData.steps)) {
            const viewport = editor.getViewportPageBounds();
            const rightX = viewport.maxX - 300;
            const startY = viewport.center.y - 150;

            analysisData.steps.forEach((step: any, index: number) => {
              setTimeout(() => {
                const x = rightX;
                const y = startY + index * 130;

                // 创建步骤框
                const stepShape = editor.createShape({
                  type: "geo",
                  x,
                  y,
                  props: {
                    geo: "rectangle",
                    w: 280,
                    h: 110,
                    fill: "semi",
                    color: "blue",
                    text: `${step.step}. ${step.desc}\n${step.tool ? `工具: ${step.tool}` : ""}`,
                  },
                });

                // 创建连接线（从输入框到步骤框）
                editor.createShape({
                  type: "arrow",
                  x: inputBounds.center.x,
                  y: inputBounds.center.y,
                  props: {
                    start: { x: 0, y: 0 },
                    end: { x: x - inputBounds.center.x, y: y - inputBounds.center.y },
                    arrowheadStart: "none",
                    arrowheadEnd: "arrow",
                    color: "blue",
                    size: "m",
                  },
                });

                setAnalysisSteps(prev => [...prev, {
                  id: stepShape.id,
                  text: `${step.step}. ${step.desc}`,
                  tool: step.tool,
                  x,
                  y,
                }]);
              }, index * 800); // 流式显示，每个间隔 800ms
            });
          }
        }
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        // 延迟移除 loading（等所有步骤显示完）
        const delay = analysisData?.steps?.length ? analysisData.steps.length * 800 + 1000 : 2000;
        setTimeout(() => {
          if (currentLoadingId) {
            const currentLoading = editor.getShape(currentLoadingId);
            if (currentLoading) {
              editor.deleteShape(currentLoadingId);
            }
            setLoadingShapeId(null);
          }
          setIsAnalyzing(false);
        }, delay);
      }
    }
  }, [editor, inputShapeId, isAnalyzing, setLoadingShapeId, setIsAnalyzing, setAnalysisSteps]);

  // Loading 呼吸动画
  useEffect(() => {
    if (!loadingShapeId || !isAnalyzing) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let frame = 0;
    const animate = () => {
      if (!isAnalyzing || !loadingShapeId) return;
      
      frame++;
      // 呼吸效果：使用 sin 函数创建平滑的缩放动画
      const scale = 1 + Math.sin(frame * 0.08) * 0.15;
      
      const shape = editor.getShape(loadingShapeId);
      if (shape) {
        editor.updateShape({
          id: loadingShapeId,
          type: "geo",
          props: {
            ...shape.props,
            w: 60 * scale,
            h: 60 * scale,
          },
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [editor, loadingShapeId, isAnalyzing]);

  // 点击步骤框的处理（预留）
  useEffect(() => {
    if (analysisSteps.length === 0) return;

    const handleShapeClick = (e: any) => {
      const clickedShapeId = e.target;
      const step = analysisSteps.find(s => s.id === clickedShapeId);
      
      if (step) {
        // TODO: 触发下一个生成过程
        console.log("Clicked step:", step);
      }
    };

    // 订阅点击事件
    const unsubscribe = editor.store.listen(() => {
      // 这里可以添加点击处理逻辑
    });

    return unsubscribe;
  }, [editor, analysisSteps]);

  return null;
}

export default Demo1;
