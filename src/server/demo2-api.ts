/**
 * Demo2 API Routes
 * CRUD operations for Users table using Bun SQLite + Drizzle ORM
 */
import { db, initDatabase } from "../lib/demo2-db/db";
import { users, type User, type NewUser } from "../lib/demo2-db/schema";
import { eq } from "drizzle-orm";

// 初始化数据库（在服务器启动时调用一次）
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

// GET /api/demo2/users - 获取所有用户
export async function getUsers(): Promise<Response> {
  await ensureDbInitialized();
  try {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return Response.json({ success: true, data: allUsers });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/demo2/users/:id - 获取单个用户
export async function getUser(id: string): Promise<Response> {
  await ensureDbInitialized();
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return Response.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (user.length === 0) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: user[0] });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/demo2/users - 创建新用户
export async function createUser(req: Request): Promise<Response> {
  await ensureDbInitialized();
  try {
    const body = (await req.json()) as Partial<NewUser>;
    
    // 验证必填字段
    if (!body.name || !body.email) {
      return Response.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const newUser: NewUser = {
      name: body.name,
      email: body.email,
      age: body.age,
      role: body.role || "user",
    };

    const result = await db.insert(users).values(newUser).returning();
    return Response.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error: any) {
    // 处理唯一约束错误
    if (error.message?.includes("UNIQUE constraint failed")) {
      return Response.json(
        { success: false, error: "Email already exists" },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/demo2/users/:id - 更新用户
export async function updateUser(id: string, req: Request): Promise<Response> {
  await ensureDbInitialized();
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return Response.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as Partial<NewUser>;
    
    // 检查用户是否存在
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 更新用户（排除 id 和 createdAt）
    const updateData: Partial<NewUser> = {
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.age !== undefined && { age: body.age }),
      ...(body.role && { role: body.role }),
    };

    // 使用 SQL 更新，包括 updatedAt
    const result = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return Response.json({ success: true, data: result[0] });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
      return Response.json(
        { success: false, error: "Email already exists" },
        { status: 409 }
      );
    }
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/demo2/users/:id - 删除用户
export async function deleteUser(id: string): Promise<Response> {
  await ensureDbInitialized();
  try {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return Response.json(
        { success: false, error: "Invalid user ID" },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return Response.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await db.delete(users).where(eq(users.id, userId));
    return Response.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 处理路由的函数
export async function handleDemo2Api(req: Request, pathname: string): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  // 移除 /api/demo2 前缀
  const route = path.replace("/api/demo2", "");

  if (route === "/users" || route === "/users/") {
    if (req.method === "GET") {
      return getUsers();
    } else if (req.method === "POST") {
      return createUser(req);
    }
  } else if (route.startsWith("/users/")) {
    const id = route.replace("/users/", "");
    if (req.method === "GET") {
      return getUser(id);
    } else if (req.method === "PUT") {
      return updateUser(id, req);
    } else if (req.method === "DELETE") {
      return deleteUser(id);
    }
  }

  return Response.json(
    { success: false, error: "Not found" },
    { status: 404 }
  );
}
