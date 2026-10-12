import type { FastifyPluginAsync } from 'fastify';
import { authService } from './auth.service.js';
import { loginSchema, registerTenantSchema } from './auth.schemas.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Login
  fastify.post('/login', async (request, reply) => {
    const parse = loginSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validação falhou',
        details: parse.error.format(),
      });
    }

    try {
      const user = await authService.login(parse.data);
      const token = fastify.jwt.sign(
        {
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
        },
        { expiresIn: '15m' }
      );

      const refreshToken = fastify.jwt.sign(
        {
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
          type: 'refresh',
        },
        { expiresIn: '7d' }
      );

      reply.setCookie('refresh_token', refreshToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return reply.send({
        token,
        user,
      });
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  });

  // Cadastro de nova loja (Onboarding)
  fastify.post('/register', async (request, reply) => {
    const parse = registerTenantSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validação falhou',
        details: parse.error.format(),
      });
    }

    try {
      const user = await authService.registerTenant(parse.data);
      const token = fastify.jwt.sign(
        {
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
        },
        { expiresIn: '15m' }
      );

      return reply.status(201).send({
        token,
        user,
      });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Obter dados do usuário logado
  fastify.get('/me', async (request, reply) => {
    try {
      await request.jwtVerify();
      const decoded = request.user as { userId: string; tenantId: string; role: string };
      return reply.send({ user: decoded });
    } catch (err) {
      return reply.status(401).send({ error: 'Não autorizado ou token expirado' });
    }
  });

  // Logout
  fastify.post('/logout', async (_request, reply) => {
    reply.clearCookie('refresh_token', { path: '/' });
    return reply.send({ message: 'Logout realizado com sucesso' });
  });
};
