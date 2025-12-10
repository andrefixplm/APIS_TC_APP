import { Router } from 'express';
import { createAuthRoutes } from './auth.routes';
import { createItemsRoutes } from './items.routes';
import { createSearchRoutes } from './search.routes';

/**
 * Agregador de rotas
 * Centraliza todas as rotas da aplicação
 */
export function createRoutes(): Router {
    const router = Router();

    // Rotas de autenticação
    router.use('/auth', createAuthRoutes());

    // Rotas de Items
    router.use('/items', createItemsRoutes());

    // Rotas de busca
    router.use('/search', createSearchRoutes());

    // Rota de health check
    router.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Teamcenter Gateway está rodando',
            timestamp: new Date().toISOString(),
        });
    });

    return router;
}
