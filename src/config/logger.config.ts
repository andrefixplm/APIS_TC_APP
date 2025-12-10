import winston from 'winston';
import { EnvConfig } from './env.config';
import path from 'path';
import fs from 'fs';

/**
 * Logger Singleton usando Winston
 * 
 * CONFIGURAÇÃO DE LOGGING:
 * - DESENVOLVIMENTO (LOG_LEVEL=debug): Loga TUDO, incluindo payloads completos de request/response
 * - PRODUÇÃO (LOG_LEVEL=info ou warn): Loga apenas informações essenciais, sem dados sensíveis
 * 
 * CUIDADO: NUNCA use LOG_LEVEL=debug em produção, pois isso pode expor:
 * - Credenciais do Teamcenter
 * - Dados PLM sensíveis
 * - Tokens de autenticação
 */
export class Logger {
    private static instance: winston.Logger;

    /**
     * Retorna a instância singleton do logger
     */
    static getInstance(): winston.Logger {
        if (!Logger.instance) {
            Logger.instance = Logger.createLogger();
        }
        return Logger.instance;
    }

    /**
     * Cria e configura o logger Winston
     */
    private static createLogger(): winston.Logger {
        // Criar diretório de logs se não existir
        if (EnvConfig.logging.dir && !fs.existsSync(EnvConfig.logging.dir)) {
            fs.mkdirSync(EnvConfig.logging.dir, { recursive: true });
        }

        // Formato customizado para console (colorido e legível)
        const consoleFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                let metaStr = '';
                if (Object.keys(meta).length > 0) {
                    metaStr = '\n' + JSON.stringify(meta, null, 2);
                }
                return `[${timestamp}] ${level}: ${message}${metaStr}`;
            })
        );

        // Formato para arquivo (JSON estruturado)
        const fileFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
        );

        // Configurar transports (console + arquivo)
        const transports: winston.transport[] = [
            // Console (sempre ativo)
            new winston.transports.Console({
                format: consoleFormat,
            }),
        ];

        // Adicionar transports de arquivo apenas se diretório estiver configurado
        if (EnvConfig.logging.dir) {
            // Arquivo de erro (apenas erros)
            transports.push(
                new winston.transports.File({
                    filename: path.join(EnvConfig.logging.dir, 'error.log'),
                    level: 'error',
                    format: fileFormat,
                })
            );

            // Arquivo combinado (todos os níveis)
            transports.push(
                new winston.transports.File({
                    filename: path.join(EnvConfig.logging.dir, 'combined.log'),
                    format: fileFormat,
                })
            );
        }

        return winston.createLogger({
            level: EnvConfig.logging.level,
            transports,
            // Não sair do processo em caso de erro de logging
            exitOnError: false,
        });
    }

    /**
     * Log de requisição HTTP (middleware)
     */
    static logRequest(method: string, path: string, statusCode?: number, duration?: number): void {
        const logger = Logger.getInstance();
        const message = `${method} ${path}`;

        if (statusCode && duration) {
            logger.info(message, {
                statusCode,
                duration: `${duration}ms`,
            });
        } else {
            logger.info(message);
        }
    }

    /**
     * Log de chamada ao Teamcenter (com payload completo em DEBUG)
     */
    static logTeamcenterRequest(endpoint: string, method: string, payload?: any): void {
        const logger = Logger.getInstance();

        if (EnvConfig.logging.level === 'debug') {
            // CUIDADO: Loga payload completo apenas em DEBUG
            logger.debug(`Teamcenter Request: ${method} ${endpoint}`, {
                payload: payload || 'No payload',
            });
        } else {
            logger.info(`Teamcenter Request: ${method} ${endpoint}`);
        }
    }

    /**
     * Log de resposta do Teamcenter (com dados completos em DEBUG)
     */
    static logTeamcenterResponse(endpoint: string, statusCode: number, data?: any): void {
        const logger = Logger.getInstance();

        if (EnvConfig.logging.level === 'debug') {
            // CUIDADO: Loga dados completos apenas em DEBUG
            logger.debug(`Teamcenter Response: ${endpoint} [${statusCode}]`, {
                data: data || 'No data',
            });
        } else {
            logger.info(`Teamcenter Response: ${endpoint} [${statusCode}]`);
        }
    }
}
