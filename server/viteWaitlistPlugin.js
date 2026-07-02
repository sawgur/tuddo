function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function handleWaitlist(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const { processWaitlistSignup: signup } = await import("./waitlistRoute.js");
    const body = await readBody(req);
    const result = signup(body.email);
    sendJson(res, result.status, result.body);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: "Something went wrong. Try again." });
  }
}

function apiMiddleware(req, res, next) {
  const url = req.url?.split("?")[0];
  if (url === "/api/waitlist") {
    handleWaitlist(req, res);
    return;
  }
  if (url === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }
  next();
}

export default function waitlistApiPlugin() {
  return {
    name: "tuddo-waitlist-api",
    configureServer(server) {
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware);
    },
  };
}
