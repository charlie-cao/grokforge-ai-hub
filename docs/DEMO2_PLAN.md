# Demo2 扩展计划 - Drizzle ORM 高级功能演示

## 功能规划

### Tab 页面结构

1. **基础 CRUD** (已实现)
   - 用户管理
   - 增删改查操作

2. **关联查询 (Relations)**
   - 用户-文章-评论关联
   - 一对一、一对多关系演示
   - 级联查询

3. **高级查询 (Advanced Queries)**
   - 条件查询 (where, like, in)
   - 排序和分页
   - 聚合函数 (count, sum, avg)
   - 分组查询 (groupBy)

4. **事务处理 (Transactions)**
   - 批量操作
   - 回滚演示
   - 数据一致性保证

5. **索引优化 (Indexes)**
   - 索引性能对比
   - 查询性能分析

6. **特性说明 (Documentation)**
   - 每个功能的用例和特性说明
   - 代码示例

## 需要添加的内容

### 1. Schema 扩展 ✅ (已完成)
- users 表
- posts 表（关联 users）
- comments 表（关联 posts 和 users）

### 2. API 端点扩展
- 关联查询 API
- 高级查询 API
- 事务操作 API

### 3. 前端 Tab 页面
- 使用 Tabs 组件组织内容
- 每个 tab 展示不同功能
- 添加详细文档说明

### 4. 返回首页功能
- 所有 demo 页添加返回首页按钮

## 实现步骤

1. ✅ 扩展 schema
2. ⏳ 更新数据库初始化
3. ⏳ 添加高级 API 端点
4. ⏳ 更新国际化翻译
5. ⏳ 重构 Demo2 组件（添加 Tabs）
6. ⏳ 实现各个 Tab 页面
7. ⏳ 添加返回首页到所有 demo

