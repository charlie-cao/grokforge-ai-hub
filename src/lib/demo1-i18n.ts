/**
 * Internationalization (i18n) for Demo1
 * Icon Libraries & Theme Libraries Showcase
 */

export type Language = "zh" | "en";

export interface Demo1Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Tabs
  tabIcons: string;
  tabThemes: string;
  tabComponents: string;
  tabUsage: string;
  
  // Icons Section
  iconLibraries: string;
  iconLibrary: string;
  iconCount: string;
  license: string;
  bunFriendly: string;
  recommended: string;
  installation: string;
  usageExample: string;
  
  // Lucide Icons
  lucideTitle: string;
  lucideDesc: string;
  lucideFeatures: string;
  lucideExample: string;
  
  // Themes Section
  themeLibraries: string;
  themeSystem: string;
  themeDescription: string;
  currentTheme: string;
  themeVariants: string;
  darkMode: string;
  lightMode: string;
  system: string;
  
  // shadcn/ui
  shadcnTitle: string;
  shadcnDesc: string;
  shadcnFeatures: string;
  
  // Components Section
  uiComponents: string;
  componentShowcase: string;
  
  // Usage Section
  gettingStarted: string;
  installationSteps: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  codeExample: string;
  moreInfo: string;
  
  // Common
  viewDocs: string;
  copyCode: string;
  copied: string;
}

const translations: Record<Language, Demo1Translations> = {
  zh: {
    title: "Demo1: 图标库与主题库展示",
    subtitle: "Bun 友好的图标库、UI 组件库和主题系统案例集合",
    
    tabIcons: "图标库",
    tabThemes: "主题系统",
    tabComponents: "组件展示",
    tabUsage: "使用说明",
    
    iconLibraries: "图标库集合",
    iconLibrary: "图标库",
    iconCount: "图标数量",
    license: "许可证",
    bunFriendly: "Bun 友好",
    recommended: "推荐",
    installation: "安装",
    usageExample: "使用示例",
    
    lucideTitle: "Lucide Icons",
    lucideDesc: "现代化图标库，包含 1500+ 精美图标，完美适配 Bun 和 React",
    lucideFeatures: "• 1500+ 高质量图标\n• 树摇优化（Tree-shakable）\n• TypeScript 支持\n• 可自定义颜色和大小\n• 完美适配 Bun",
    lucideExample: "示例代码",
    
    themeLibraries: "主题系统",
    themeSystem: "主题系统",
    themeDescription: "基于 Tailwind CSS 和 CSS Variables 的灵活主题系统",
    currentTheme: "当前主题",
    themeVariants: "主题变体",
    darkMode: "深色模式",
    lightMode: "浅色模式",
    system: "跟随系统",
    
    shadcnTitle: "shadcn/ui",
    shadcnDesc: "基于 Radix UI 和 Tailwind CSS 的现代化组件库，完全可定制",
    shadcnFeatures: "• 基于 Radix UI（无障碍访问）\n• Tailwind CSS 样式\n• 完全可定制\n• 复制即用的组件\n• TypeScript 支持",
    
    uiComponents: "UI 组件",
    componentShowcase: "组件展示",
    
    gettingStarted: "快速开始",
    installationSteps: "安装步骤",
    step1: "安装依赖",
    step2: "导入组件",
    step3: "使用组件",
    step4: "自定义样式",
    codeExample: "代码示例",
    moreInfo: "更多信息",
    
    viewDocs: "查看文档",
    copyCode: "复制代码",
    copied: "已复制",
  },
  en: {
    title: "Demo1: Icon & Theme Libraries Showcase",
    subtitle: "A collection of Bun-friendly icon libraries, UI component libraries, and theme systems",
    
    tabIcons: "Icons",
    tabThemes: "Themes",
    tabComponents: "Components",
    tabUsage: "Usage",
    
    iconLibraries: "Icon Libraries",
    iconLibrary: "Icon Library",
    iconCount: "Icon Count",
    license: "License",
    bunFriendly: "Bun Friendly",
    recommended: "Recommended",
    installation: "Installation",
    usageExample: "Usage Example",
    
    lucideTitle: "Lucide Icons",
    lucideDesc: "Modern icon library with 1500+ beautiful icons, perfectly compatible with Bun and React",
    lucideFeatures: "• 1500+ high-quality icons\n• Tree-shakable\n• TypeScript support\n• Customizable colors and sizes\n• Perfect Bun compatibility",
    lucideExample: "Example Code",
    
    themeLibraries: "Theme Systems",
    themeSystem: "Theme System",
    themeDescription: "Flexible theme system based on Tailwind CSS and CSS Variables",
    currentTheme: "Current Theme",
    themeVariants: "Theme Variants",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    system: "System",
    
    shadcnTitle: "shadcn/ui",
    shadcnDesc: "Modern component library based on Radix UI and Tailwind CSS, fully customizable",
    shadcnFeatures: "• Built on Radix UI (accessible)\n• Tailwind CSS styling\n• Fully customizable\n• Copy & paste components\n• TypeScript support",
    
    uiComponents: "UI Components",
    componentShowcase: "Component Showcase",
    
    gettingStarted: "Getting Started",
    installationSteps: "Installation Steps",
    step1: "Install dependencies",
    step2: "Import component",
    step3: "Use component",
    step4: "Customize styles",
    codeExample: "Code Example",
    moreInfo: "More Info",
    
    viewDocs: "View Docs",
    copyCode: "Copy Code",
    copied: "Copied",
  },
};

export function useDemo1Translations(language: Language) {
  return translations[language];
}

export type { Demo1Translations };
