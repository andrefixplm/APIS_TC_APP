import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateSchema, ValidationSchemas } from '../middleware/validation.middleware';

/**
 * Cria rotas de autenticação
 * Endpoints públicos (sem middleware de auth)
 */
export function createAuthRoutes(): Router {
    const router = Router();
    const controller = new AuthController();

    // POST /api/auth/login - Login no Teamcenter
    router.post(
        '/login',
        validateSchema(ValidationSchemas.login),
        (req, res, next) => controller.login(req, res, next)
    );

    // POST /api/auth/logout - Logout do Teamcenter
    router.post('/logout', (req, res, next) => controller.logout(req, res, next));

    // POST /api/auth/refresh - Renovar token JWT
    router.post('/refresh', (req, res, next) => controller.refreshToken(req, res, next));

    return router;
}
