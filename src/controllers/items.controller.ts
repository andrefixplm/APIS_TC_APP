import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/item.service';
import { CreateItemDto, UpdateItemDto } from '../models/item.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { ItemRepository } from '../repositories/item.repository';

/**
 * Controlador de Items
 * Orquestra operações CRUD de Items do Teamcenter
 */
export class ItemsController {
    private itemService: ItemService;

    constructor(itemService?: ItemService) {
        this.itemService = itemService || new ItemService();
    }

    /**
     * GET /api/items/:id
     * Busca um Item por ID
     */
    async getItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const item = await this.itemService.getItem(id);

            res.status(200).json({
                success: true,
                data: item,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/items/uid/:uid
     * Busca um Item por UID
     */
    async getItemByUid(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { uid } = req.params;
            const item = await this.itemService.getItemByUid(uid);

            res.status(200).json({
                success: true,
                data: item,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/items
     * Cria um novo Item
     */
    async createItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const itemData: CreateItemDto = req.body;

            // Configurar token do Teamcenter no repositório
            if (req.user) {
                const itemRepo = new ItemRepository();
                itemRepo.setAuthToken(req.user.tcToken);
                this.itemService = new ItemService(itemRepo);
            }

            const newItem = await this.itemService.createItem(itemData);

            res.status(201).json({
                success: true,
                data: newItem,
                message: 'Item criado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/items/:id
     * Atualiza um Item existente
     */
    async updateItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updates: UpdateItemDto = req.body;

            // Configurar token do Teamcenter no repositório
            if (req.user) {
                const itemRepo = new ItemRepository();
                itemRepo.setAuthToken(req.user.tcToken);
                this.itemService = new ItemService(itemRepo);
            }

            const updatedItem = await this.itemService.updateItem(id, updates);

            res.status(200).json({
                success: true,
                data: updatedItem,
                message: 'Item atualizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/items/:id
     * Deleta um Item
     */
    async deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Configurar token do Teamcenter no repositório
            if (req.user) {
                const itemRepo = new ItemRepository();
                itemRepo.setAuthToken(req.user.tcToken);
                this.itemService = new ItemService(itemRepo);
            }

            await this.itemService.deleteItem(id);

            res.status(200).json({
                success: true,
                message: `Item ${id} deletado com sucesso`,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/items/:id/revisions
     * Busca todas as revisões de um Item
     */
    async getItemRevisions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const revisions = await this.itemService.getItemRevisions(id);

            res.status(200).json({
                success: true,
                data: revisions,
            });
        } catch (error) {
            next(error);
        }
    }
}
