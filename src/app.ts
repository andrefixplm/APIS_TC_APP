import express, { Application } from 'express';
import cors from 'cors';
import { EnvConfig } from './config/env.config';
import { Logger } from './config/logger.config';
import { loggingMiddleware } from './middleware/logging.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { createRoutes } from './routes';

/**
 * Cria e configura a aplicação Express
 */
export function createApp(): Application {
    const app = express();
    const logger = Logger.getInstance();

    // ============================================
    // MIDDLEWARES GLOBAIS
    // ============================================

    // CORS - Permitir requisições de origens específicas
    app.use(
        cors({
            origin: EnvConfig.cors.origins,
            credentials: true,
        })
    );

    // Parser de JSON
    app.use(express.json());

    // Parser de URL-encoded
    app.use(express.urlencoded({ extended: true }));

    // Middleware de logging de requisições
    app.use(loggingMiddleware);

    // ============================================
    // ROTAS DA API
    // ============================================

    // Prefixo /api para todas as rotas
    app.use('/api', createRoutes());

    // Rota raiz
    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Teamcenter Gateway API',
            version: '1.0.0',
            endpoints: {
                health: '/api/health',
                auth: '/api/auth',
                items: '/api/items',
                search: '/api/search',
            },
        });
    });

    // ============================================
    // MIDDLEWARE DE ERRO (DEVE SER O ÚLTIMO)
    // ============================================

    app.use(errorMiddleware);

    logger.info('Aplicação Express configurada com sucesso');

    return app;
}
