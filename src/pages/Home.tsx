/**
 * Home Page - Demo Showcase Hub
 * Displays all demos with descriptions and links
 */

import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useHomeTranslations, type Language } from "../lib/home-i18n";
import {
  Globe,
  Sparkles,
  ArrowRight,
  Database,
  Zap,
  Code,
  Layers,
  MessageSquare,
  Clock,
  Brain,
  Folder,
} from "lucide-react";
import "../index.css";

interface DemoInfo {
  id: number;
  path: string;
  icon: React.ElementType;
  featured?: boolean;
}

const demos: DemoInfo[] = [
  { id: 1, path: "/demo1", icon: Sparkles },
  { id: 2, path: "/demo2", icon: Database },
  { id: 3, path: "/demo3", icon: MessageSquare },
  { id: 4, path: "/demo4", icon: Layers },
  { id: 5, path: "/demo5", icon: Code },
  { id: 6, path: "/demo6", icon: Zap, featured: true },
  { id: 7, path: "/demo7", icon: Clock },
  { id: 8, path: "/demo8", icon: Brain },
  { id: 9, path: "/demo9", icon: Folder },
];

export function Home() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("home-language");
      return (saved === "en" ? "en" : "zh") as Language;
    }
    return "zh";
  });

  const t = useHomeTranslations(language);

  const toggleLanguage = useCallback(() => {
    const newLang = language === "zh" ? "en" : "zh";
    setLanguage(newLang);
    localStorage.setItem("home-language", newLang);
  }, [language]);

  const navigateToDemo = (path: string) => {
    window.location.href = path;
  };

  const getDemoInfo = (id: number) => {
    const infoMap: Record<number, { title: string; desc: string; tech: string; featured?: boolean }> = {
      1: { title: t.demo1Title, desc: t.demo1Desc, tech: t.demo1Tech },
      2: { title: t.demo2Title, desc: t.demo2Desc, tech: t.demo2Tech },
      3: { title: t.demo3Title, desc: t.demo3Desc, tech: t.demo3Tech },
      4: { title: t.demo4Title, desc: t.demo4Desc, tech: t.demo4Tech },
      5: { title: t.demo5Title, desc: t.demo5Desc, tech: t.demo5Tech },
      6: { title: t.demo6Title, desc: t.demo6Desc, tech: t.demo6Tech, featured: true },
      7: { title: t.demo7Title, desc: t.demo7Desc, tech: t.demo7Tech },
      8: { title: t.demo8Title, desc: t.demo8Desc, tech: t.demo8Tech },
      9: { title: t.demo9Title, desc: t.demo9Desc, tech: t.demo9Tech },
    };
    return infoMap[id] || { title: "", desc: "", tech: "" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              {t.subtitle}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2 self-start md:self-auto"
          >
            <Globe className="w-4 h-4" />
            {language === "zh" ? "EN" : "中文"}
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-semibold">
                  {t.totalDemos}: <span className="text-blue-600">{demos.length}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((demo) => {
            const info = getDemoInfo(demo.id);
            const Icon = demo.icon;
            
            return (
              <Card
                key={demo.id}
                className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigateToDemo(demo.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-6 h-6 text-blue-500" />
                      <CardTitle className="text-xl">{info.title}</CardTitle>
                    </div>
                    {info.featured && (
                      <Badge variant="default" className="ml-2">
                        {t.statusFeatured}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm">
                    {info.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {t.techStack}:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {info.tech}
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {t.statusComplete}
                    </Badge>
                  </div>
                  <Button
                    className="mt-4 w-full group-hover:bg-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToDemo(demo.path);
                    }}
                  >
                    {t.viewDemo}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

