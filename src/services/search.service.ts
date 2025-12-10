import { SearchRepository } from '../repositories/search.repository';
import { Logger } from '../config/logger.config';
import { SearchCriteria, SearchResult, SavedQuery } from '../models/search.model';

/**
 * Serviço de busca
 * Implementa regras de negócio para operações de busca no Teamcenter
 */
export class SearchService {
    private logger = Logger.getInstance();
    private searchRepo: SearchRepository;

    constructor(searchRepo?: SearchRepository) {
        this.searchRepo = searchRepo || new SearchRepository();
    }

    /**
     * Executa uma busca com validação de critérios
     * @param criteria - Critérios de busca
     * @returns Resultado da busca
     */
    async search(criteria: SearchCriteria): Promise<SearchResult> {
        // Validação de entrada
        if (!criteria.query || criteria.query.trim() === '') {
            throw new Error('Query de busca é obrigatória');
        }

        // Limitar número máximo de resultados
        if (criteria.maxResults && criteria.maxResults > 1000) {
            this.logger.warn('Número máximo de resultados limitado a 1000', {
                requested: criteria.maxResults,
            });
            criteria.maxResults = 1000;
        }

        try {
            const result = await this.searchRepo.executeSearch(criteria);
            this.logger.info('Busca executada com sucesso', {
                query: criteria.query,
                totalFound: result.totalFound,
            });
            return result;
        } catch (error) {
            this.logger.error('Erro ao executar busca', {
                criteria,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha na busca: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Busca Items por tipo
     * @param type - Tipo de objeto
     * @param maxResults - Número máximo de resultados
     * @returns Resultado da busca
     */
    async searchByType(type: string, maxResults: number = 50): Promise<SearchResult> {
        if (!type || type.trim() === '') {
            throw new Error('Tipo de objeto é obrigatório');
        }

        try {
            const result = await this.searchRepo.searchByType(type, maxResults);
            this.logger.info('Busca por tipo executada com sucesso', {
                type,
                totalFound: result.totalFound,
            });
            return result;
        } catch (error) {
            this.logger.error('Erro ao buscar por tipo', {
                type,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha ao buscar por tipo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Busca Items por Item ID (com suporte a wildcards)
     * @param itemId - Item ID (ex: "000*")
     * @returns Resultado da busca
     */
    async searchByItemId(itemId: string): Promise<SearchResult> {
        if (!itemId || itemId.trim() === '') {
            throw new Error('Item ID é obrigatório');
        }

        try {
            const result = await this.searchRepo.searchByItemId(itemId);
            this.logger.info('Busca por Item ID executada com sucesso', {
                itemId,
                totalFound: result.totalFound,
            });
            return result;
        } catch (error) {
            this.logger.error('Erro ao buscar por Item ID', {
                itemId,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha ao buscar Item ID: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Lista todas as Saved Queries disponíveis
     * @returns Lista de Saved Queries
     */
    async getSavedQueries(): Promise<SavedQuery[]> {
        try {
            const queries = await this.searchRepo.getSavedQueries();
            this.logger.info('Saved Queries recuperadas com sucesso', {
                count: queries.length,
            });
            return queries;
        } catch (error) {
            this.logger.error('Erro ao buscar Saved Queries', {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error('Falha ao buscar Saved Queries');
        }
    }

    /**
     * Executa uma Saved Query
     * @param queryName - Nome da Saved Query
     * @param entries - Parâmetros da query
     * @returns Resultado da busca
     */
    async executeSavedQuery(
        queryName: string,
        entries?: Record<string, string>
    ): Promise<SearchResult> {
        if (!queryName || queryName.trim() === '') {
            throw new Error('Nome da Saved Query é obrigatório');
        }

        try {
            const result = await this.searchRepo.executeSavedQuery(queryName, entries);
            this.logger.info('Saved Query executada com sucesso', {
                queryName,
                totalFound: result.totalFound,
            });
            return result;
        } catch (error) {
            this.logger.error('Erro ao executar Saved Query', {
                queryName,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha ao executar Saved Query: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}
