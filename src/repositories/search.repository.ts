import { TeamcenterRepository } from './teamcenter.repository';
import {
    SearchCriteria,
    SearchResult,
    SearchResultItem,
    SavedQuery,
    TeamcenterSearchResponse,
} from '../models/search.model';

/**
 * Repositório para operações de busca no Teamcenter
 */
export class SearchRepository extends TeamcenterRepository {
    /**
     * Executa uma busca simples no Teamcenter
     * @param criteria - Critérios de busca
     * @returns Resultado da busca
     */
    async executeSearch(criteria: SearchCriteria): Promise<SearchResult> {
        const endpoint = this.config.endpoints.search;
        const payload = this.buildSearchPayload(criteria);

        const response = await this.post<TeamcenterSearchResponse>(endpoint, payload);
        return this.mapTeamcenterSearchResponse(response);
    }

    /**
     * Busca Items por tipo
     * @param type - Tipo de objeto (ex: "Item", "ItemRevision")
     * @param maxResults - Número máximo de resultados
     * @returns Resultado da busca
     */
    async searchByType(type: string, maxResults: number = 50): Promise<SearchResult> {
        return this.executeSearch({
            query: `type:${type}`,
            type,
            maxResults,
        });
    }

    /**
     * Busca Items por Item ID (com suporte a wildcards)
     * @param itemId - Item ID (ex: "000*" para buscar todos começando com 000)
     * @returns Resultado da busca
     */
    async searchByItemId(itemId: string): Promise<SearchResult> {
        return this.executeSearch({
            query: `item_id:${itemId}`,
            type: 'Item',
        });
    }

    /**
     * Lista todas as Saved Queries disponíveis
     * @returns Lista de Saved Queries
     */
    async getSavedQueries(): Promise<SavedQuery[]> {
        const endpoint = this.config.endpoints.savedQueries;
        const response = await this.get<any[]>(endpoint);

        return response.map((sq) => ({
            uid: sq.uid,
            name: sq.name || sq.query_name,
            description: sq.description || sq.query_desc,
            queryType: sq.query_type || 'Unknown',
        }));
    }

    /**
     * Executa uma Saved Query pelo nome
     * @param queryName - Nome da Saved Query
     * @param entries - Parâmetros da query (opcional)
     * @returns Resultado da busca
     */
    async executeSavedQuery(
        queryName: string,
        entries?: Record<string, string>
    ): Promise<SearchResult> {
        const endpoint = `${this.config.endpoints.savedQueries}/${queryName}`;
        const payload = entries ? { entries: this.buildQueryEntries(entries) } : {};

        const response = await this.post<TeamcenterSearchResponse>(endpoint, payload);
        return this.mapTeamcenterSearchResponse(response);
    }

    /**
     * Constrói payload de busca para o Teamcenter
     */
    private buildSearchPayload(criteria: SearchCriteria): any {
        const payload: any = {
            searchInput: {
                searchCriteria: criteria.query,
                maxToReturn: criteria.maxResults || 50,
            },
        };

        if (criteria.type) {
            payload.searchInput.searchFilterMap = {
                'WorkspaceObject.object_type': [criteria.type],
            };
        }

        if (criteria.properties && criteria.properties.length > 0) {
            payload.searchInput.attributesToInflate = criteria.properties;
        }

        return payload;
    }

    /**
     * Constrói entradas de query para Saved Queries
     */
    private buildQueryEntries(entries: Record<string, string>): any[] {
        return Object.entries(entries).map(([key, value]) => ({
            key,
            value,
        }));
    }

    /**
     * Mapeia resposta de busca do Teamcenter para modelo interno
     */
    private mapTeamcenterSearchResponse(response: TeamcenterSearchResponse): SearchResult {
        return {
            totalFound: response.totalFound || 0,
            items: response.objects?.map(this.mapSearchResultItem) || [],
            hasMore: (response.totalFound || 0) > (response.totalLoaded || 0),
        };
    }

    /**
     * Mapeia item individual do resultado de busca
     */
    private mapSearchResultItem(tcItem: any): SearchResultItem {
        return {
            uid: tcItem.uid,
            type: tcItem.type,
            properties: tcItem.properties || {},
        };
    }
}
