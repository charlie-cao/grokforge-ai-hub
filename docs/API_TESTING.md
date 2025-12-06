# API Testing Guide

本项目为 API 端点提供了完整的单元测试，使用 **Bun** 内置测试运行器。

## 测试覆盖的 API

### 1. `/api/hello` - 简单 Hello API
- ✅ GET 请求
- ✅ PUT 请求
- ✅ 带参数的路径 `/api/hello/:name`

### 2. `/api/demo2/users` - 用户 CRUD API
- ✅ GET - 获取所有用户
- ✅ GET `/api/demo2/users/:id` - 获取单个用户
- ✅ POST - 创建用户
- ✅ PUT `/api/demo2/users/:id` - 更新用户
- ✅ DELETE `/api/demo2/users/:id` - 删除用户
- ✅ 错误处理（400, 404, 409, 500）
- ✅ 数据验证

### 3. `/api/demo7/chats` - 聊天记录 API
- ✅ GET - 获取所有聊天记录
- ✅ GET `/api/demo7/chats/:id` - 获取单个聊天记录
- ✅ 查询参数处理（limit）
- ✅ 错误处理

## 运行测试

```bash
# 运行所有 API 测试
bun test src/server/

# 运行特定 API 测试
bun test src/server/demo2-api.test.ts
bun test src/server/demo7-api.test.ts
bun test src/server/api-hello.test.ts

# 运行所有测试（包括前端和 API）
bun test --preload ./test/setup.ts
```

## 测试工具函数

### `createMockRequest`
创建模拟的 Request 对象用于测试：

```typescript
const req = createMockRequest("http://localhost/api/demo2/users", {
  method: "POST",
  body: { name: "Test", email: "test@test.com" },
  headers: { "Authorization": "Bearer token" },
});
```

### `parseJsonResponse`
解析 JSON 响应：

```typescript
const { data, status, headers } = await parseJsonResponse(response);
expect(data.success).toBe(true);
```

### `expectSuccess` / `expectError`
断言响应状态：

```typescript
expectSuccess(response, 200);  // 期望成功响应
expectError(response, 404);    // 期望错误响应
```

## 编写 API 测试

### 基本测试结构

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import { createMockRequest, parseJsonResponse, expectSuccess } from "../test/api-test-utils";
import { yourApiFunction } from "./your-api";

describe("Your API", () => {
  beforeEach(() => {
    // 设置测试环境
  });

  it("should handle request correctly", async () => {
    const req = createMockRequest("http://localhost/api/endpoint", {
      method: "GET",
    });

    const response = await yourApiFunction(req);
    expectSuccess(response);
    
    const { data } = await parseJsonResponse(response);
    expect(data.success).toBe(true);
  });
});
```

### 测试数据库操作

对于涉及数据库的 API（如 demo2-api），测试会：

1. 在每个测试前初始化数据库
2. 清理测试数据
3. 使用真实的 SQLite 数据库（内存或临时文件）

```typescript
beforeEach(async () => {
  await initDatabase();
  await db.delete(users);  // 清理数据
});
```

### 测试错误情况

```typescript
it("should return 400 for invalid input", async () => {
  const req = createMockRequest("http://localhost/api/endpoint", {
    method: "POST",
    body: { /* 无效数据 */ },
  });

  const response = await yourApiFunction(req);
  expectError(response, 400);
  
  const { data } = await parseJsonResponse(response);
  expect(data.success).toBe(false);
  expect(data.error).toBeDefined();
});
```

### Mock 外部依赖

对于依赖外部服务的 API（如 demo7-api），使用 `spyOn` 来 mock：

```typescript
import * as externalModule from "./external-module";

const spy = spyOn(externalModule, "externalFunction");
spy.mockResolvedValueOnce(mockData);

// 测试代码...

expect(spy).toHaveBeenCalledWith(expectedArgs);
```

## 测试统计

当前测试覆盖：
- **28 个测试用例**
- **3 个 API 模块**
- **117 个断言**

## CI/CD 集成

API 测试会在 GitHub Actions CI 中自动运行（见 `.github/workflows/ci.yml`）。

## 最佳实践

1. **隔离测试**：每个测试应该独立，不依赖其他测试的状态
2. **清理数据**：在 `beforeEach` 或 `afterEach` 中清理测试数据
3. **测试边界情况**：包括无效输入、缺失字段、重复数据等
4. **测试错误处理**：确保 API 正确返回错误状态码和消息
5. **使用描述性测试名称**：清楚地描述测试的目的

## 扩展测试

添加新 API 测试时：

1. 创建 `*.test.ts` 文件在 `src/server/` 目录
2. 导入测试工具函数
3. 编写测试用例
4. 运行 `bun test` 验证

