import { ItemService } from '../../../src/services/item.service';
import { ItemRepository } from '../../../src/repositories/item.repository';
import { CreateItemDto } from '../../../src/models/item.model';

/**
 * Exemplo de teste unitário para ItemService
 * Demonstra como mockar o repositório para testar a lógica de negócio
 */
describe('ItemService', () => {
    let itemService: ItemService;
    let mockItemRepo: jest.Mocked<ItemRepository>;

    beforeEach(() => {
        // Criar mock do repositório
        mockItemRepo = {
            getItemById: jest.fn(),
            createItem: jest.fn(),
            updateItem: jest.fn(),
            deleteItem: jest.fn(),
        } as any;

        // Injetar mock no serviço
        itemService = new ItemService(mockItemRepo);
    });

    describe('getItem', () => {
        it('deve retornar um Item quando ID é válido', async () => {
            // Arrange
            const mockItem = {
                id: 'abc123',
                itemId: '000123',
                name: 'Test Item',
                type: 'Item',
            };
            mockItemRepo.getItemById.mockResolvedValue(mockItem as any);

            // Act
            const result = await itemService.getItem('000123');

            // Assert
            expect(result).toEqual(mockItem);
            expect(mockItemRepo.getItemById).toHaveBeenCalledWith('000123');
        });

        it('deve lançar erro quando Item ID está vazio', async () => {
            // Act & Assert
            await expect(itemService.getItem('')).rejects.toThrow('Item ID é obrigatório');
        });
    });

    describe('createItem', () => {
        it('deve criar um Item com dados válidos', async () => {
            // Arrange
            const itemData: CreateItemDto = {
                itemId: 'TEST-001',
                name: 'Test Item',
                description: 'Test description',
            };

            const mockCreatedItem = {
                id: 'xyz789',
                ...itemData,
                type: 'Item',
            };

            mockItemRepo.createItem.mockResolvedValue(mockCreatedItem as any);

            // Act
            const result = await itemService.createItem(itemData);

            // Assert
            expect(result).toEqual(mockCreatedItem);
            expect(mockItemRepo.createItem).toHaveBeenCalledWith(itemData);
        });

        it('deve lançar erro quando Item ID contém caracteres inválidos', async () => {
            // Arrange
            const invalidItemData: CreateItemDto = {
                itemId: 'TEST@001', // @ não é permitido
                name: 'Test Item',
            };

            // Act & Assert
            await expect(itemService.createItem(invalidItemData)).rejects.toThrow(
                'Item ID deve conter apenas letras, números, hífens e underscores'
            );
        });
    });
});
