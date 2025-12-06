/**
 * Internationalization (i18n) for Demo9
 * File Processing System
 */

export type Language = "zh" | "en";

export interface Demo9Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Tabs
  tabUpload: string;
  tabImages: string;
  tabPdf: string;
  tabFiles: string;
  
  // Upload
  uploadTitle: string;
  uploadDescription: string;
  dragDrop: string;
  or: string;
  selectFile: string;
  uploading: string;
  uploadSuccess: string;
  uploadError: string;
  fileTypeNotAllowed: string;
  fileSizeExceeded: string;
  maxFileSize: string;
  
  // Image Processing
  imageProcessing: string;
  processImage: string;
  resize: string;
  compress: string;
  convert: string;
  width: string;
  height: string;
  processing: string;
  processed: string;
  
  // PDF Generation
  pdfGeneration: string;
  generatePdf: string;
  pdfTitle: string;
  pdfContent: string;
  enterContent: string;
  generating: string;
  generated: string;
  
  // File List
  fileList: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadTime: string;
  actions: string;
  download: string;
  delete: string;
  preview: string;
  noFiles: string;
  
  // Info
  info: string;
  infoDescription: string;
  features: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  
  // Common
  language: string;
  backToHome: string;
}

const translations: Record<Language, Demo9Translations> = {
  zh: {
    title: "Demo9: 文件处理系统",
    subtitle: "文件上传、下载、图片处理和 PDF 生成",
    
    tabUpload: "文件上传",
    tabImages: "图片处理",
    tabPdf: "PDF 生成",
    tabFiles: "文件列表",
    
    uploadTitle: "上传文件",
    uploadDescription: "支持图片、PDF、文本文件，最大 10MB",
    dragDrop: "拖拽文件到这里，或",
    or: "或",
    selectFile: "选择文件",
    uploading: "上传中...",
    uploadSuccess: "上传成功！",
    uploadError: "上传失败",
    fileTypeNotAllowed: "不支持的文件类型",
    fileSizeExceeded: "文件大小超过限制",
    maxFileSize: "最大文件大小：10MB",
    
    imageProcessing: "图片处理",
    processImage: "处理图片",
    resize: "调整大小",
    compress: "压缩",
    convert: "转换格式",
    width: "宽度",
    height: "高度",
    processing: "处理中...",
    processed: "处理完成",
    
    pdfGeneration: "PDF 生成",
    generatePdf: "生成 PDF",
    pdfTitle: "PDF 标题",
    pdfContent: "PDF 内容",
    enterContent: "请输入内容...",
    generating: "生成中...",
    generated: "生成完成",
    
    fileList: "文件列表",
    fileName: "文件名",
    fileSize: "文件大小",
    fileType: "文件类型",
    uploadTime: "上传时间",
    actions: "操作",
    download: "下载",
    delete: "删除",
    preview: "预览",
    noFiles: "暂无文件",
    
    info: "关于",
    infoDescription: "Demo9 演示了 Bun 原生文件处理能力，包括文件上传、下载、图片处理和 PDF 生成。",
    features: "特性：",
    feature1: "使用 Bun.file() 进行文件操作",
    feature2: "支持多种文件类型（图片、PDF、文本）",
    feature3: "图片处理和格式转换",
    feature4: "PDF 文档生成",
    
    language: "语言",
    backToHome: "返回首页",
  },
  en: {
    title: "Demo9: File Processing System",
    subtitle: "File upload, download, image processing, and PDF generation",
    
    tabUpload: "Upload",
    tabImages: "Image Processing",
    tabPdf: "PDF Generation",
    tabFiles: "File List",
    
    uploadTitle: "Upload File",
    uploadDescription: "Supports images, PDFs, text files, max 10MB",
    dragDrop: "Drag and drop files here, or",
    or: "or",
    selectFile: "Select File",
    uploading: "Uploading...",
    uploadSuccess: "Upload successful!",
    uploadError: "Upload failed",
    fileTypeNotAllowed: "File type not allowed",
    fileSizeExceeded: "File size exceeds limit",
    maxFileSize: "Max file size: 10MB",
    
    imageProcessing: "Image Processing",
    processImage: "Process Image",
    resize: "Resize",
    compress: "Compress",
    convert: "Convert Format",
    width: "Width",
    height: "Height",
    processing: "Processing...",
    processed: "Processed",
    
    pdfGeneration: "PDF Generation",
    generatePdf: "Generate PDF",
    pdfTitle: "PDF Title",
    pdfContent: "PDF Content",
    enterContent: "Enter content...",
    generating: "Generating...",
    generated: "Generated",
    
    fileList: "File List",
    fileName: "File Name",
    fileSize: "File Size",
    fileType: "File Type",
    uploadTime: "Upload Time",
    actions: "Actions",
    download: "Download",
    delete: "Delete",
    preview: "Preview",
    noFiles: "No files yet",
    
    info: "About",
    infoDescription: "Demo9 demonstrates Bun's native file processing capabilities, including file upload, download, image processing, and PDF generation.",
    features: "Features:",
    feature1: "Uses Bun.file() for file operations",
    feature2: "Supports multiple file types (images, PDFs, text)",
    feature3: "Image processing and format conversion",
    feature4: "PDF document generation",
    
    language: "Language",
    backToHome: "Back to Home",
  },
};

export function useDemo9Translations(language: Language): Demo9Translations {
  return translations[language];
}

