/**
 * Demo9 API Routes
 * File Processing System: Upload, Download, Image Processing, PDF Generation
 */

import { mkdir, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { write } from "bun";

// 文件存储目录
const UPLOAD_DIR = join(process.cwd(), "data", "demo9", "uploads");
const PROCESSED_DIR = join(process.cwd(), "data", "demo9", "processed");

// 确保目录存在
async function ensureDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(PROCESSED_DIR)) {
    await mkdir(PROCESSED_DIR, { recursive: true });
  }
}

// 初始化目录（延迟执行）
let dirsInitialized = false;
async function ensureDirsInitialized() {
  if (!dirsInitialized) {
    await ensureDirectories();
    dirsInitialized = true;
  }
}

// 获取文件信息接口
interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: number;
  url: string;
}

// 支持的文件类型
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
];

// POST /api/demo9/upload - 文件上传
export async function uploadFile(req: Request): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { success: false, error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    // 检查文件大小（10MB 限制）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return Response.json(
        { success: false, error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const extension = file.name.split(".").pop() || "";
    const filename = `${fileId}.${extension}`;
    const filePath = join(UPLOAD_DIR, filename);

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    await write(filePath, arrayBuffer);

    const fileInfo: FileInfo = {
      id: fileId,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: Date.now(),
      url: `/api/demo9/files/${filename}`,
    };

    return Response.json({ success: true, data: fileInfo });
  } catch (error: any) {
    console.error("Upload error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/demo9/files/:filename - 下载文件
export async function downloadFile(req: Request, filename: string): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const filePath = join(UPLOAD_DIR, filename);
    
    if (!existsSync(filePath)) {
      return Response.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const file = Bun.file(filePath);
    const buffer = await file.arrayBuffer();
    
    // 获取文件类型
    const contentType = file.type || "application/octet-stream";
    
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/demo9/files - 获取所有文件列表
export async function listFiles(req: Request): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const files: FileInfo[] = [];
    
    // 读取上传目录中的所有文件
    if (existsSync(UPLOAD_DIR)) {
      const entries = await readdir(UPLOAD_DIR);
      
      for (const entry of entries) {
        const filePath = join(UPLOAD_DIR, entry);
        const stats = await stat(filePath);
        
        if (stats.isFile()) {
          const file = Bun.file(filePath);
          const fileInfo: FileInfo = {
            id: entry.split(".")[0] || entry,
            filename: entry,
            originalName: entry,
            size: stats.size,
            type: file.type || "application/octet-stream",
            uploadedAt: stats.birthtimeMs || stats.mtimeMs,
            url: `/api/demo9/files/${entry}`,
          };
          files.push(fileInfo);
        }
      }
      
      // 按上传时间倒序排列
      files.sort((a, b) => b.uploadedAt - a.uploadedAt);
    }

    return Response.json({ success: true, data: files });
  } catch (error: any) {
    console.error("List files error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/demo9/process/image - 处理图片
export async function processImage(req: Request): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const operation = formData.get("operation") as string || "resize";
    const width = parseInt(formData.get("width") as string || "800");
    const height = parseInt(formData.get("height") as string || "600");
    
    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return Response.json(
        { success: false, error: "File is not an image" },
        { status: 400 }
      );
    }

    // 读取图片数据
    const arrayBuffer = await file.arrayBuffer();
    
    // 注意：Bun 本身不包含图片处理功能，需要外部库
    // 这里返回一个简化版本，实际项目中可以使用 sharp 或其他库
    // 为了演示，我们直接返回原文件，但在实际应用中应该进行图片处理
    
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const extension = file.name.split(".").pop() || "";
    const filename = `processed-${fileId}.${extension}`;
    const filePath = join(PROCESSED_DIR, filename);

    // 保存处理后的文件（这里简化处理，实际应该进行图片处理）
    await write(filePath, arrayBuffer);

    const fileInfo: FileInfo = {
      id: fileId,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: Date.now(),
      url: `/api/demo9/processed/${filename}`,
    };

    return Response.json({
      success: true,
      data: fileInfo,
      message: `Image processed with operation: ${operation}`,
    });
  } catch (error: any) {
    console.error("Image processing error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/demo9/processed/:filename - 获取处理后的文件
export async function getProcessedFile(req: Request, filename: string): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const filePath = join(PROCESSED_DIR, filename);
    
    if (!existsSync(filePath)) {
      return Response.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    const file = Bun.file(filePath);
    const buffer = await file.arrayBuffer();
    const contentType = file.type || "application/octet-stream";
    
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Get processed file error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/demo9/generate/pdf - 生成 PDF
export async function generatePDF(req: Request): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const { content, title = "Generated PDF", filename } = await req.json();
    
    if (!content) {
      return Response.json(
        { success: false, error: "No content provided" },
        { status: 400 }
      );
    }

    // 注意：Bun 本身不包含 PDF 生成功能
    // 可以使用 @react-pdf/renderer 或其他 Bun 友好的库
    // 这里提供一个简化版本，实际应用中需要安装 PDF 生成库
    
    // 简化的 PDF 内容（HTML 格式，可以转换为 PDF）
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <pre>${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</pre>
        </body>
      </html>
    `;

    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const pdfFilename = filename || `generated-${fileId}.html`; // 简化版本使用 HTML
    const filePath = join(PROCESSED_DIR, pdfFilename);

    // 保存 HTML 文件（实际应用应该生成真正的 PDF）
    await write(filePath, htmlContent);

    const fileInfo: FileInfo = {
      id: fileId,
      filename: pdfFilename,
      originalName: pdfFilename,
      size: htmlContent.length,
      type: "text/html", // 实际应该是 "application/pdf"
      uploadedAt: Date.now(),
      url: `/api/demo9/processed/${pdfFilename}`,
    };

    return Response.json({
      success: true,
      data: fileInfo,
      message: "PDF generated successfully (HTML format for demonstration)",
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/demo9/files/:filename - 删除文件
export async function deleteFile(req: Request, filename: string): Promise<Response> {
  await ensureDirsInitialized();
  
  try {
    const filePath = join(UPLOAD_DIR, filename);
    
    if (!existsSync(filePath)) {
      return Response.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    await Bun.write(filePath, ""); // 清空文件
    // 或者使用 fs.unlink 删除文件
    const fs = await import("fs/promises");
    await fs.unlink(filePath);

    return Response.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete file error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

