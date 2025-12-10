import { createApp } from './app';
import { EnvConfig, validateEnvConfig } from './config/env.config';
import { Logger } from './config/logger.config';

/**
 * Inicialização do servidor HTTP
 */
async function startServer(): Promise<void> {
    const logger = Logger.getInstance();

    try {
        // Validar configurações de ambiente
        logger.info('Validando configurações de ambiente...');
        validateEnvConfig();

        // Criar aplicação Express
        const app = createApp();

        // Iniciar servidor HTTP
        const port = EnvConfig.server.port;
        const host = EnvConfig.server.host;

        const server = app.listen(port, host, () => {
            logger.info('='.repeat(60));
            logger.info('🚀 TEAMCENTER GATEWAY INICIADO COM SUCESSO');
            logger.info('='.repeat(60));
            logger.info(`Ambiente: ${EnvConfig.server.nodeEnv}`);
            logger.info(`Servidor: http://${host}:${port}`);
            logger.info(`Teamcenter URL: ${EnvConfig.teamcenter.baseURL}`);
            logger.info(`Nível de Log: ${EnvConfig.logging.level}`);
            logger.info('='.repeat(60));
            logger.info('Endpoints disponíveis:');
            logger.info(`  - Health Check: http://${host}:${port}/api/health`);
            logger.info(`  - Auth: http://${host}:${port}/api/auth`);
            logger.info(`  - Items: http://${host}:${port}/api/items`);
            logger.info(`  - Search: http://${host}:${port}/api/search`);
            logger.info('='.repeat(60));

            if (EnvConfig.logging.level === 'debug') {
                logger.warn('⚠️  ATENÇÃO: Logging em modo DEBUG (payloads completos)');
                logger.warn('⚠️  NUNCA use este modo em produção!');
                logger.warn('⚠️  Para produção, altere LOG_LEVEL para "info" ou "warn" no .env');
            }
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`Sinal ${signal} recebido. Encerrando servidor...`);

            server.close(() => {
                logger.info('Servidor HTTP encerrado');
                process.exit(0);
            });

            // Forçar encerramento após 10 segundos
            setTimeout(() => {
                logger.error('Forçando encerramento após timeout');
                process.exit(1);
            }, 10000);
        };

        // Capturar sinais de encerramento
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Capturar erros não tratados
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection', { reason, promise });
        });

        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
            process.exit(1);
        });
    } catch (error) {
        logger.error('Erro ao iniciar servidor', {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
        process.exit(1);
    }
}

// Iniciar servidor
startServer();
