import { Request, Response, NextFunction } from 'express';
import { Logger } from '../config/logger.config';

/**
 * Middleware de logging de requisições HTTP
 * Loga todas as requisições com método, path, status e tempo de resposta
 */
export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Capturar evento de finalização da resposta
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        Logger.logRequest(req.method, req.path, res.statusCode, duration);
    });

    next();
}
