import jwt from 'jsonwebtoken';
import { TeamcenterRepository } from '../repositories/teamcenter.repository';
import { EnvConfig } from '../config/env.config';
import { Logger } from '../config/logger.config';
import {
    LoginCredentials,
    User,
    AuthToken,
    JwtPayload,
    LoginResponse,
} from '../models/auth.model';

/**
 * Serviço de autenticação
 * Gerencia login, logout e validação de tokens JWT
 */
export class AuthService {
    private logger = Logger.getInstance();
    private teamcenterRepo: TeamcenterRepository;

    constructor(teamcenterRepo?: TeamcenterRepository) {
        this.teamcenterRepo = teamcenterRepo || new TeamcenterRepository();
    }

    /**
     * Realiza login no Teamcenter e gera JWT
     * @param credentials - Credenciais do usuário
     * @returns Resposta de login com JWT
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        // Validação de entrada
        if (!credentials.username || !credentials.password) {
            throw new Error('Username e password são obrigatórios');
        }

        try {
            // Autenticar no Teamcenter
            const tcAuthResponse = await this.teamcenterRepo.authenticate(
                credentials.username,
                credentials.password
            );

            // Criar usuário
            const user: User = {
                username: credentials.username,
                userId: tcAuthResponse.user?.userId,
                groupId: tcAuthResponse.user?.groupId,
                role: tcAuthResponse.user?.role,
            };

            // Gerar JWT contendo o token do Teamcenter
            const authToken = this.generateJwtToken(credentials.username, tcAuthResponse.sessionId);

            this.logger.info('Login bem-sucedido', { username: credentials.username });

            return {
                success: true,
                user,
                auth: authToken,
            };
        } catch (error) {
            this.logger.error('Falha no login', {
                username: credentials.username,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error('Falha na autenticação. Verifique suas credenciais.');
        }
    }

    /**
     * Realiza logout (encerra sessão do Teamcenter)
     * @param tcToken - Token de sessão do Teamcenter
     */
    async logout(tcToken: string): Promise<void> {
        try {
            // Configurar token e fazer logout
            this.teamcenterRepo.setAuthToken(tcToken);
            await this.teamcenterRepo.logout();
            this.logger.info('Logout bem-sucedido');
        } catch (error) {
            this.logger.error('Erro ao fazer logout', {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            // Não lançar erro, pois logout pode falhar se sessão já expirou
        }
    }

    /**
     * Valida um token JWT
     * @param token - Token JWT
     * @returns Payload do token se válido
     */
    validateToken(token: string): JwtPayload {
        try {
            const decoded = jwt.verify(token, EnvConfig.jwt.secret) as JwtPayload;
            return decoded;
        } catch (error) {
            this.logger.warn('Token JWT inválido', {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error('Token inválido ou expirado');
        }
    }

    /**
     * Renova um token JWT (gera novo token com mesmo payload)
     * @param oldToken - Token antigo
     * @returns Novo token
     */
    refreshToken(oldToken: string): AuthToken {
        const payload = this.validateToken(oldToken);
        return this.generateJwtToken(payload.username, payload.tcToken);
    }

    /**
     * Gera um token JWT
     * @param username - Nome do usuário
     * @param tcToken - Token de sessão do Teamcenter
     * @returns Token JWT
     */
    private generateJwtToken(username: string, tcToken: string): AuthToken {
        const payload: JwtPayload = {
            username,
            tcToken,
        };

        const token = jwt.sign(payload, EnvConfig.jwt.secret, {
            expiresIn: EnvConfig.jwt.expiration,
        });

        return {
            token,
            expiresIn: EnvConfig.jwt.expiration,
            tokenType: 'Bearer',
        };
    }
}
