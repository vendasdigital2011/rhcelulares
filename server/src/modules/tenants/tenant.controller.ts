import type { FastifyPluginAsync } from 'fastify';
import { tenantService } from './tenant.service.js';
import { updateWabaSchema, updateCardFeesSchema } from './tenant.schemas.js';

export const tenantRoutes: FastifyPluginAsync = async (fastify) => {
  // Middleware de autenticação obrigatório para rotas do tenant
  fastify.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: 'Token JWT ausente ou inválido.' });
    }
  });

  // Obter configurações do Tenant
  fastify.get('/settings', async (request, reply) => {
    const user = request.user as { tenantId: string };
    const settings = await tenantService.getTenantSettings(user.tenantId);
    return reply.send(settings);
  });

  // Salvar credenciais WABA Meta (Somente Admin)
  fastify.put('/waba', async (request, reply) => {
    const user = request.user as { tenantId: string; role: string };
    if (user.role !== 'admin') {
      return reply.status(403).send({ error: 'Apenas Administradores podem alterar a conexão com a Meta.' });
    }

    const parse = updateWabaSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Parâmetros inválidos', details: parse.error.format() });
    }

    try {
      const result = await tenantService.updateWabaSettings(user.tenantId, parse.data);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  // Obter taxas de maquininha
  fastify.get('/card-fees', async (request, reply) => {
    const user = request.user as { tenantId: string };
    const fees = await tenantService.getCardFees(user.tenantId);
    return reply.send({ fees });
  });

  // Salvar taxas de maquininha (Admin ou Manager)
  fastify.put('/card-fees', async (request, reply) => {
    const user = request.user as { tenantId: string; role: string };
    if (user.role !== 'admin' && user.role !== 'manager') {
      return reply.status(403).send({ error: 'Permissão insuficiente para alterar taxas.' });
    }

    const parse = updateCardFeesSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Parâmetros inválidos', details: parse.error.format() });
    }

    try {
      const result = await tenantService.updateCardFees(user.tenantId, parse.data);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
};
