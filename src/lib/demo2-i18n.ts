/**
 * Internationalization (i18n) for Demo2
 * Bun SQLite + Drizzle ORM Showcase
 */

export type Language = "zh" | "en";

export interface Demo2Translations {
  // Header
  title: string;
  subtitle: string;
  
  // Actions
  addUser: string;
  editUser: string;
  deleteUser: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
  update: string;
  
  // Table
  name: string;
  email: string;
  age: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  actions: string;
  noUsers: string;
  loading: string;
  
  // Form
  namePlaceholder: string;
  emailPlaceholder: string;
  agePlaceholder: string;
  rolePlaceholder: string;
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  ageInvalid: string;
  
  // Roles
  roleUser: string;
  roleAdmin: string;
  roleEditor: string;
  
  // Features
  features: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  
  // Stats
  totalUsers: string;
  databaseStatus: string;
  databaseConnected: string;
  
  // Messages
  userCreated: string;
  userUpdated: string;
  userDeleted: string;
  errorOccurred: string;
  confirmDelete: string;
  
  // Code examples
  codeExample: string;
  copyCode: string;
  copied: string;
}

const translations: Record<Language, Demo2Translations> = {
  zh: {
    title: "Demo2: Bun SQLite + Drizzle ORM",
    subtitle: "演示 Bun 内置 SQLite 数据库和 Drizzle ORM 的使用",
    
    addUser: "添加用户",
    editUser: "编辑用户",
    deleteUser: "删除用户",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    create: "创建",
    update: "更新",
    
    name: "姓名",
    email: "邮箱",
    age: "年龄",
    role: "角色",
    createdAt: "创建时间",
    updatedAt: "更新时间",
    actions: "操作",
    noUsers: "暂无用户数据",
    loading: "加载中...",
    
    namePlaceholder: "请输入姓名",
    emailPlaceholder: "请输入邮箱",
    agePlaceholder: "请输入年龄",
    rolePlaceholder: "请选择角色",
    nameRequired: "姓名是必填项",
    emailRequired: "邮箱是必填项",
    emailInvalid: "请输入有效的邮箱地址",
    ageInvalid: "年龄必须是数字",
    
    roleUser: "用户",
    roleAdmin: "管理员",
    roleEditor: "编辑",
    
    features: "核心特性",
    feature1: "✅ Bun SQLite 内置支持，无需额外依赖",
    feature2: "✅ Drizzle ORM 类型安全的数据库操作",
    feature3: "✅ 完整的 CRUD 操作演示",
    feature4: "✅ 实时数据展示和更新",
    feature5: "✅ 模块化设计，不影响其他演示",
    
    totalUsers: "总用户数",
    databaseStatus: "数据库状态",
    databaseConnected: "已连接",
    
    userCreated: "用户创建成功",
    userUpdated: "用户更新成功",
    userDeleted: "用户删除成功",
    errorOccurred: "发生错误",
    confirmDelete: "确定要删除此用户吗？",
    
    codeExample: "代码示例",
    copyCode: "复制代码",
    copied: "已复制",
  },
  en: {
    title: "Demo2: Bun SQLite + Drizzle ORM",
    subtitle: "Demonstrating Bun built-in SQLite database and Drizzle ORM usage",
    
    addUser: "Add User",
    editUser: "Edit User",
    deleteUser: "Delete User",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    
    name: "Name",
    email: "Email",
    age: "Age",
    role: "Role",
    createdAt: "Created At",
    updatedAt: "Updated At",
    actions: "Actions",
    noUsers: "No users yet",
    loading: "Loading...",
    
    namePlaceholder: "Enter name",
    emailPlaceholder: "Enter email",
    agePlaceholder: "Enter age",
    rolePlaceholder: "Select role",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    ageInvalid: "Age must be a number",
    
    roleUser: "User",
    roleAdmin: "Admin",
    roleEditor: "Editor",
    
    features: "Core Features",
    feature1: "✅ Bun SQLite built-in support, no extra dependencies",
    feature2: "✅ Drizzle ORM type-safe database operations",
    feature3: "✅ Complete CRUD operations demonstration",
    feature4: "✅ Real-time data display and updates",
    feature5: "✅ Modular design, doesn't affect other demos",
    
    totalUsers: "Total Users",
    databaseStatus: "Database Status",
    databaseConnected: "Connected",
    
    userCreated: "User created successfully",
    userUpdated: "User updated successfully",
    userDeleted: "User deleted successfully",
    errorOccurred: "An error occurred",
    confirmDelete: "Are you sure you want to delete this user?",
    
    codeExample: "Code Example",
    copyCode: "Copy Code",
    copied: "Copied",
  },
};

export function useDemo2Translations(language: Language) {
  return translations[language];
}

export type { Demo2Translations };
