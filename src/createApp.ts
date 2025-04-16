import express, { Express, Request, Response } from "express";

export function createApp(base: string): Express {
  const app = express();

  app.get(".integration/", (req: Request, res: Response) => {
    res.send("Hello");
  });

  return app;
}
