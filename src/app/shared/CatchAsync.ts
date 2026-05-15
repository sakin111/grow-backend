import { NextFunction, Request, RequestHandler, Response } from "express";
import { logger } from "../lib/logger";


const CatchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            logger.error({ err: error, path: req.path, method: req.method }, "Request handler error")
            next(error)
        }
    }
}

export default CatchAsync