# MVP SCOPE: ESCOPO DO PRODUTO MÍNIMO VIÁVEL E ROADMAP ESTRATÉGICO

---

## 1. Filosofia e Critérios de Delimitação do MVP

O objetivo do MVP (Minimum Viable Product) **NÃO** é construir uma versão simplificada de um ERP ou um clone genérico de WhatsApp, mas sim **validar a hipótese central de valor econômico**:
> *"Uma ferramenta especializada no ciclo de venda e pós-venda de celulares, conectada diretamente ao WhatsApp oficial da loja, gera aumento imediato de faturamento através de velocidade de atendimento e reativação preditiva de clientes esquecidos."*

Para garantir velocidade de entrada no mercado, estabilidade e aderência do lojista, o MVP adota o princípio de **Foco Radical no Time-to-Value (TTV < 48 horas)**.

---

## 2. Matriz de Escopo MoSCoW para a Versão 1.0 (MVP)

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ MUST HAVE (OBRIGATÓRIO NO MVP)       │ SHOULD HAVE (FASE 1.5 - PÓS-MVP)     │
│ - WhatsApp Cloud API Oficial         │ - IA de Triagem Noturna Básica       │
│ - Inbox Multiatendente com Roleta    │ - Split e Pagamento Automático Pix   │
│ - Pipeline Comercial para Celulares  │   de Indicação (MGM Avançado)        │
│ - Calculadora 1-Click de Maquininha  │ - Templates de Mídia Interativos     │
│ - Registro de Venda & Ciclo do Phone │ - Integração via Webhook com ERPs    │
│ - Ingestão/Importação CSV de Base    │   (Balcão Phones, Bling)             │
│ - Régua de Reativação (D+0, 15, 360) │                                      │
│ - Indicação Lite (Link + Cupom WhatsApp)                                    │
│ - Dashboard de ROI de Automação      │                                      │
│ - PWA Web Mobile para Balcão         │                                      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ COULD HAVE (FUTURO / FASE 2)         │ WON'T HAVE (FORA DO ESCOPO DO MVP)   │
│ - Copiloto de IA para Objeções       │ ❌ Emissão de Notas Fiscais (NF-e)    │
│ - Tabela Fipe Integrada de Usados    │ ❌ Módulo de Ordem de Serviço (OS)   │
│ - Gestão de Comissões Complexas      │ ❌ Marketplace B2B entre Lojistas    │
│ - Disparo de Voz com IA Sintética    │ ❌ Aplicativos Nativos App Store/Play│
│ - Disparo Multicanal (SMS/Email)     │ ❌ Gestão de Estoque Físico/Almoxarif│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. Detalhamento dos Módulos Essenciais (In-Scope MVP)

### Módulo 1: WhatsApp Comercial Multiatendente & Roteamento Inteligente
- **Conectividade:** Conexão homologada via Meta WhatsApp Cloud API (número oficial verificado, eliminando risco de banimento).
- **Caixa de Entrada Unificada:** Todos os atendentes operam o mesmo número oficial de WhatsApp a partir de seus computadores ou navegadores.
- **Roleta de Atendimento (Round-Robin):** Distribuição automática e sequencial de novos leads entre os vendedores da escala de trabalho.
- **SLA e Alertas:** Destaque visual (cores) para conversas sem resposta há mais de 3 e 5 minutos.
- **Painel de Tags Rápidas de Nicho:** Marcadores como `#Buscando-iPhone-13`, `#Tem-Troca`, `#Aguardando-Cartão`, `#Seminovo`, `#Acessório`.

### Módulo 2: Pipeline Visual Especializado em Smartphones
- **Kanban Estruturado para o Varejo de Celulares:**
  1. *Novo Lead* (Chegou do WhatsApp/Instagram)
  2. *Qualificação de Interesse* (Aparelho desejado + Capacidade + Cor)
  3. *Avaliação de Usado (Trade-in)* (Dados do aparelho de entrada do cliente)
  4. *Proposta Enviada* (Com opções de parcelamento de maquininha)
  5. *Aguardando Decisão / Visita à Loja*
  6. *Venda Concluída*
  7. *Perdido / Motivo do Descarte*
- **Ações Rápidas no Card:** Arrasto intuitivo e histórico de notas internas entre vendedor e gerente.

### Módulo 3: Calculadora Comercial de 1 Clique (Trade-in + Taxas de Maquininha)
- **Configuração de Taxas da Loja:** Parametrização simples das taxas da máquina de cartão (Débito, Pix, 1x a 21x).
- **Simulador Instantâneo:** O vendedor insere o valor do aparelho novo/seminovo, abate o valor do seminovo de entrada, e o sistema cospe em 1 clique a mensagem pronta para colar no WhatsApp do cliente com as opções de 1x, 6x, 10x, 12x e 18x.

### Módulo 4: Gestão do Ciclo de Vida do Aparelho (Device Lifecycle)
- **Ficha Rápida na Finalização da Venda (30 segundos):**
  - Modelo vendido (ex: iPhone 13 128GB Azul).
  - Condição: Novo Lacrado ou Seminovo.
  - Se Seminovo: Porcentagem de saúde da bateria no momento da venda (ex: 86%).
  - IMEI / Serial (campo rápido para controle de garantia).
  - Acessórios incluídos na compra.

### Módulo 5: Motor de Reativação Automática (Régua Preditiva no WhatsApp)
- **Régua Plug & Play Nativa (Sem necessidade de montar fluxos complicados):**
  - **D+0 (Imediato após venda):** Mensagem de agradecimento com link seguro para o Termo de Garantia da Loja e cuidados com o aparelho.
  - **D+15 (Oferta de Acessórios):** Oferta direcionada para complementar o aparelho (ex: fonte 20W homologada, capa anti-impacto, carregador MagSafe).
  - **D+180 (Checkup de 6 Meses):** Convite para limpeza do conector de carga e troca de película na loja física.
  - **D+360 (Gatilho de Upgrade):** Notificação personalizada convidando para avaliação do modelo atual para troca pelo modelo de nova geração.
- **Régua de Resgate de Orçamentos Perdidos:**
  - Disparo automático suave em D+2 e D+5 para conversas que pararam após envio de proposta.

### Módulo 6: Ingestão e Ativação de Base Histórica (CSV Importer)
- **Importação Rápida no Onboarding:**
  - Upload de planilha CSV simples contendo: Nome, Telefone/WhatsApp, Modelo do Aparelho Comprado e Data Aproximada da Compra.
  - Higienização e validação automática de números (formato E.164 com DDI + DDD brasileiro).
  - Cálculo retroativo imediato do ciclo de troca para popular as réguas (ex: clientes que compraram há 10 meses entram automaticamente na fila de D+300 / Upgrade).

### Módulo 7: Indicação Lite (Member-Get-Member no WhatsApp)
- **Geração de Link com Cupom:**
  - No D+1 pós-venda, o cliente recebe seu link pessoal para compartilhar no WhatsApp.
  - Ao clicar, o indicado abre conversa no WhatsApp da loja com o cupom preenchido automaticamente (ex: `Olá! Vim pela indicação do Carlos e quero meu desconto na compra de um iPhone`).
  - Identificação visual no card do lead: `#Indicação-do-Carlos`.

### Módulo 8: Painel Executivo e Métrica de Retorno (ROI Dashboard)
- **Visão do Proprietário:**
  - Número de atendimentos realizados e tempo médio de resposta por vendedor.
  - Vendas fechadas e faturamento bruto registrado no funil.
  - **Métrica Chave em Destaque:** *Total de Vendas Geradas Diretamente pelas Automações de Reativação e Indicação* (evidenciando que o software se paga com folga).

---

## 4. O que Está Explicitamente Fora do Escopo Inicial (Out-of-Scope)

Para preservar o foco estratégico e evitar a armadilha de criar um produto disperso:
1. **Emissão de Notas Fiscais e SPED Contábil:** O produto integrará com os ERPs dos clientes ou coexistirá paralelamente.
2. **Ordens de Serviço de Manutenção Pesada de Bancada:** O software é de vendas e pós-venda, não de diagnóstico técnico de placa eletrônica.
3. **Marketplace B2B entre Lojistas:** Embora seja a grande visão de longo prazo para geração de efeito de rede, exige volume crítico inicial de lojistas ativos (liquidez). Fica planejado para a Fase 3.
4. **Disparos em Massa Não Homologados:** Nenhuma funcionalidade de "disparo em massa via emulador de Android ou extensão Chrome" será desenvolvida. 100% focado na estabilidade da API oficial Meta.

---

## 5. Critérios de Sucesso e Validação do MVP

| Métrica de Validação | Meta Mínima de Aceitação (MVP) | Fonte de Dados |
| :--- | :--- | :--- |
| **Tempo de Onboarding (TTV)** | Menos de 48 horas para primeira mensagem disparada | Telemetria de Onboarding |
| **Adesão Diária dos Vendedores** | Pelo menos 80% das interações comerciais operadas no sistema | Sessões ativas e movimentações no Kanban |
| **Tempo Médio de Primeira Resposta** | Queda para menos de 4 minutos | Métricas de conversas WhatsApp |
| **Vendas Recuperadas por Loja** | No mínimo 3 aparelhos adicionais recuperados no mês 1 | Relatório de vendas atribuídas às réguas |
| **Net Promoter Score (NPS)** | NPS ≥ 65 entre proprietários e gerentes | Pesquisa no D+30 de uso |
| **Churn no Primeiro Trimestre** | Churn mensal < 4,0% | Métricas financeiras de assinatura |

---

## 6. Roadmap Estratégico Pós-MVP

```
[ FASE 1: MVP (Meses 1-3) ]
  • WhatsApp Oficial Multiatendente
  • Funil Comercial Especializado
  • Calculadora de Parcela & Trade-in
  • Réguas Nativas D+0, D+15, D+360
  • Painel de ROI
       │
       ▼
[ FASE 2: ACELERAÇÃO & IA (Meses 4-7) ]
  • Programa de Indicação Viral (Member-Get-Member com Pix/Cashback)
  • Agente de IA para Qualificação Fora do Horário Comercial
  • Copiloto de IA para Objeções de Venda
  • Integrações bidirecionais via Webhook/API com Balcão Phones, Bling e GestorOS
       │
       ▼
[ FASE 3: MARKETPLACE B2B & REDE (Meses 8-14) ]
  • Rede de Liquidez de Estoque entre Lojistas (Repasse de Seminovos e Peças)
  • Escrow de Pagamento Seguro entre Lojistas
  • Tabela Referencial de Preços de Seminovos em Tempo Real (Fipe dos Celulares)
```
