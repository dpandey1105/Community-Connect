import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { storage } from "./storage.js";
import { whitelistCurrentIP } from "./atlasWhitelist.js";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Manual IP whitelisting required in Atlas dashboard
// await whitelistCurrentIP();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/community-connect";

// Add connection options for production
const mongooseOptions = process.env.NODE_ENV === 'production' ? {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
} : {};

storage.connect(MONGODB_URI, mongooseOptions).then(() => {
  log("Connected to MongoDB");
}).catch((err) => {
  log(`MongoDB connection error: ${err}`);
  process.exit(1);
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false // Disable CORS in production
    : ['http://localhost:5173', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5176'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Enable gzip compression for better performance
import compression from 'compression';
app.use(compression());

(async () => {
  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // In development, serve API and client using Vite middleware.
  // In production, serve static files.
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
