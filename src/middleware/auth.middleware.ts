import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayload } from '../models/auth.model';

/**
 * Interface estendida do Request para incluir dados do usuário autenticado
 */
export interface AuthRequest extends Request {
    user?: {
        username: string;
        tcToken: string; // Token de sessão do Teamcenter
    };
}

/**
 * Middleware de autenticação JWT
 * Valida o token JWT e injeta dados do usuário no request
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
        // Extrair token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Token não fornecido. Use o header Authorization: Bearer <token>',
            });
            return;
        }

        const token = authHeader.substring(7); // Remove "Bearer "

        // Validar token JWT
        const authService = new AuthService();
        const payload: JwtPayload = authService.validateToken(token);

        // Injetar dados do usuário no request
        req.user = {
            username: payload.username,
            tcToken: payload.tcToken,
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Token inválido ou expirado. Faça login novamente.',
        });
    }
}

/**
 * Middleware opcional de autenticação
 * Permite requisições sem token, mas injeta dados do usuário se token estiver presente
 */
export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const authService = new AuthService();
            const payload: JwtPayload = authService.validateToken(token);

            req.user = {
                username: payload.username,
                tcToken: payload.tcToken,
            };
        }

        next();
    } catch (_error) {
        // Ignorar erro de validação, continuar sem autenticação
        next();
    }
}
