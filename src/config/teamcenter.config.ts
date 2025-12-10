import { EnvConfig } from './env.config';

/**
 * Configuração específica do Teamcenter
 * Centraliza URLs de endpoints e configurações de API
 */
export interface TeamcenterConfig {
    baseURL: string;
    timeout: number;
    endpoints: {
        sessions: string;
        items: string;
        search: string;
        savedQueries: string;
    };
}

/**
 * Configuração padrão do Teamcenter REST API
 */
export const teamcenterConfig: TeamcenterConfig = {
    baseURL: EnvConfig.teamcenter.baseURL,
    timeout: EnvConfig.teamcenter.timeout,
    endpoints: {
        // Endpoint de autenticação
        sessions: '/tc/rest/sessions',

        // Endpoints de Items
        items: '/tc/rest/items',

        // Endpoints de busca
        search: '/tc/rest/query',
        savedQueries: '/tc/rest/query/saved',
    },
};

/**
 * Retorna a URL completa de um endpoint
 * @param endpoint - Nome do endpoint (ex: 'sessions', 'items')
 * @returns URL completa
 */
export function getEndpointUrl(endpoint: keyof TeamcenterConfig['endpoints']): string {
    return `${teamcenterConfig.baseURL}${teamcenterConfig.endpoints[endpoint]}`;
}
