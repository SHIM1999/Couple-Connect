import type { Request, Response, NextFunction } from "express";

export function coupleCodeMiddleware(req: Request, res: Response, next: NextFunction) {
  const code = req.headers["x-couple-code"];
  if (!code || typeof code !== "string" || code.trim().length < 4) {
    res.status(400).json({ error: "Missing or invalid X-Couple-Code header" });
    return;
  }
  res.locals.coupleCode = code.trim().toLowerCase();
  next();
}
