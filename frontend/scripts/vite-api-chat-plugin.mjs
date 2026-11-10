import { loadEnv } from "vite";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function createMockResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(res, res.statusCode || 200, payload);
      return this;
    },
    setHeader(key, value) {
      res.setHeader(key, value);
      return this;
    },
  };
}

/**
 * Serves /api/* during `vite` dev (Vercel functions only run on deploy or `vercel dev`).
 * API handlers are imported lazily inside configureServer so production `vite build`
 * does not resolve serverless modules while loading vite.config.js.
 */
export function apiChatDevPlugin() {
  return {
    name: "api-chat-dev",
    async configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");

      for (const [key, value] of Object.entries(env)) {
        if (value && !process.env[key]) process.env[key] = String(value).trim();
      }

      const [
        { handleChatRequest },
        { handleGuestbookRequest },
        { handleGitHubStatsRequest },
        { handleGitHubEventsRequest },
        { handleFrameCheckRequest },
        { handleContactRequest },
      ] = await Promise.all([
        import("../api/chat.js"),
        import("../api/guestbook.js"),
        import("../api/github-stats.js"),
        import("../api/github-events.js"),
        import("../api/frameCheck.js"),
        import("../api/contact.js"),
      ]);

      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];

        if (path === "/api/contact") {
          try {
            if (req.method !== "POST") {
              sendJson(res, 405, { error: "Method not allowed" });
              return;
            }
            const body = await readJsonBody(req);
            await handleContactRequest(
              { method: "POST", headers: req.headers, body },
              createMockResponse(res),
            );
          } catch (error) {
            sendJson(res, error.status || 500, { error: error.message || "Contact failed" });
          }
          return;
        }

        if (path === "/api/guestbook") {
          try {
            const body = ["POST", "DELETE"].includes(req.method) ? await readJsonBody(req) : {};
            await handleGuestbookRequest(
              { method: req.method, headers: req.headers, body },
              createMockResponse(res),
            );
          } catch (error) {
            sendJson(res, 500, { error: error.message || "Guestbook failed" });
          }
          return;
        }

        if (path === "/api/github-stats" && req.method === "GET") {
          try {
            await handleGitHubStatsRequest(req, createMockResponse(res));
          } catch (error) {
            sendJson(res, 503, { error: error.message || "GitHub stats failed" });
          }
          return;
        }

        if (path === "/api/frame-check" && req.method === "GET") {
          try {
            const query = Object.fromEntries(new URL(req.url, "http://localhost").searchParams);
            await handleFrameCheckRequest(
              { method: "GET", url: req.url, query },
              createMockResponse(res),
            );
          } catch (error) {
            sendJson(res, 500, { embeddable: true, error: error.message || "Frame check failed" });
          }
          return;
        }

        if (path === "/api/github-events" && req.method === "GET") {
          try {
            await handleGitHubEventsRequest(req, createMockResponse(res));
          } catch (error) {
            sendJson(res, 503, { error: error.message || "GitHub events failed" });
          }
          return;
        }

        if (path !== "/api/chat") {
          next();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = await readJsonBody(req);
          await handleChatRequest(
            { method: "POST", headers: req.headers, body },
            createMockResponse(res),
          );
        } catch (error) {
          sendJson(res, error.status || 500, { error: error.message || "Generation failed" });
        }
      });
    },
  };
}
