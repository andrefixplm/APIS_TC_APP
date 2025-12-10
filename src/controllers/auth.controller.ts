import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginCredentials } from '../models/auth.model';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Controlador de autenticação
 * Orquestra operações de login, logout e refresh de tokens
 */
export class AuthController {
    private authService: AuthService;

    constructor(authService?: AuthService) {
        this.authService = authService || new AuthService();
    }

    /**
     * POST /api/auth/login
     * Realiza login no Teamcenter e retorna JWT
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const credentials: LoginCredentials = req.body;
            const loginResponse = await this.authService.login(credentials);

            res.status(200).json(loginResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout
     * Encerra sessão do Teamcenter
     */
    async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('Usuário não autenticado');
            }

            await this.authService.logout(req.user.tcToken);

            res.status(200).json({
                success: true,
                message: 'Logout realizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh
     * Renova token JWT
     */
    async refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Token não fornecido');
            }

            const oldToken = authHeader.substring(7);
            const newToken = this.authService.refreshToken(oldToken);

            res.status(200).json({
                success: true,
                auth: newToken,
            });
        } catch (error) {
            next(error);
        }
    }
}
