import { Request, Response, NextFunction } from 'express';
import { Logger } from '../config/logger.config';
import { EnvConfig } from '../config/env.config';

/**
 * Middleware de tratamento global de erros
 * Captura todos os erros lançados nas rotas e retorna resposta padronizada
 */
export function errorMiddleware(
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    const logger = Logger.getInstance();

    // Log do erro
    logger.error('Erro na requisição', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        body: req.body,
    });

    // Determinar código de status HTTP baseado na mensagem de erro
    let statusCode = 500;
    let errorMessage = error.message;

    // Mapeamento de erros comuns
    if (error.message.includes('não encontrado') || error.message.includes('não existe')) {
        statusCode = 404;
    } else if (
        error.message.includes('obrigatório') ||
        error.message.includes('inválido') ||
        error.message.includes('Dados inválidos')
    ) {
        statusCode = 400;
    } else if (error.message.includes('Token') || error.message.includes('autenticação')) {
        statusCode = 401;
    } else if (error.message.includes('Permissão negada')) {
        statusCode = 403;
    } else if (error.message.includes('Timeout') || error.message.includes('indisponível')) {
        statusCode = 503;
    }

    // Resposta de erro padronizada
    const errorResponse: any = {
        success: false,
        error: {
            message: errorMessage,
            statusCode,
        },
    };

    // Incluir stack trace apenas em desenvolvimento
    if (EnvConfig.server.nodeEnv === 'development') {
        errorResponse.error.stack = error.stack;
    }

    res.status(statusCode).json(errorResponse);
}
