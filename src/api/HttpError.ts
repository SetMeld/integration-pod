export class HttpError extends Error {
  public readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }

  public static from(err: unknown): HttpError {
    if (err instanceof HttpError) {
      return err;
    }
    if (err instanceof Error) {
      return new HttpError(500, err.message);
    }
    if (typeof err === "string") {
      return new HttpError(500, err);
    }
    return new HttpError(500, "Unknown error");
  }
}
