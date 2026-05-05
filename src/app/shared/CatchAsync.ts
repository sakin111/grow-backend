import { NextFunction, Request, RequestHandler, Response } from "express";


const CatchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            console.error(error)
            next(error)
        }
    }
}

export default CatchAsync