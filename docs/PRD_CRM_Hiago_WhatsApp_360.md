# PRD — CRM WhatsApp 360° | CRM Hiago

**Versão:** 1.0  
**Data:** Novembro de 2026

## 1. Resumo e objetivo

Evoluir o CRM WhatsApp existente no CRM Hiago para uma central de atendimento, vendas e assistência técnica voltada a lojas de celulares e acessórios. Centralizar conversas, oportunidades, ordens de serviço, automações e recomendações por IA, com integração aos dados reais do ERP.

**Diretriz:** preservar a arquitetura e os módulos existentes; não duplicar cadastros, estoque, vendas ou ordens de serviço.

## 2. Estrutura do módulo

| Submódulo | Função |
|---|---|
| Central WhatsApp | Atendimento multiusuário em tempo real |
| Kanban de Vendas | Leads, propostas e negociações |
| Kanban de Assistência | Acompanhamento de reparos e OS |
| Clientes 360° | Histórico de compras, conversas e serviços |
| Automações | Alertas, tarefas e mensagens autorizadas |
| Inteligência Artificial | Recomendações para atendentes e gestores |
| Campanhas | Prospecção e recuperação de clientes |
| Relatórios | Indicadores comerciais e operacionais |

## 3. Requisitos funcionais

### RF01 — Central de atendimento

- Enviar e receber mensagens pela API oficial do WhatsApp, após configuração das credenciais.
- Permitir múltiplos atendentes, departamentos e transferência de conversas.
- Suportar mensagens e mídias compatíveis com a integração.
- Exibir histórico, etiquetas, tarefas e respostas rápidas.
- Persistir conversas e status no banco de dados.

### RF02 — Kanban comercial

**Fluxo principal:** Novo lead → Qualificação → Negociação → Pagamento → Venda concluída.

- Cartões com cliente, aparelho desejado, valor estimado, responsável e última interação.
- Movimentação por arrastar e soltar com persistência no banco.
- Etapas e motivos de perda configuráveis.
- Marcar venda como concluída somente após confirmação válida no PDV.

### RF03 — Kanban de assistência técnica

**Fluxo principal:** Recebido → Diagnóstico → Orçamento → Em reparo → Pronto → Entregue.

- Cada cartão vinculado à OS existente, contendo aparelho, defeito, orçamento, técnico e prazo.
- Prever aprovação de orçamento, espera por peças e cancelamento.
- Atualizar a OS pelas regras de negócio existentes, sem alterar status apenas visualmente.

### RF04 — Integração com ERP

- **Estoque:** disponibilidade, aparelhos, acessórios, peças e preços.
- **Vendas/PDV:** propostas, reservas, pagamentos e vendas confirmadas.
- **Assistência:** ordens de serviço, diagnósticos e garantias.
- **Clientes:** cadastro único e histórico.
- **Financeiro:** valores e situações das operações conforme permissões.

### RF05 — Inteligência artificial

Utilizar a API da OpenAI pelo backend para sugerir respostas, identificar intenções, recomendar produtos disponíveis, resumir conversas, indicar oportunidades, apoiar recuperação de clientes e analisar indicadores.

**Regra:** na versão inicial, a IA recomenda; envios externos, descontos e alterações operacionais exigem aprovação humana. Não inventar preços, estoque ou prazos.

### RF06 — Automações

| Gatilho | Ação |
|---|---|
| Novo contato | Criar lead |
| Orçamento sem resposta | Criar lembrete |
| OS pronta | Preparar aviso de retirada |
| Venda concluída | Iniciar pós-venda |
| Lead sem atendimento | Alertar responsável |
| Cliente insatisfeito | Priorizar atendimento humano |

Respeitar consentimento, políticas e janelas de atendimento do WhatsApp. Registrar execuções e impedir duplicações.

### RF07 — Relatórios

Exibir conversas recebidas, tempo médio de resposta, leads por etapa, conversão, vendas atribuídas ao WhatsApp, OS originadas pelo canal e desempenho por atendente. Usar somente dados reais.

## 4. Requisitos técnicos

| Área | Requisito |
|---|---|
| Frontend | Reutilizar stack e Designer Global existentes |
| Backend | Reaproveitar serviços e regras do ERP |
| Banco | Supabase com RLS, relacionamentos e migrations |
| WhatsApp | Meta WhatsApp Business Platform / Cloud API |
| IA | API da OpenAI com chamadas seguras pelo backend |
| Segurança | Permissões, auditoria e isolamento entre organizações |
| Persistência | Sincronização e registro confiável das operações |

Não utilizar dados fictícios em produção nem criar estruturas paralelas desnecessárias.

## 5. Etapas de implementação

1. **Auditoria:** mapear CRM atual, banco, integrações e problemas.
2. **Atendimento e Kanbans:** central de conversas, clientes 360°, vendas e assistência.
3. **Integrações:** conectar ERP e ativar WhatsApp oficial quando houver credenciais.
4. **Automações e IA:** gatilhos, recomendações e aprovações.
5. **Relatórios e homologação:** validar segurança, persistência e indicadores.

Cada etapa deve ser revisada antes de avançar.

## 6. Critérios de aceitação

- Conversas e cartões permanecem salvos após atualizar a página.
- Atendimento, oportunidades e OS podem ser gerenciados pela central.
- Vendas, estoque e assistência permanecem sincronizados com o ERP.
- IA consulta dados reais e respeita aprovações.
- Relatórios refletem apenas operações confirmadas.
- Permissões e isolamento entre organizações são efetivos.
- Integração WhatsApp envia e recebe mensagens reais e trata falhas.

## 7. Fora do escopo inicial

Aplicativos móveis nativos, redes sociais adicionais, gateway próprio de pagamentos e autonomia irrestrita da IA.

---

**Instrução para o Antigravity:** utilizar este PRD como referência. Iniciar pela auditoria do repositório, identificar o que já existe e apresentar um plano incremental antes de modificar os módulos.
