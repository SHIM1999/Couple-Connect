import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({
  origin: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Couple-Code"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const logRequestError: ErrorRequestHandler = (error, req, _res, next) => {
  // Drizzle wraps the database error. Log identifiers only, since the message
  // and query parameters can contain private data or connection information.
  const cause: unknown = error instanceof Error ? error.cause : undefined;
  const source = cause ?? error;
  const code = typeof source === "object" && source !== null && "code" in source
    && typeof source.code === "string" && /^[A-Z0-9_]{2,40}$/.test(source.code)
    ? source.code
    : undefined;
  req.log.error({ errorCode: code }, "API request failed");
  next(error);
};
app.use(logRequestError);

export default app;
