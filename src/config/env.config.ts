import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

/**
 * Configuração centralizada de variáveis de ambiente
 * NOTA: Todas as configurações são carregadas uma única vez na inicialização
 */
export const EnvConfig = {
    // Configuração do servidor
    server: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
    },

    // Configuração do Teamcenter
    teamcenter: {
        baseURL: process.env.TC_BASE_URL || 'http://localhost:8080',
        timeout: parseInt(process.env.TC_TIMEOUT || '30000', 10),
        // CUIDADO: CREDENCIAIS HARD-CODED - APENAS PARA AMBIENTE DE DESENVOLVIMENTO ISOLADO
        // Em produção, usar um serviço de secrets (AWS Secrets Manager, Azure Key Vault)
        username: process.env.TC_USERNAME,
        password: process.env.TC_PASSWORD,
    },

    // Configuração de autenticação JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-CHANGE-ME-IN-PRODUCTION',
        expiration: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
    },

    // Configuração de logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        dir: process.env.LOG_DIR || './logs',
    },

    // Configuração de CORS
    cors: {
        origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    },

    // Configuração de cache
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    },
};

/**
 * Validação de configurações obrigatórias
 * Lança erro se variáveis críticas não estiverem definidas
 */
export function validateEnvConfig(): void {
    const errors: string[] = [];

    if (!EnvConfig.teamcenter.baseURL) {
        errors.push('TC_BASE_URL não está definida');
    }

    if (!EnvConfig.teamcenter.username) {
        errors.push('TC_USERNAME não está definida');
    }

    if (!EnvConfig.teamcenter.password) {
        errors.push('TC_PASSWORD não está definida');
    }

    if (!EnvConfig.jwt.secret || EnvConfig.jwt.secret === 'default-secret-CHANGE-ME-IN-PRODUCTION') {
        errors.push('JWT_SECRET não está definida ou está usando o valor padrão (INSEGURO!)');
    }

    if (errors.length > 0) {
        throw new Error(
            `Erro de configuração:\n${errors.map((e) => `  - ${e}`).join('\n')}\n\n` +
            'Verifique o arquivo .env e certifique-se de que todas as variáveis obrigatórias estão definidas.'
        );
    }
}
