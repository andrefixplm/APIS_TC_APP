import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { teamcenterConfig, TeamcenterConfig } from '../config/teamcenter.config';
import { Logger } from '../config/logger.config';
import { TeamcenterAuthResponse } from '../models/auth.model';

/**
 * Repositório base para comunicação com o Teamcenter
 * Implementa cliente HTTP com interceptors para logging e tratamento de erros
 * 
 * PADRÃO: Repository Pattern
 * - Abstrai a complexidade das chamadas HTTP ao Teamcenter
 * - Centraliza tratamento de erros e autenticação
 * - Facilita testes (mock do httpClient)
 */
export class TeamcenterRepository {
    protected httpClient: AxiosInstance;
    protected logger = Logger.getInstance();
    protected config: TeamcenterConfig;

    constructor(config: TeamcenterConfig = teamcenterConfig) {
        this.config = config;
        this.httpClient = this.createHttpClient();
        this.setupInterceptors();
    }

    /**
     * Cria e configura o cliente HTTP (Axios)
     */
    private createHttpClient(): AxiosInstance {
        return axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Configura interceptors para logging e tratamento de erros
     */
    private setupInterceptors(): void {
        // Interceptor de REQUEST (log antes de enviar)
        this.httpClient.interceptors.request.use(
            (config) => {
                Logger.logTeamcenterRequest(
                    config.url || '',
                    config.method?.toUpperCase() || 'GET',
                    config.data
                );
                return config;
            },
            (error) => {
                this.logger.error('Erro ao preparar requisição Teamcenter', { error: error.message });
                return Promise.reject(error);
            }
        );

        // Interceptor de RESPONSE (log após receber)
        this.httpClient.interceptors.response.use(
            (response) => {
                Logger.logTeamcenterResponse(
                    response.config.url || '',
                    response.status,
                    response.data
                );
                return response;
            },
            (error: AxiosError) => {
                this.logger.error('Erro na resposta do Teamcenter', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                });
                return Promise.reject(this.handleTeamcenterError(error));
            }
        );
    }

    /**
     * Autenticação no Teamcenter REST API
     * @param username - Nome de usuário
     * @param password - Senha
     * @returns Token de sessão do Teamcenter
     */
    async authenticate(username: string, password: string): Promise<TeamcenterAuthResponse> {
        try {
            const response = await this.httpClient.post<TeamcenterAuthResponse>(
                this.config.endpoints.sessions,
                {
                    credentials: {
                        username,
                        password,
                    },
                }
            );

            const sessionId = response.data.sessionId;
            this.setAuthToken(sessionId);

            this.logger.info('Autenticação no Teamcenter bem-sucedida', { username });
            return response.data;
        } catch (error) {
            this.logger.error('Falha na autenticação Teamcenter', {
                username,
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            throw new Error(`Falha na autenticação Teamcenter: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    /**
     * Define o token de autenticação para requisições subsequentes
     * @param token - Token de sessão do Teamcenter
     */
    setAuthToken(token: string): void {
        this.httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.logger.debug('Token de autenticação Teamcenter configurado');
    }

    /**
     * Remove o token de autenticação
     */
    clearAuthToken(): void {
        delete this.httpClient.defaults.headers.common['Authorization'];
        this.logger.debug('Token de autenticação Teamcenter removido');
    }

    /**
     * Logout do Teamcenter (encerra sessão)
     */
    async logout(): Promise<void> {
        try {
            await this.httpClient.delete(this.config.endpoints.sessions);
            this.clearAuthToken();
            this.logger.info('Logout do Teamcenter bem-sucedido');
        } catch (error) {
            this.logger.error('Erro ao fazer logout do Teamcenter', {
                error: error instanceof Error ? error.message : 'Erro desconhecido',
            });
            // Mesmo com erro, limpar o token localmente
            this.clearAuthToken();
        }
    }

    /**
     * Método genérico para chamadas GET
     */
    protected async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.httpClient.get<T>(endpoint, config);
        return response.data;
    }

    /**
     * Método genérico para chamadas POST
     */
    protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.httpClient.post<T>(endpoint, data, config);
        return response.data;
    }

    /**
     * Método genérico para chamadas PUT
     */
    protected async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.httpClient.put<T>(endpoint, data, config);
        return response.data;
    }

    /**
     * Método genérico para chamadas DELETE
     */
    protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.httpClient.delete<T>(endpoint, config);
        return response.data;
    }

    /**
     * Tratamento de erros específicos do Teamcenter
     * Mapeia erros HTTP para mensagens amigáveis em PT-BR
     */
    private handleTeamcenterError(error: AxiosError): Error {
        if (error.response) {
            const status = error.response.status;
            const message = (error.response.data as any)?.message || 'Erro desconhecido';

            switch (status) {
                case 401:
                    return new Error('Token expirado ou inválido. Faça login novamente.');
                case 403:
                    return new Error('Permissão negada no Teamcenter. Verifique suas credenciais.');
                case 404:
                    return new Error('Recurso não encontrado no Teamcenter.');
                case 500:
                    return new Error(`Erro interno do Teamcenter: ${message}`);
                case 503:
                    return new Error('Teamcenter indisponível. Tente novamente mais tarde.');
                default:
                    return new Error(`Erro Teamcenter (${status}): ${message}`);
            }
        }

        if (error.code === 'ECONNABORTED') {
            return new Error('Timeout na conexão com o Teamcenter. Verifique a rede.');
        }

        if (error.code === 'ECONNREFUSED') {
            return new Error('Conexão recusada pelo Teamcenter. Verifique a URL e porta.');
        }

        return new Error(`Erro de rede: ${error.message}`);
    }
}
