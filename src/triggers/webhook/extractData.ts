import { Request, Express, Response } from "express";
import { WebhookTriggerConfig } from "./WebhookTrigger";
import multer from "multer";
import bodyParser from "body-parser";
import { HttpError } from "../../api/HttpError";

const upload = multer().any();
const jsonParser = bodyParser.json();

const extractors: Record<
  string,
  (req: Request, res: Response) => Promise<unknown>
> = {
  "form/multipart": async (
    req: Request,
    res: Response,
  ): Promise<Express.Multer.File[]> => {
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    return Array.isArray(req.files)
      ? req.files
      : req.files
        ? Object.values(req.files).reduce((agg, file) => {
            agg.push(...file);
            return agg;
          }, [])
        : [];
  },
  "application/json": async (req: Request, res: Response): Promise<object> => {
    await new Promise<void>((resolve, reject) => {
      jsonParser(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
    return req.body;
  },
};

export async function extractData(
  req: Request,
  res: Response,
  config: WebhookTriggerConfig,
): Promise<unknown> {
  const extractor = extractors[config.accept];
  if (!extractor) {
    throw new HttpError(
      400,
      `Config error. This server does not support ${config.accept}`,
    );
  }
  return extractor(req, res);
}
