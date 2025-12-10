import { Router } from 'express';
import { ItemsController } from '../controllers/items.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSchema, ValidationSchemas } from '../middleware/validation.middleware';

/**
 * Cria rotas de Items
 * Todos os endpoints requerem autenticação
 */
export function createItemsRoutes(): Router {
    const router = Router();
    const controller = new ItemsController();

    // Aplicar middleware de autenticação em todas as rotas
    router.use(authMiddleware);

    // GET /api/items/:id - Buscar Item por ID
    router.get('/:id', (req, res, next) => controller.getItem(req, res, next));

    // GET /api/items/uid/:uid - Buscar Item por UID
    router.get('/uid/:uid', (req, res, next) => controller.getItemByUid(req, res, next));

    // POST /api/items - Criar novo Item
    router.post(
        '/',
        validateSchema(ValidationSchemas.createItem),
        (req, res, next) => controller.createItem(req, res, next)
    );

    // PUT /api/items/:id - Atualizar Item
    router.put(
        '/:id',
        validateSchema(ValidationSchemas.updateItem),
        (req, res, next) => controller.updateItem(req, res, next)
    );

    // DELETE /api/items/:id - Deletar Item
    router.delete('/:id', (req, res, next) => controller.deleteItem(req, res, next));

    // GET /api/items/:id/revisions - Buscar revisões do Item
    router.get('/:id/revisions', (req, res, next) => controller.getItemRevisions(req, res, next));

    return router;
}
