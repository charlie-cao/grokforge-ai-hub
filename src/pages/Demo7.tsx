/**
 * Demo7: Scheduled AI Chat Tasks
 * Displays automatically generated AI chat records from scheduled tasks
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useDemo7Translations, type Language } from "../lib/demo7-i18n";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  Database,
  Info,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { BackToHome } from "../components/BackToHome";
import "../index.css";

// API base URL
const API_BASE = "/api/demo7";

// Scheduled chat record type
interface ScheduledChat {
  id: number;
  prompt: string;
  response: string;
  model: string;
  status: "success" | "error";
  errorMessage?: string | null;
  createdAt: number;
}

export function Demo7() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("demo7-language");
      return (saved === "en" ? "en" : "zh") as Language;
    }
    return "zh";
  });
  const [chats, setChats] = useState<ScheduledChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // desc = 最新在前, asc = 最旧在前

  const t = useDemo7Translations(language);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("demo7-language", newLang);
  }, [language]);

  // Fetch chat records
  const fetchChats = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE}/chats`);
      const result = await response.json();
      if (result.success) {
        setChats(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch scheduled chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchChats();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchChats]);

  // Format timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (language === "zh") {
      return date.toLocaleString("zh-CN");
    }
    return date.toLocaleString("en-US");
  };

  // Sort chats by creation time
  const sortedChats = [...chats].sort((a, b) => {
    if (sortOrder === "desc") {
      return b.createdAt - a.createdAt; // 最新的在前
    } else {
      return a.createdAt - b.createdAt; // 最旧的在前
    }
  });

  // Calculate statistics
  const stats = {
    total: chats.length,
    success: chats.filter((c) => c.status === "success").length,
    error: chats.filter((c) => c.status === "error").length,
  };

  // Toggle sort order
  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  }, []);

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
              <p className="text-sm font-semibold">{t.infoFeatures}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>{t.feature1}</li>
                <li>{t.feature2}</li>
                <li>{t.feature3}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Statistics and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.totalRecords}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.successCount}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.success}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.errorCount}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.error}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchChats}
                  disabled={refreshing}
                  className="w-full gap-2"
                >
                  {refreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {t.refresh}
                </Button>
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="w-full gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {t.autoRefresh}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Records Grid */}
        <div>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                聊天记录 / Chat History
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.interval}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="gap-2 self-start md:self-auto"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === "desc" ? t.sortNewest : t.sortOldest}
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {t.loading}
              </span>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t.noRecords}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
              {sortedChats.map((chat) => (
                <Card key={chat.id} className="flex flex-col h-full">
                  <CardHeader className="flex-shrink-0 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          chat.status === "success" ? "default" : "destructive"
                        }
                        className="text-xs"
                      >
                        {chat.status === "success" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t.statusSuccess}
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            {t.statusError}
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {chat.model}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(chat.createdAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {t.prompt}:
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                        {chat.prompt}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {t.response}:
                      </p>
                      {chat.status === "success" ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                          {chat.response}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600 dark:text-red-400 break-words">
                          {chat.errorMessage || "Error occurred"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

