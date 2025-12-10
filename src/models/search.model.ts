/**
 * Critérios de busca para pesquisa no Teamcenter
 */
export interface SearchCriteria {
    query: string; // Query string (ex: "item_id:000*")
    type?: string; // Tipo de objeto (ex: "Item", "ItemRevision")
    maxResults?: number; // Número máximo de resultados
    properties?: string[]; // Propriedades a serem retornadas
}

/**
 * Resultado de busca do Teamcenter
 */
export interface SearchResult {
    totalFound: number; // Total de resultados encontrados
    items: SearchResultItem[]; // Items retornados
    hasMore: boolean; // Indica se há mais resultados
}

/**
 * Item individual no resultado de busca
 */
export interface SearchResultItem {
    uid: string;
    type: string;
    properties: Record<string, any>;
}

/**
 * Saved Query do Teamcenter
 */
export interface SavedQuery {
    uid: string;
    name: string;
    description?: string;
    queryType: string;
    entries?: SavedQueryEntry[];
}

/**
 * Entrada de uma Saved Query
 */
export interface SavedQueryEntry {
    key: string;
    value: string;
    operator?: string; // Ex: "=", "LIKE", ">", "<"
}

/**
 * DTO para executar uma busca
 */
export interface ExecuteSearchDto {
    criteria: SearchCriteria;
    savedQueryName?: string; // Nome da Saved Query (opcional)
}

/**
 * Resposta padrão do Teamcenter para operações de busca
 */
export interface TeamcenterSearchResponse {
    totalFound: number;
    totalLoaded: number;
    objects: Array<{
        uid: string;
        type: string;
        properties?: Record<string, any>;
    }>;
    cursor?: {
        startIndex: number;
        endIndex: number;
    };
}
