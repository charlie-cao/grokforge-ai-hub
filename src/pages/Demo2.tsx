import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useDemo2Translations, type Language } from "../lib/demo2-i18n";
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Database,
  Copy,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import "../index.css";

// API 基础 URL
const API_BASE = "/api/demo2";

// User 类型定义
interface User {
  id: number;
  name: string;
  email: string;
  age: number | null;
  role: string;
  createdAt: number;
  updatedAt: number;
}

interface UserFormData {
  name: string;
  email: string;
  age: string;
  role: string;
}

export function Demo2() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("demo2-language");
      return (saved === "en" ? "en" : "zh") as Language;
    }
    return "zh";
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    age: "",
    role: "user",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const t = useDemo2Translations(language);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("demo2-language", newLang);
  }, [language]);

  // 加载用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 表单验证
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = t.nameRequired;
    }
    
    if (!formData.email.trim()) {
      errors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t.emailInvalid;
    }
    
    if (formData.age && isNaN(Number(formData.age))) {
      errors.age = t.ageInvalid;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 打开添加对话框
  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", age: "", role: "user" });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age?.toString() || "",
      role: user.role,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // 保存用户（创建或更新）
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        role: formData.role,
      };

      const url = editingUser
        ? `${API_BASE}/users/${editingUser.id}`
        : `${API_BASE}/users`;
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setIsDialogOpen(false);
        await fetchUsers();
        // 可以添加成功提示
      } else {
        setFormErrors({ email: result.error || t.errorOccurred });
      }
    } catch (error: any) {
      setFormErrors({ email: error.message || t.errorOccurred });
    }
  };

  // 删除用户
  const handleDelete = async (user: User) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchUsers();
      } else {
        alert(result.error || t.errorOccurred);
      }
    } catch (error: any) {
      alert(error.message || t.errorOccurred);
    }
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(language === "zh" ? "zh-CN" : "en-US");
  };

  // 复制代码
  const copyToClipboard = async (text: string, id: string) => {
    try {
      if (document.hasFocus() && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.warn("Failed to copy:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t.title}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t.subtitle}</p>
            </div>
            <Button variant="outline" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 mr-2" />
              {language === "zh" ? "English" : "中文"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Features */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t.features}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">{t.feature1}</p>
                <p className="text-sm">{t.feature2}</p>
                <p className="text-sm">{t.feature3}</p>
                <p className="text-sm">{t.feature4}</p>
                <p className="text-sm">{t.feature5}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.databaseStatus}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{t.databaseConnected}</span>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t.totalUsers}:
                  </span>
                  <span className="ml-2 font-semibold">{users.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - User Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>用户管理 / User Management</CardTitle>
                    <CardDescription>
                      演示完整的 CRUD 操作 / Complete CRUD operations demo
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddClick}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t.addUser}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-600 dark:text-slate-400">{t.loading}</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                    {t.noUsers}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.name}</TableHead>
                        <TableHead>{t.email}</TableHead>
                        <TableHead>{t.age}</TableHead>
                        <TableHead>{t.role}</TableHead>
                        <TableHead>{t.createdAt}</TableHead>
                        <TableHead className="text-right">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.age ?? "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? t.editUser : t.addUser}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "修改用户信息 / Update user information"
                : "添加新用户 / Add a new user"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t.namePlaceholder}
                aria-invalid={!!formErrors.name}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t.emailPlaceholder}
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">{t.age}</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder={t.agePlaceholder}
                aria-invalid={!!formErrors.age}
              />
              {formErrors.age && (
                <p className="text-sm text-red-500">{formErrors.age}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t.role}</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-300"
              >
                <option value="user">{t.roleUser}</option>
                <option value="admin">{t.roleAdmin}</option>
                <option value="editor">{t.roleEditor}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? t.update : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Demo2;