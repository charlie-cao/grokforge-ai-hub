/**
 * Demo9: File Processing System
 * File upload, download, image processing, and PDF generation
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useDemo9Translations, type Language } from "../lib/demo9-i18n";
import {
  Upload,
  Download,
  Trash2,
  Image as ImageIcon,
  FileText,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
  File,
  Eye,
  ImagePlus,
  FileCheck,
  Info,
} from "lucide-react";
import { BackToHome } from "../components/BackToHome";
import "../index.css";

const API_BASE = "/api/demo9";

interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: number;
  url: string;
}

export function Demo9() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("demo9-language");
      return (saved === "en" ? "en" : "zh") as Language;
    }
    return "zh";
  });

  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfContent, setPdfContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const t = useDemo9Translations(language);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("demo9-language", newLang);
  }, [language]);

  // 获取文件列表
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/files`);
      const result = await response.json();
      if (result.success) {
        setFiles(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化时加载文件列表
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadedFile(result.data);
        await fetchFiles(); // 刷新文件列表
      } else {
        alert(result.error || t.uploadError);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(t.uploadError);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  }, [fetchFiles, t]);

  // 处理文件选择
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // 拖拽上传
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        setSelectedFile(file);
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  // 下载文件
  const handleDownload = useCallback((file: FileInfo) => {
    window.open(file.url, "_blank");
  }, []);

  // 删除文件
  const handleDelete = useCallback(
    async (filename: string) => {
      if (!confirm("确定要删除这个文件吗？")) return;

      try {
        const response = await fetch(`${API_BASE}/files/${filename}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (result.success) {
          await fetchFiles();
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    },
    [fetchFiles]
  );

  // 处理图片
  const handleProcessImage = useCallback(async () => {
    if (!selectedFile) {
      const input = imageInputRef.current;
      if (input && input.files?.[0]) {
        setSelectedFile(input.files[0]);
      } else {
        alert("请选择图片文件");
        return;
      }
    }

    if (!selectedFile) return;

    try {
      setProcessing(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("operation", "resize");
      formData.append("width", "800");
      formData.append("height", "600");

      const response = await fetch(`${API_BASE}/process/image`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert(t.processed);
        await fetchFiles();
      } else {
        alert(result.error || "处理失败");
      }
    } catch (error: any) {
      console.error("Image processing error:", error);
      alert("处理失败");
    } finally {
      setProcessing(false);
      setSelectedFile(null);
    }
  }, [selectedFile, fetchFiles, t]);

  // 生成 PDF
  const handleGeneratePDF = useCallback(async () => {
    if (!pdfContent.trim()) {
      alert("请输入内容");
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch(`${API_BASE}/generate/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pdfTitle || "Generated PDF",
          content: pdfContent,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(t.generated);
        setPdfTitle("");
        setPdfContent("");
        await fetchFiles();
      } else {
        alert(result.error || "生成失败");
      }
    } catch (error: any) {
      console.error("PDF generation error:", error);
      alert("生成失败");
    } finally {
      setGenerating(false);
    }
  }, [pdfTitle, pdfContent, fetchFiles, t]);

  // 格式化文件大小
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }, []);

  // 格式化时间
  const formatDate = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    if (language === "zh") {
      return date.toLocaleString("zh-CN");
    }
    return date.toLocaleString("en-US");
  }, [language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <BackToHome />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              {language === "zh" ? "EN" : "中文"}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              {t.info}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t.infoDescription}
            </p>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{t.features}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>{t.feature1}</li>
                <li>{t.feature2}</li>
                <li>{t.feature3}</li>
                <li>{t.feature4}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t.tabUpload}
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {t.tabImages}
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.tabPdf}
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <File className="w-4 h-4" />
              {t.tabFiles}
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.uploadTitle}</CardTitle>
                <CardDescription>{t.uploadDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {t.dragDrop}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf,text/*,application/json"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.uploading}
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4 mr-2" />
                        {t.selectFile}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    {t.maxFileSize}
                  </p>
                </div>

                {uploadedFile && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-400">
                      {t.uploadSuccess} {uploadedFile.originalName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Processing Tab */}
          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="w-5 h-5" />
                  {t.imageProcessing}
                </CardTitle>
                <CardDescription>
                  选择图片文件进行处理（调整大小、压缩等）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-file">{t.selectFile}</Label>
                  <input
                    ref={imageInputRef}
                    id="image-file"
                    type="file"
                    accept="image/*"
                    className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <Button
                  onClick={handleProcessImage}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {t.processImage}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Generation Tab */}
          <TabsContent value="pdf" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.pdfGeneration}
                </CardTitle>
                <CardDescription>输入内容生成 PDF 文档</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pdf-title">{t.pdfTitle}</Label>
                  <Input
                    id="pdf-title"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="输入 PDF 标题..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="pdf-content">{t.pdfContent}</Label>
                  <Textarea
                    id="pdf-content"
                    value={pdfContent}
                    onChange={(e) => setPdfContent(e.target.value)}
                    placeholder={t.enterContent}
                    className="mt-2 min-h-[200px]"
                  />
                </div>
                <Button
                  onClick={handleGeneratePDF}
                  disabled={generating || !pdfContent.trim()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t.generating}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      {t.generatePdf}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File List Tab */}
          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.fileList}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchFiles}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <File className="w-4 h-4" />
                    )}
                  </Button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {files.length} {t.fileList}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {t.noFiles}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.fileName}</TableHead>
                          <TableHead>{t.fileType}</TableHead>
                          <TableHead>{t.fileSize}</TableHead>
                          <TableHead>{t.uploadTime}</TableHead>
                          <TableHead>{t.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {files.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">
                              {file.originalName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{file.type}</Badge>
                            </TableCell>
                            <TableCell>{formatFileSize(file.size)}</TableCell>
                            <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                {file.type.startsWith("image/") && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(file.url, "_blank")}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(file.filename)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

