import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Cria um middleware de validação de schema usando Joi
 * @param schema - Schema Joi para validação
 * @param property - Propriedade do request a ser validada (body, query, params)
 * @returns Middleware de validação
 */
export function validateSchema(
    schema: Joi.ObjectSchema,
    property: 'body' | 'query' | 'params' = 'body'
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Retornar todos os erros, não apenas o primeiro
            stripUnknown: true, // Remover propriedades não definidas no schema
        });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            res.status(400).json({
                success: false,
                error: {
                    message: 'Dados de entrada inválidos',
                    details: errorMessages,
                },
            });
            return;
        }

        // Substituir o valor original pelo valor validado (com defaults aplicados)
        req[property] = value;
        next();
    };
}

/**
 * Schemas de validação comuns
 */
export const ValidationSchemas = {
    // Schema para login
    login: Joi.object({
        username: Joi.string().required().min(3).max(50).messages({
            'string.empty': 'Username é obrigatório',
            'string.min': 'Username deve ter no mínimo 3 caracteres',
            'string.max': 'Username deve ter no máximo 50 caracteres',
        }),
        password: Joi.string().required().min(6).messages({
            'string.empty': 'Password é obrigatório',
            'string.min': 'Password deve ter no mínimo 6 caracteres',
        }),
    }),

    // Schema para criação de Item
    createItem: Joi.object({
        itemId: Joi.string()
            .required()
            .pattern(/^[a-zA-Z0-9-_]+$/)
            .messages({
                'string.empty': 'Item ID é obrigatório',
                'string.pattern.base': 'Item ID deve conter apenas letras, números, hífens e underscores',
            }),
        name: Joi.string().required().min(1).max(255).messages({
            'string.empty': 'Nome é obrigatório',
            'string.max': 'Nome deve ter no máximo 255 caracteres',
        }),
        description: Joi.string().optional().max(1000).allow(''),
        type: Joi.string().optional().default('Item'),
        properties: Joi.object().optional(),
    }),

    // Schema para atualização de Item
    updateItem: Joi.object({
        name: Joi.string().optional().min(1).max(255),
        description: Joi.string().optional().max(1000).allow(''),
        properties: Joi.object().optional(),
    }).min(1), // Pelo menos uma propriedade deve ser fornecida

    // Schema para busca
    search: Joi.object({
        query: Joi.string().required().min(1).messages({
            'string.empty': 'Query de busca é obrigatória',
        }),
        type: Joi.string().optional(),
        maxResults: Joi.number().optional().min(1).max(1000).default(50),
        properties: Joi.array().items(Joi.string()).optional(),
    }),
};
