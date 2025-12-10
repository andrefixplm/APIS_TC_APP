/**
 * Modelo de dados para Item do Teamcenter
 */
export interface Item {
    id: string; // UID do Teamcenter
    itemId: string; // Item ID (ex: "000123")
    name: string; // Object Name
    description?: string; // Object Description
    type: string; // Item Type (ex: "Item", "Part", etc.)
    revisions?: ItemRevision[];
    properties?: Record<string, any>; // Propriedades adicionais
    createdDate?: Date;
    lastModifiedDate?: Date;
    owningUser?: string;
}

/**
 * Modelo de dados para ItemRevision do Teamcenter
 */
export interface ItemRevision {
    id: string; // UID do Teamcenter
    revisionId: string; // Revision ID (ex: "A", "B", "001")
    name: string; // Object Name
    description?: string;
    properties?: Record<string, any>;
    createdDate?: Date;
    lastModifiedDate?: Date;
}

/**
 * DTO para criação de Item
 */
export interface CreateItemDto {
    itemId: string; // Obrigatório
    name: string; // Obrigatório
    description?: string;
    type?: string; // Default: "Item"
    properties?: Record<string, any>;
}

/**
 * DTO para atualização de Item
 */
export interface UpdateItemDto {
    name?: string;
    description?: string;
    properties?: Record<string, any>;
}

/**
 * Propriedade genérica do Teamcenter
 * Formato padrão de propriedades retornadas pela API REST
 */
export interface TeamcenterProperty {
    dbValues: any[]; // Valores do banco de dados
    uiValues: string[]; // Valores formatados para UI
    type: string; // Tipo da propriedade
}

/**
 * Resposta padrão do Teamcenter para operações de Item
 */
export interface TeamcenterItemResponse {
    uid: string;
    type: string;
    properties?: Record<string, TeamcenterProperty>;
    revisions?: TeamcenterItemResponse[];
}
