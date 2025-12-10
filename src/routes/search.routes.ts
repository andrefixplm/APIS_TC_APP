import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSchema, ValidationSchemas } from '../middleware/validation.middleware';

/**
 * Cria rotas de busca
 * Todos os endpoints requerem autenticação
 */
export function createSearchRoutes(): Router {
    const router = Router();
    const controller = new SearchController();

    // Aplicar middleware de autenticação em todas as rotas
    router.use(authMiddleware);

    // POST /api/search - Busca personalizada
    router.post(
        '/',
        validateSchema(ValidationSchemas.search),
        (req, res, next) => controller.search(req, res, next)
    );

    // GET /api/search/type/:type - Buscar por tipo
    router.get('/type/:type', (req, res, next) => controller.searchByType(req, res, next));

    // GET /api/search/item-id/:itemId - Buscar por Item ID
    router.get('/item-id/:itemId', (req, res, next) => controller.searchByItemId(req, res, next));

    // GET /api/search/saved-queries - Listar Saved Queries
    router.get('/saved-queries', (req, res, next) => controller.getSavedQueries(req, res, next));

    // POST /api/search/saved-query/:queryName - Executar Saved Query
    router.post('/saved-query/:queryName', (req, res, next) =>
        controller.executeSavedQuery(req, res, next)
    );

    return router;
}
