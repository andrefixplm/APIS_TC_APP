import { ItemRepository } from '../repositories/item.repository';
import { Logger } from '../config/logger.config';
import { Item, CreateItemDto, UpdateItemDto, ItemRevision } from '../models/item.model';

/**
 * Serviço de Items
 * Implementa regras de negócio e validações para operações de Item
 */
export class ItemService {
    private logger = Logger.getInstance();
    private itemRepo: ItemRepository;

    constructor(itemRepo?: ItemRepository) {
        this.itemRepo = itemRepo || new ItemRepository();
    }

    /**
     * Busca um Item por ID com validação
     * @param itemId - ID do Item
     * @returns Item encontrado
     */
    async getItem(itemId: string): Promise<Item> {
        // Validação de entrada
        if (!itemId || itemId.trim() === '') {
            throw new Error('Item ID é obrigatório');
        }

        try {
            const item = await this.itemRepo.getItemById(itemId);
            this.logger.info('Item recuperado com sucesso', { itemId });
            return item;
        } catch (error) {
            this.logger.error('Erro ao buscar Item', {
                itemId,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Item ${itemId} não encontrado`);
        }
    }

    /**
     * Busca um Item por UID
     * @param uid - UID do Item
     * @returns Item encontrado
     */
    async getItemByUid(uid: string): Promise<Item> {
        if (!uid || uid.trim() === '') {
            throw new Error('UID é obrigatório');
        }

        try {
            const item = await this.itemRepo.getItemByUid(uid);
            this.logger.info('Item recuperado por UID com sucesso', { uid });
            return item;
        } catch (error) {
            this.logger.error('Erro ao buscar Item por UID', {
                uid,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Item com UID ${uid} não encontrado`);
        }
    }

    /**
     * Cria um novo Item com validação de dados
     * @param itemData - Dados do Item
     * @returns Item criado
     */
    async createItem(itemData: CreateItemDto): Promise<Item> {
        // Validação de regras de negócio
        this.validateCreateItemData(itemData);

        try {
            const newItem = await this.itemRepo.createItem(itemData);
            this.logger.info('Item criado com sucesso', {
                itemId: newItem.itemId,
                uid: newItem.id,
            });
            return newItem;
        } catch (error) {
            this.logger.error('Erro ao criar Item', {
                itemData,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha ao criar Item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Atualiza um Item existente
     * @param itemId - ID do Item
     * @param updates - Dados a serem atualizados
     * @returns Item atualizado
     */
    async updateItem(itemId: string, updates: UpdateItemDto): Promise<Item> {
        // Validação de entrada
        if (!itemId || itemId.trim() === '') {
            throw new Error('Item ID é obrigatório');
        }

        if (Object.keys(updates).length === 0) {
            throw new Error('Nenhum dado para atualizar');
        }

        try {
            // Verificar se Item existe
            await this.getItem(itemId);

            const updatedItem = await this.itemRepo.updateItem(itemId, updates);
            this.logger.info('Item atualizado com sucesso', { itemId });
            return updatedItem;
        } catch (error) {
            this.logger.error('Erro ao atualizar Item', {
                itemId,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw error;
        }
    }

    /**
     * Deleta um Item
     * @param itemId - ID do Item
     */
    async deleteItem(itemId: string): Promise<void> {
        if (!itemId || itemId.trim() === '') {
            throw new Error('Item ID é obrigatório');
        }

        try {
            // Verificar se Item existe antes de deletar
            await this.getItem(itemId);

            await this.itemRepo.deleteItem(itemId);
            this.logger.info('Item deletado com sucesso', { itemId });
        } catch (error) {
            this.logger.error('Erro ao deletar Item', {
                itemId,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw error;
        }
    }

    /**
     * Busca todas as revisões de um Item
     * @param itemId - ID do Item
     * @returns Lista de revisões
     */
    async getItemRevisions(itemId: string): Promise<ItemRevision[]> {
        if (!itemId || itemId.trim() === '') {
            throw new Error('Item ID é obrigatório');
        }

        try {
            const revisions = await this.itemRepo.getItemRevisions(itemId);
            this.logger.info('Revisões recuperadas com sucesso', {
                itemId,
                count: revisions.length,
            });
            return revisions;
        } catch (error) {
            this.logger.error('Erro ao buscar revisões', {
                itemId,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha ao buscar revisões do Item ${itemId}`);
        }
    }

    /**
     * Valida dados de criação de Item
     */
    private validateCreateItemData(itemData: CreateItemDto): void {
        const errors: string[] = [];

        if (!itemData.itemId || itemData.itemId.trim() === '') {
            errors.push('Item ID é obrigatório');
        }

        if (!itemData.name || itemData.name.trim() === '') {
            errors.push('Nome do Item é obrigatório');
        }

        // Validação de formato de Item ID (exemplo: apenas alfanuméricos e hífens)
        if (itemData.itemId && !/^[a-zA-Z0-9-_]+$/.test(itemData.itemId)) {
            errors.push('Item ID deve conter apenas letras, números, hífens e underscores');
        }

        if (errors.length > 0) {
            throw new Error(`Dados inválidos:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
        }
    }
}
