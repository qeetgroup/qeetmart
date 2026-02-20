declare global {
  namespace Express {
    interface Request {
      token?: string;
      correlationId?: string;
    }
  }
}

export {};
