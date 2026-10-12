# PRD OVERVIEW: DOCUMENTO DE REQUISITOS DE PRODUTO (VISÃO GERAL)

---

## 1. Informações do Documento
- **Produto:** Plataforma de Aceleração Comercial, CRM & Reativação para Lojas de Celulares.
- **Versão:** 1.0 (Escopo MVP).
- **Fase:** 01 - Product Requirements Definition (PRD).
- **Metodologia:** RM SaaS Harness Framework.
- **Papel:** Product Management B2B SaaS.

---

## 2. Visão Executiva e Objetivos Estratégicos

### 2.1 Visão do Produto
Ser o sistema operacional de vendas definitivo para revendedoras de smartphones e iPhones, transformando o WhatsApp em um canal comercial estruturado, profissional e previsível, capaz de gerar receita adicional por meio de atendimento ultrarrápido, precificação assistida e reativação automática da base de clientes pelo ciclo de troca e saúde de bateria.

### 2.2 Objetivos de Negócio (Business Goals)
1. **Reduzir o Custo Efetivo de Aquisição (CAC):** Aumentar o faturamento da loja sem necessidade proporcional de aumento de investimento em mídia paga (Meta Ads/Google Ads).
2. **Eliminar Perda de Oportunidades no WhatsApp:** Garantir que 100% dos leads e orçamentos iniciados recebam atendimento em menos de 3 minutos e tenham régua de acompanhamento estruturada.
3. **Gerar Receita Previsível de Recompra:** Criar um fluxo sistemático de recompras em D+15 (acessórios), D+180 (manutenção preventiva) e D+360 (upgrade de aparelho).
4. **Alcançar Product-Market Fit (PMF) Rápido:** Conquistar as primeiras 100 lojas pagantes com taxa de cancelamento (churn) mensal inferior a 3,5% e NPS acima de 65.

---

## 3. OKRs do Produto (Objetivos e Resultados-Chave - V1)

```
[ Objetivo 1: Entregar Time-to-Value (TTV) Imediato no Onboarding ]
  ├── KR 1.1: 90% das lojas realizam o primeiro atendimento oficial via WhatsApp em < 24h após o setup.
  └── KR 1.2: 70% das lojas realizam o primeiro disparo de reativação de base nos primeiros 3 dias.

[ Objetivo 2: Acelerar a Eficiência do Vendedor ]
  ├── KR 2.1: Reduzir o tempo médio de resposta inicial (First Response Time) para < 3 minutos em horário comercial.
  └── KR 2.2: Reduzir o tempo de elaboração e envio de proposta com parcelamento/trade-in para < 45 segundos.

[ Objetivo 3: Comprovar Retorno Financeiro Inquestionável ]
  ├── KR 3.1: Cada loja ativa recupera no mínimo 3 vendas de aparelhos/mês exclusivamente via automação.
  └── KR 3.2: 85% dos lojistas mantêm a assinatura ativa no D+90 (Retenção M3 ≥ 85%).
```

---

## 4. Matriz de Módulos da Versão 1.0 (MVP)

| Módulo | Nome | Objetivo Principal | Usuário Alvo |
| :--- | :--- | :--- | :--- |
| **MOD-01** | **Inbox Comercial Multiatendente WhatsApp** | Centralizar e rotear mensagens da Meta WhatsApp Cloud API entre múltiplos vendedores. | Vendedores e Gerente |
| **MOD-02** | **Pipeline Especializado em Celulares** | Gerenciar o funil de negociação de smartphones com estágios de qualificação e trade-in. | Vendedores e Gerente |
| **MOD-03** | **Calculadora Comercial 1-Click** | Calcular parcelas de máquinas de cartão e abater valores de aparelhos de troca instantaneamente. | Vendedores |
| **MOD-04** | **Ficha de Ciclo de Vida do Aparelho** | Registrar modelo vendido, IMEI, status e saúde da bateria para acionamento preditivo. | Vendedores |
| **MOD-05** | **Motor de Reativação Automática** | Disparar mensagens nativas em D+0, D+15, D+180 e D+360 com base no histórico do cliente. | Automação / Gerente |
| **MOD-06** | **Ingestão e Ativação de Base Histórica** | Importar CSV de clientes antigos para ativar réguas de reativação no dia 1. | Gerente e Dono |
| **MOD-07** | **Programa de Indicação Lite** | Gerar link de indicação com cupom no WhatsApp para amigos de compradores. | Clientes e Vendedores |
| **MOD-08** | **Dashboard Executivo de ROI** | Apresentar faturamento recuperado, métricas de SLA e produtividade da equipe comercial. | Dono da Loja e Gerente |

---

## 5. Critérios de Sucesso e Definition of Done (DoD) de Produto

Um módulo ou funcionalidade da V1 só será considerado concluído e pronto para liberação se atender aos seguintes requisitos de aceitação:
- **Zero Fricção no WhatsApp:** Nenhuma automação deve expor o número da loja ao risco de banimento (adesão integral aos templates aprovados da Meta).
- **Mobile-First / PWA Friendly:** Operação fluida em telas de celulares para vendedores que atendem fisicamente no balcão da loja.
- **Simplicidade Radical:** Nenhuma ação crítica deve exigir mais do que 3 cliques para ser completada.
- **Rastreabilidade Completa:** Todas as vendas fechadas devem permitir identificar a origem (anúncio novo, lead orgânico ou cliente recuperado por régua).
