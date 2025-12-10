import { TeamcenterRepository } from './teamcenter.repository';
import {
    Item,
    ItemRevision,
    CreateItemDto,
    UpdateItemDto,
    TeamcenterItemResponse,
    TeamcenterProperty,
} from '../models/item.model';

/**
 * Repositório para operações CRUD de Items no Teamcenter
 * Herda de TeamcenterRepository para reutilizar cliente HTTP e autenticação
 */
export class ItemRepository extends TeamcenterRepository {
    /**
     * Busca um Item por ID
     * @param itemId - ID do Item (ex: "000123")
     * @returns Item encontrado
     */
    async getItemById(itemId: string): Promise<Item> {
        const endpoint = `${this.config.endpoints.items}/${itemId}`;
        const response = await this.get<TeamcenterItemResponse>(endpoint);
        return this.mapTeamcenterItemToModel(response);
    }

    /**
     * Busca um Item por UID (identificador único do Teamcenter)
     * @param uid - UID do Item
     * @returns Item encontrado
     */
    async getItemByUid(uid: string): Promise<Item> {
        const endpoint = `${this.config.endpoints.items}?uid=${uid}`;
        const response = await this.get<TeamcenterItemResponse>(endpoint);
        return this.mapTeamcenterItemToModel(response);
    }

    /**
     * Cria um novo Item no Teamcenter
     * @param itemData - Dados do Item a ser criado
     * @returns Item criado
     */
    async createItem(itemData: CreateItemDto): Promise<Item> {
        const endpoint = this.config.endpoints.items;
        const payload = this.mapModelToTeamcenterPayload(itemData);

        const response = await this.post<TeamcenterItemResponse>(endpoint, payload);
        return this.mapTeamcenterItemToModel(response);
    }

    /**
     * Atualiza propriedades de um Item existente
     * @param itemId - ID do Item
     * @param updates - Propriedades a serem atualizadas
     * @returns Item atualizado
     */
    async updateItem(itemId: string, updates: UpdateItemDto): Promise<Item> {
        const endpoint = `${this.config.endpoints.items}/${itemId}`;
        const payload = this.mapUpdateToTeamcenterPayload(updates);

        const response = await this.put<TeamcenterItemResponse>(endpoint, payload);
        return this.mapTeamcenterItemToModel(response);
    }

    /**
     * Deleta um Item do Teamcenter
     * @param itemId - ID do Item
     */
    async deleteItem(itemId: string): Promise<void> {
        const endpoint = `${this.config.endpoints.items}/${itemId}`;
        await this.delete(endpoint);
        this.logger.info(`Item ${itemId} deletado com sucesso`);
    }

    /**
     * Busca todas as revisões de um Item
     * @param itemId - ID do Item
     * @returns Lista de revisões
     */
    async getItemRevisions(itemId: string): Promise<ItemRevision[]> {
        const endpoint = `${this.config.endpoints.items}/${itemId}/revisions`;
        const response = await this.get<TeamcenterItemResponse[]>(endpoint);
        return response.map(this.mapTeamcenterRevisionToModel);
    }

    /**
     * Mapeia resposta Teamcenter para modelo interno de Item
     * NOTA: Esta função abstrai a complexidade dos payloads Teamcenter
     */
    private mapTeamcenterItemToModel(tcData: TeamcenterItemResponse): Item {
        return {
            id: tcData.uid,
            itemId: this.extractPropertyValue(tcData.properties, 'item_id') || '',
            name: this.extractPropertyValue(tcData.properties, 'object_name') || '',
            description: this.extractPropertyValue(tcData.properties, 'object_desc'),
            type: tcData.type,
            revisions: tcData.revisions?.map((rev) => this.mapTeamcenterRevisionToModel(rev)) || [],
            properties: this.extractAllProperties(tcData.properties),
            createdDate: this.extractDateProperty(tcData.properties, 'creation_date'),
            lastModifiedDate: this.extractDateProperty(tcData.properties, 'last_mod_date'),
            owningUser: this.extractPropertyValue(tcData.properties, 'owning_user'),
        };
    }

    /**
     * Mapeia resposta Teamcenter para modelo interno de ItemRevision
     */
    private mapTeamcenterRevisionToModel(tcRevision: TeamcenterItemResponse): ItemRevision {
        return {
            id: tcRevision.uid,
            revisionId: this.extractPropertyValue(tcRevision.properties, 'item_revision_id') || '',
            name: this.extractPropertyValue(tcRevision.properties, 'object_name') || '',
            description: this.extractPropertyValue(tcRevision.properties, 'object_desc'),
            properties: this.extractAllProperties(tcRevision.properties),
            createdDate: this.extractDateProperty(tcRevision.properties, 'creation_date'),
            lastModifiedDate: this.extractDateProperty(tcRevision.properties, 'last_mod_date'),
        };
    }

    /**
     * Mapeia modelo interno para payload de criação do Teamcenter
     */
    private mapModelToTeamcenterPayload(item: CreateItemDto): any {
        return {
            item_id: item.itemId,
            object_name: item.name,
            object_desc: item.description || '',
            item_type: item.type || 'Item',
            ...item.properties,
        };
    }

    /**
     * Mapeia modelo de atualização para payload do Teamcenter
     */
    private mapUpdateToTeamcenterPayload(updates: UpdateItemDto): any {
        const payload: any = {};

        if (updates.name) payload.object_name = updates.name;
        if (updates.description) payload.object_desc = updates.description;
        if (updates.properties) Object.assign(payload, updates.properties);

        return payload;
    }

    /**
     * Extrai valor de uma propriedade Teamcenter
     * Propriedades do TC têm formato: { dbValues: [...], uiValues: [...] }
     */
    private extractPropertyValue(
        properties: Record<string, TeamcenterProperty> | undefined,
        propertyName: string
    ): string | undefined {
        if (!properties || !properties[propertyName]) return undefined;

        const prop = properties[propertyName];
        return prop.dbValues && prop.dbValues.length > 0 ? prop.dbValues[0] : undefined;
    }

    /**
     * Extrai propriedade de data
     */
    private extractDateProperty(
        properties: Record<string, TeamcenterProperty> | undefined,
        propertyName: string
    ): Date | undefined {
        const value = this.extractPropertyValue(properties, propertyName);
        return value ? new Date(value) : undefined;
    }

    /**
     * Extrai todas as propriedades em formato simplificado
     */
    private extractAllProperties(
        properties: Record<string, TeamcenterProperty> | undefined
    ): Record<string, any> {
        if (!properties) return {};

        const simplified: Record<string, any> = {};
        for (const [key, value] of Object.entries(properties)) {
            simplified[key] = value.dbValues && value.dbValues.length > 0 ? value.dbValues[0] : null;
        }
        return simplified;
    }
}
