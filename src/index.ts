import { serve } from "bun";
import index from "./index.html";
import demo1 from "./demo1.html";
import demo2 from "./demo2.html";
import demo3 from "./demo3.html";
import demo4 from "./demo4.html";
import demo5 from "./demo5.html";
import demo6 from "./demo6.html";
import demo7 from "./demo7.html";
import demo8 from "./demo8.html";
import demo9 from "./demo9.html";

const server = serve({
  routes: {
    "/": index,
    "/demo1": demo1,
    "/demo2": demo2,
    "/demo3": demo3,
    "/demo4": demo4,
    "/demo5": demo5,
    "/demo6": demo6,
    "/demo7": demo7,
    "/demo8": demo8,
    "/demo9": demo9,
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Demo2 API routes - Bun SQLite + Drizzle ORM
    "/api/demo2/users": {
      GET: async () => {
        const { getUsers } = await import("./server/demo2-api");
        return getUsers();
      },
      POST: async (req) => {
        const { createUser } = await import("./server/demo2-api");
        return createUser(req);
      },
    },
    "/api/demo2/users/:id": {
      GET: async (req) => {
        const { getUser } = await import("./server/demo2-api");
        return getUser(req.params.id);
      },
      PUT: async (req) => {
        const { updateUser } = await import("./server/demo2-api");
        return updateUser(req.params.id, req);
      },
      DELETE: async (req) => {
        const { deleteUser } = await import("./server/demo2-api");
        return deleteUser(req.params.id);
      },
    },

    // Demo7 API routes - Scheduled AI Chat Tasks
    "/api/demo7/chats": {
      GET: async (req) => {
        const { getAllChats } = await import("./server/demo7-api");
        return getAllChats(req);
      },
    },
    "/api/demo7/chats/:id": {
      GET: async (req) => {
        const { getChatById } = await import("./server/demo7-api");
        return getChatById(req, req.params.id);
      },
    },

    // Demo9 API routes - File Processing System
    "/api/demo9/upload": {
      POST: async (req) => {
        const { uploadFile } = await import("./server/demo9-api");
        return uploadFile(req);
      },
    },
    "/api/demo9/files": {
      GET: async (req) => {
        const { listFiles } = await import("./server/demo9-api");
        return listFiles(req);
      },
    },
    "/api/demo9/files/:filename": {
      GET: async (req) => {
        const { downloadFile } = await import("./server/demo9-api");
        return downloadFile(req, req.params.filename);
      },
      DELETE: async (req) => {
        const { deleteFile } = await import("./server/demo9-api");
        return deleteFile(req, req.params.filename);
      },
    },
    "/api/demo9/process/image": {
      POST: async (req) => {
        const { processImage } = await import("./server/demo9-api");
        return processImage(req);
      },
    },
    "/api/demo9/processed/:filename": {
      GET: async (req) => {
        const { getProcessedFile } = await import("./server/demo9-api");
        return getProcessedFile(req, req.params.filename);
      },
    },
    "/api/demo9/generate/pdf": {
      POST: async (req) => {
        const { generatePDF } = await import("./server/demo9-api");
        return generatePDF(req);
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
