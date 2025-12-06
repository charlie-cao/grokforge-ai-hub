import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDemo1Translations, type Language } from "../lib/demo1-i18n";
import {
  // Common icons
  Home,
  User,
  Settings,
  Search,
  Heart,
  Star,
  Bookmark,
  Download,
  Upload,
  Share,
  Edit,
  Trash,
  Plus,
  Minus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  // Feature icons
  Zap,
  Sparkles,
  Code,
  Palette,
  Moon,
  Sun,
  Monitor,
  Globe,
  Github,
  Package,
  FileText,
  Copy,
  CheckCircle2,
} from "lucide-react";
import "../index.css";

// Icon categories for showcase
const iconCategories = {
  common: [
    { name: "Home", icon: Home },
    { name: "User", icon: User },
    { name: "Settings", icon: Settings },
    { name: "Search", icon: Search },
    { name: "Heart", icon: Heart },
    { name: "Star", icon: Star },
    { name: "Bookmark", icon: Bookmark },
  ],
  actions: [
    { name: "Download", icon: Download },
    { name: "Upload", icon: Upload },
    { name: "Share", icon: Share },
    { name: "Edit", icon: Edit },
    { name: "Trash", icon: Trash },
    { name: "Plus", icon: Plus },
    { name: "Minus", icon: Minus },
  ],
  navigation: [
    { name: "Check", icon: Check },
    { name: "X", icon: X },
    { name: "ChevronRight", icon: ChevronRight },
    { name: "ChevronLeft", icon: ChevronLeft },
    { name: "ArrowRight", icon: ArrowRight },
    { name: "ArrowLeft", icon: ArrowLeft },
  ],
  features: [
    { name: "Zap", icon: Zap },
    { name: "Sparkles", icon: Sparkles },
    { name: "Code", icon: Code },
    { name: "Palette", icon: Palette },
  ],
};

export function Demo1() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("demo1-language");
      return (saved === "en" ? "en" : "zh") as Language;
    }
    return "zh";
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("demo1-theme");
      return (saved === "light" || saved === "dark" || saved === "system" ? saved : "system") as "light" | "dark" | "system";
    }
    return "system";
  });

  const t = useDemo1Translations(language);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("demo1-language", newLang);
  }, [language]);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
    localStorage.setItem("demo1-theme", theme);
  }, [theme]);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      if (document.hasFocus() && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback
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
  }, []);

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
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={theme === "light" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="h-8"
                >
                  <Sun className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="h-8"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="h-8"
                >
                  <Moon className="w-4 h-4" />
                </Button>
              </div>
              {/* Language Toggle */}
              <Button variant="outline" onClick={toggleLanguage}>
                <Globe className="w-4 h-4 mr-2" />
                {language === "zh" ? "English" : "中文"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="icons" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="icons" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t.tabIcons}
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              {t.tabThemes}
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              {t.tabComponents}
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.tabUsage}
            </TabsTrigger>
          </TabsList>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {t.iconLibraries}
                    </CardTitle>
                    <CardDescription>{t.lucideDesc}</CardDescription>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    {t.recommended}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Library Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.iconLibrary}</div>
                    <div className="text-lg font-semibold">{t.lucideTitle}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.iconCount}</div>
                    <div className="text-lg font-semibold">1500+</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t.license}</div>
                    <div className="text-lg font-semibold">ISC</div>
                  </div>
                </div>

                {/* Features */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold mb-2">{t.lucideFeatures}</h3>
                  <pre className="text-sm whitespace-pre-wrap">{t.lucideFeatures}</pre>
                </div>

                {/* Icon Showcase */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">图标展示 / Icon Showcase</h3>
                  
                  {Object.entries(iconCategories).map(([category, icons]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">
                        {category}
                      </h4>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                        {icons.map(({ name, icon: Icon }) => (
                          <div
                            key={name}
                            className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Icon className="w-6 h-6 mb-2" />
                            <span className="text-xs text-center text-slate-600 dark:text-slate-400">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Code Example */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.lucideExample}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `import { Home, User, Settings } from "lucide-react";

function MyComponent() {
  return (
    <div>
      <Home className="w-5 h-5" />
      <User className="w-5 h-5 text-blue-500" />
      <Settings className="w-5 h-5" />
    </div>
  );
}`,
                        "lucide-example"
                      )}
                    >
                      {copiedCode === "lucide-example" ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedCode === "lucide-example" ? t.copied : t.copyCode}
                    </Button>
                  </div>
                  <pre className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-sm overflow-x-auto">
                    <code>{`import { Home, User, Settings } from "lucide-react";

function MyComponent() {
  return (
    <div>
      <Home className="w-5 h-5" />
      <User className="w-5 h-5 text-blue-500" />
      <Settings className="w-5 h-5" />
    </div>
  );
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t.themeLibraries}
                </CardTitle>
                <CardDescription>{t.themeDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* shadcn/ui Theme */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{t.shadcnTitle}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t.shadcnDesc}</p>
                    </div>
                    <Badge>{t.recommended}</Badge>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold mb-2">{t.shadcnFeatures}</h4>
                    <pre className="text-sm whitespace-pre-wrap">{t.shadcnFeatures}</pre>
                  </div>

                  {/* Theme Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 border rounded-lg bg-white dark:bg-slate-800">
                      <h4 className="font-semibold mb-4">浅色主题 / Light Theme</h4>
                      <div className="space-y-2">
                        <div className="h-10 bg-primary rounded flex items-center justify-center text-primary-foreground">
                          Primary
                        </div>
                        <div className="h-10 bg-secondary rounded flex items-center justify-center text-secondary-foreground">
                          Secondary
                        </div>
                        <div className="h-10 border rounded flex items-center justify-center">
                          Outline
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border rounded-lg bg-slate-900 dark:bg-slate-950">
                      <h4 className="font-semibold mb-4 text-slate-100">深色主题 / Dark Theme</h4>
                      <div className="space-y-2">
                        <div className="h-10 bg-primary rounded flex items-center justify-center text-primary-foreground">
                          Primary
                        </div>
                        <div className="h-10 bg-secondary rounded flex items-center justify-center text-secondary-foreground">
                          Secondary
                        </div>
                        <div className="h-10 border border-slate-700 rounded flex items-center justify-center text-slate-100">
                          Outline
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {t.uiComponents}
                </CardTitle>
                <CardDescription>{t.componentShowcase}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Buttons */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">按钮 / Buttons</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">徽章 / Badges</h3>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">卡片 / Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Card description goes here</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Card content with some text and information.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Another Card</CardTitle>
                        <CardDescription>With different content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>You can put any content here.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.gettingStarted}
                </CardTitle>
                <CardDescription>{t.installationSteps}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Installation Steps */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{t.step1}</h4>
                      <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded text-sm">
                        <code>bun add lucide-react</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{t.step2}</h4>
                      <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded text-sm">
                        <code>{`import { Home, User } from "lucide-react";`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{t.step3}</h4>
                      <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded text-sm">
                        <code>{`<Home className="w-5 h-5" />`}</code>
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{t.step4}</h4>
                      <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded text-sm">
                        <code>{`<Home className="w-5 h-5 text-blue-500" />`}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Complete Example */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.codeExample}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `import { Button } from "@/components/ui/button";
import { Home, User, Settings } from "lucide-react";

export function MyComponent() {
  return (
    <div className="flex gap-2">
      <Button>
        <Home className="w-4 h-4 mr-2" />
        Home
      </Button>
      <Button variant="outline">
        <User className="w-4 h-4 mr-2" />
        Profile
      </Button>
      <Button variant="ghost">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
    </div>
  );
}`,
                        "complete-example"
                      )}
                    >
                      {copiedCode === "complete-example" ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedCode === "complete-example" ? t.copied : t.copyCode}
                    </Button>
                  </div>
                  <pre className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-sm overflow-x-auto">
                    <code>{`import { Button } from "@/components/ui/button";
import { Home, User, Settings } from "lucide-react";

export function MyComponent() {
  return (
    <div className="flex gap-2">
      <Button>
        <Home className="w-4 h-4 mr-2" />
        Home
      </Button>
      <Button variant="outline">
        <User className="w-4 h-4 mr-2" />
        Profile
      </Button>
      <Button variant="ghost">
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
    </div>
  );
}`}</code>
                  </pre>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <h3 className="font-semibold">{t.moreInfo}</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" asChild>
                      <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Lucide Icons Docs
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        shadcn/ui Docs
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">
                        <Package className="w-4 h-4 mr-2" />
                        Tailwind CSS Docs
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Demo1;