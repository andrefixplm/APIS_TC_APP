/**
 * Credenciais de login do usuário
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * Dados do usuário autenticado
 */
export interface User {
    username: string;
    userId?: string;
    groupId?: string;
    role?: string;
}

/**
 * Token de autenticação JWT
 */
export interface AuthToken {
    token: string; // JWT token
    expiresIn: number; // Tempo de expiração em segundos
    tokenType: string; // Tipo do token (ex: "Bearer")
}

/**
 * Payload do JWT (dados armazenados no token)
 */
export interface JwtPayload {
    username: string;
    tcToken: string; // Token de sessão do Teamcenter
    iat?: number; // Issued at (timestamp)
    exp?: number; // Expiration (timestamp)
}

/**
 * Resposta de login
 */
export interface LoginResponse {
    success: boolean;
    user: User;
    auth: AuthToken;
}

/**
 * Resposta de autenticação do Teamcenter
 */
export interface TeamcenterAuthResponse {
    sessionId: string; // Token de sessão do Teamcenter
    user?: {
        uid: string;
        userId: string;
        userName: string;
        groupId?: string;
        groupName?: string;
        role?: string;
    };
}
