# Frontend Testing Guide

本项目使用 **Bun** 内置测试运行器和 **React Testing Library** 进行前端单元测试。

## 测试框架

- **Bun Test**: Bun 内置的测试运行器（类似 Jest）
- **React Testing Library**: React 组件测试库
- **@testing-library/jest-dom**: 额外的 DOM 断言
- **happy-dom**: 轻量级 DOM 实现，用于测试环境

## 运行测试

```bash
# 运行所有测试
bun test

# 监听模式（自动重新运行）
bun test:watch

# 生成覆盖率报告
bun test:coverage

# 运行特定测试文件
bun test src/components/ui/button.test.tsx
```

## 测试文件结构

```
src/
  test/
    setup.ts          # 全局测试配置（DOM 环境、matchers）
    test-utils.tsx    # 测试工具函数（自定义 render）
  components/
    ui/
      button.test.tsx # Button 组件测试
  pages/
    Home.test.tsx     # Home 页面测试
  lib/
    utils.test.ts     # 工具函数测试
```

## 编写测试

### 基本组件测试

```tsx
import { describe, it, expect } from "bun:test";
import { render } from "../test/test-utils";
import { Button } from "./button";

describe("Button", () => {
  it("should render button with text", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });
});
```

### 测试用户交互

```tsx
import userEvent from "@testing-library/user-event";

it("should handle click events", async () => {
  const user = userEvent.setup();
  const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);
  
  const button = getByRole("button");
  await user.click(button);
  
  expect(button).toBeInTheDocument();
});
```

### 测试样式和类名

```tsx
it("should apply variant classes", () => {
  const { container } = render(<Button variant="destructive">Delete</Button>);
  const button = container.querySelector("button");
  expect(button).toHaveClass("bg-destructive");
});
```

## 重要提示

1. **不要直接使用 `screen`**: 由于 Bun 测试环境的限制，请使用 `render()` 返回的查询函数而不是 `screen`：
   ```tsx
   // ✅ 正确
   const { getByRole } = render(<Component />);
   expect(getByRole("button")).toBeInTheDocument();
   
   // ❌ 错误（会导致 document 未定义错误）
   render(<Component />);
   expect(screen.getByRole("button")).toBeInTheDocument();
   ```

2. **DOM 环境**: 测试会自动设置 DOM 环境（通过 `test/setup.ts`），包括：
   - `window` 和 `document`
   - `localStorage` mock
   - `window.location` mock

3. **清理**: 每个测试后会自动清理 React 组件和 localStorage

## 测试覆盖的组件

- ✅ `Button` - UI 按钮组件
- ✅ `BackToHome` - 返回首页组件
- ✅ `Home` - 首页组件
- ✅ `utils.cn` - 类名合并工具函数

## 扩展测试

添加新测试时：

1. 创建 `*.test.tsx` 或 `*.test.ts` 文件
2. 导入必要的测试工具
3. 使用 `render()` 而不是 `screen`
4. 运行 `bun test` 验证

## CI/CD

测试会在 GitHub Actions CI 中自动运行（见 `.github/workflows/ci.yml`）。

