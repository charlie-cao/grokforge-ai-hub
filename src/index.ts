import { serve } from "bun";
import index from "./index.html";
import demo1 from "./demo1.html";
import demo2 from "./demo2.html";
import demo3 from "./demo3.html";
import demo4 from "./demo4.html";
import demo5 from "./demo5.html";
import demo6 from "./demo6.html";

const server = serve({
  routes: {
    "/": index,
    "/demo1": demo1,
    "/demo2": demo2,
    "/demo3": demo3,
    "/demo4": demo4,
    "/demo5": demo5,
    "/demo6": demo6,
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
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
