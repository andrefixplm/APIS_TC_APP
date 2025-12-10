import request from 'supertest';
import { createApp } from '../../../src/app';
import { Application } from 'express';

/**
 * Exemplo de teste de integração para rotas de Items
 * Testa o fluxo completo HTTP → Controller → Service → Repository
 * 
 * NOTA: Estes testes requerem um servidor Teamcenter rodando ou um mock da API
 */
describe('Items Routes Integration Tests', () => {
    let app: Application;
    let authToken: string;

    beforeAll(async () => {
        app = createApp();

        // Fazer login para obter token (assumindo que Teamcenter está disponível)
        // Em ambiente de teste, você pode mockar a autenticação
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: process.env.TC_USERNAME || 'test_user',
                password: process.env.TC_PASSWORD || 'test_password',
            });

        authToken = loginResponse.body.auth?.token;
    });

    describe('GET /api/items/:id', () => {
        it('deve retornar 401 sem token de autenticação', async () => {
            const response = await request(app).get('/api/items/000123');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('deve retornar um Item quando autenticado', async () => {
            // Pular teste se não houver token (Teamcenter não disponível)
            if (!authToken) {
                console.log('Pulando teste: Teamcenter não disponível');
                return;
            }

            const response = await request(app)
                .get('/api/items/000123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('itemId');
        });
    });

    describe('POST /api/items', () => {
        it('deve retornar 400 com dados inválidos', async () => {
            if (!authToken) return;

            const response = await request(app)
                .post('/api/items')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    // itemId faltando (obrigatório)
                    name: 'Test Item',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});
