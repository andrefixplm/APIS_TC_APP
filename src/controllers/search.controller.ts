import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { SearchCriteria } from '../models/search.model';

/**
 * Controlador de busca
 * Orquestra operações de busca no Teamcenter
 */
export class SearchController {
    private searchService: SearchService;

    constructor(searchService?: SearchService) {
        this.searchService = searchService || new SearchService();
    }

    /**
     * POST /api/search
     * Executa uma busca com critérios personalizados
     */
    async search(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const criteria: SearchCriteria = req.body;
            const result = await this.searchService.search(criteria);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/search/type/:type
     * Busca Items por tipo
     */
    async searchByType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { type } = req.params;
            const maxResults = parseInt(req.query.maxResults as string) || 50;

            const result = await this.searchService.searchByType(type, maxResults);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/search/item-id/:itemId
     * Busca Items por Item ID (com suporte a wildcards)
     */
    async searchByItemId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { itemId } = req.params;
            const result = await this.searchService.searchByItemId(itemId);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/search/saved-queries
     * Lista todas as Saved Queries disponíveis
     */
    async getSavedQueries(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const queries = await this.searchService.getSavedQueries();

            res.status(200).json({
                success: true,
                data: queries,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/search/saved-query/:queryName
     * Executa uma Saved Query
     */
    async executeSavedQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { queryName } = req.params;
            const entries = req.body.entries || {};

            const result = await this.searchService.executeSavedQuery(queryName, entries);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
