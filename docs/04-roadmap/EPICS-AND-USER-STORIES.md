# EPICS & USER STORIES: ESPECIFICAÇÃO DE ÉPICOS E HISTÓRIAS DE USUÁRIO (V1)

---

## 1. Visão Geral dos Épicos do MVP

Os requisitos funcionais da V1 foram decompostos em **10 Épicos Executáveis**, contendo histórias de usuário estruturadas com critérios de aceitação em formato verificável (Given-When-Then):

```
[ Épicos de Infraestrutura & Canal ]
  ├── ÉPICO 01: Multi-Tenancy, Autenticação Segura & RBAC
  ├── ÉPICO 02: Conexão Oficial Meta WhatsApp Cloud API
  └── ÉPICO 03: Ingestão Resiliente de Webhooks & Mensageria Realtime

[ Épicos do Core Loop Comercial ]
  ├── ÉPICO 04: Inbox Multiatendente & Roleta de Atendimento com SLA
  ├── ÉPICO 05: Pipeline Comercial Kanban de Smartphones
  ├── ÉPICO 06: Calculadora Comercial de 1 Clique & Trade-in
  └── ÉPICO 07: Ficha de Ciclo de Vida do Aparelho & Conclusão de Venda

[ Épicos de Retenção, Reativação & ROI ]
  ├── ÉPICO 08: Ingestão e Higienização de Base Histórica via CSV
  ├── ÉPICO 09: Motor de Réguas Automáticas Plug & Play
  └── ÉPICO 10: Indicação Lite no WhatsApp & Dashboard Executivo de ROI
```

---

## 2. Detalhamento dos Épicos e Histórias de Usuário

### Épico 01: Multi-Tenancy, Autenticação Segura & RBAC

#### US-01.1: Login com JWT e Isolamento por Tenant
- **Como** Usuário da plataforma (Dono, Gerente ou Vendedor),
- **Quero** realizar login seguro com e-mail e senha e receber uma sessão autenticada,
- **Para que** eu possa acessar exclusivamente os dados da minha loja com proteção total de privacidade.
- **Critérios de Aceitação:**
  - **Given** um usuário cadastrado com credenciais válidas,
  - **When** ele submete o formulário de login na rota `/api/auth/login`,
  - **Then** o sistema gera um Access Token JWT (validade 15 min) contendo `tenant_id`, `user_id` e `role`, e grava um Refresh Token em cookie HTTP-Only.
  - **Given** uma requisição autenticada ao banco de dados,
  - **Then** a sessão ativa a política de *Row-Level Security (RLS)* no PostgreSQL, impedindo que registros de outros tenants sejam acessados mesmo sem filtro explícito.

---

### Épico 02: Conexão Oficial Meta WhatsApp Cloud API

#### US-02.1: Configuração do Número WABA da Loja
- **Como** Dono da Loja (Rodrigo),
- **Quero** cadastrar o WhatsApp Business Account ID (WABA) e o Token da Meta no painel da minha loja,
- **Para que** a plataforma possa enviar e receber mensagens oficiais sem risco de banimento.
- **Critérios de Aceitação:**
  - **Given** o Dono da Loja na aba `/configuracoes/waba`,
  - **When** ele preenche o WABA ID, Phone Number ID e o System User Token e clica em "Testar e Salvar",
  - **Then** o backend executa uma chamada de verificação à Meta Graph API e exibe o status de qualidade do número (`GREEN`, `YELLOW` ou `RED`).
  - **Then** o token é persistido criptografado no banco de dados com algoritmo AES-256-GCM.

---

### Épico 03: Ingestão Resiliente de Webhooks & Mensageria Realtime

#### US-03.1: Recepção Assíncrona e Desduplicação de Mensagens
- **Como** Vendedor da Loja (Lucas),
- **Quero** que as mensagens enviadas pelos clientes cheguem instantaneamente na minha tela,
- **Para que** eu não perca o momento quente de atendimento do cliente.
- **Critérios de Aceitação:**
  - **Given** um payload enviado pela Meta ao endpoint `/webhooks/meta`,
  - **When** o backend valida a assinatura HMAC SHA256 no cabeçalho `x-hub-signature-256`,
  - **Then** o payload é inserido na fila Redis BullMQ e o backend responde `HTTP 200 OK` para a Meta em menos de 100ms.
  - **Given** o Worker consumindo o evento da fila,
  - **When** o `wamid` da mensagem já existe na base de dados,
  - **Then** a mensagem é descartada de forma idempotente sem duplicações.
  - **When** o `wamid` é inédito,
  - **Then** a mensagem é salva no PostgreSQL e emitida via WebSocket para a interface do atendente em menos de 500ms.

---

### Épico 04: Inbox Multiatendente & Roleta de Atendimento com SLA

#### US-04.1: Distribuição Automática por Roleta (Round-Robin)
- **Como** Gerente de Loja (Camila),
- **Quero** que os novos clientes que mandam mensagem sejam divididos de forma justa e alternada entre os vendedores disponíveis,
- **Para que** nenhum cliente fique sem resposta e não haja disputa interna por leads.
- **Critérios de Aceitação:**
  - **Given** um novo contato que enviou a primeira mensagem no WhatsApp,
  - **When** a roleta de distribuição é executada,
  - **Then** o sistema seleciona o vendedor que está com status `Disponível` e que recebeu lead há mais tempo (menor data de última atribuição).
  - **Then** a conversa é atribuída a ele e notificada com alerta sonoro e visual na tela.

#### US-04.2: Alerta Visual de SLA Estourado
- **Como** Gerente Comercial (Camila),
- **Quero** identificar visualmente quais conversas estão demorando para serem respondidas,
- **Para que** eu possa intervir antes que o cliente desista da compra.
- **Critérios de Aceitação:**
  - **Given** uma conversa aberta aguardando resposta do vendedor,
  - **Then** o card exibe etiqueta verde se tempo < 2 minutos.
  - **Then** o card exibe etiqueta amarela se tempo entre 2 e 5 minutos.
  - **Then** o card exibe etiqueta vermelha piscante se tempo > 5 minutos.

---

### Épico 05: Pipeline Comercial Kanban de Smartphones

#### US-05.1: Gestão de Oportunidades no Funil com Motivo de Perda
- **Como** Vendedor (Lucas),
- **Quero** arrastar as oportunidades entre as fases de venda de celulares e registrar o motivo quando o cliente desistir,
- **Para que** a equipe mantenha o funil organizado e gere inteligência sobre negócios perdidos.
- **Critérios de Aceitação:**
  - **Given** o quadro Kanban na tela `/pipeline`,
  - **When** o vendedor arrasta o card de "Qualificando" para "Avaliando Trade-in",
  - **Then** a etapa é atualizada imediatamente no banco e refletida em tempo real para os demais membros da equipe.
  - **When** o vendedor arrasta o card para a área "Perdido",
  - **Then** um modal surge exigindo a seleção obrigatória de um motivo (ex: *Preço / Concorrente mais barato*, *Sem limite no cartão*, *Avaliação de troca recusada*).

---

### Épico 06: Calculadora Comercial de 1 Clique & Trade-in

#### US-06.1: Simulação Instantânea de Parcelamento no Chat
- **Como** Vendedor (Lucas),
- **Quero** inserir o valor do aparelho novo, abater o usado na troca e o Pix de entrada e gerar as parcelas de maquininha em 1 clique,
- **Para que** eu envie uma proposta perfeita para o cliente no WhatsApp em menos de 45 segundos.
- **Critérios de Aceitação:**
  - **Given** a gaveta lateral de venda aberta dentro do Inbox,
  - **When** o vendedor digita o valor do smartphone desejado (ex: R$ 3.899) e os valores de abatimento (Troca: R$ 1.300 | Pix: R$ 500),
  - **Then** o sistema aplica as taxas cadastradas da loja e calcula as parcelas de 1x até 21x em menos de 50ms.
  - **When** o vendedor clica no botão "Enviar Proposta no Chat",
  - **Then** um texto formatado com emojis, detalhes do aparelho e lista de parcelas é enviado diretamente na conversa do cliente no WhatsApp.

---

### Épico 07: Ficha de Ciclo de Vida do Aparelho & Conclusão de Venda

#### US-07.1: Modal Rápido de Venda e Criação da Ficha do Aparelho
- **Como** Vendedor (Lucas),
- **Quero** preencher uma ficha ultrarrápida (< 30s) ao fechar uma venda,
- **Para que** o histórico do aparelho e da garantia do cliente fiquem salvos permanentemente.
- **Critérios de Aceitação:**
  - **Given** uma negociação movida para "Venda Concluída",
  - **When** o modal abre,
  - **Then** os campos obrigatórios são: Modelo do Aparelho, Condição (Novo ou Seminovo), % Saúde da Bateria (se seminovo) e IMEI/Serial.
  - **When** o vendedor clica em "Confirmar e Emitir Garantia",
  - **Then** a transação é gravada na tabela `sales`, a ficha é criada em `customer_devices` e o gatilho da régua D+0 é disparado automaticamente.

---

### Épico 08: Ingestão e Ativação de Base Histórica via CSV

#### US-08.1: Importador Guiado de Clientes Legados
- **Como** Dono da Loja (Rodrigo),
- **Quero** importar uma planilha CSV com a lista dos meus clientes dos últimos 2 anos,
- **Para que** a plataforma calcule o ciclo de troca e comece a reativar clientes imediatamente no onboarding.
- **Critérios de Aceitação:**
  - **Given** um arquivo CSV contendo Nome, Telefone, Modelo do Aparelho e Data da Compra,
  - **When** o lojista faz o upload em `/clientes/importar`,
  - **Then** o sistema higieniza os telefones para o padrão internacional (+55 DDD 9XXXX-XXXX).
  - **Then** calcula a diferença de dias desde a compra e popula as filas de pós-venda (ex: compras com mais de 300 dias entram na fila de Upgrade).

---

### Épico 09: Motor de Réguas Automáticas Plug & Play

#### US-09.1: Disparo Programado com Templates Aprovados Meta
- **Como** Gerente Comercial (Camila),
- **Quero** que o sistema envie mensagens no WhatsApp dos clientes nos momentos certos (D+0, D+15, D+180, D+360),
- **Para que** os clientes comprem acessórios e façam upgrade de aparelho sem depender da memória dos vendedores.
- **Critérios de Aceitação:**
  - **Given** uma venda cadastrada no sistema,
  - **When** o relógio de agendamento atinge D+0 (imediato), D+15, D+180 ou D+360,
  - **Then** o sistema verifica se o cliente não está em status `opted_out`.
  - **Then** despacha o template oficial aprovado pela Meta através da fila com rate limiter (< 30 msgs/seg).
  - **Then** grava o registro na tabela `automation_logs`.

---

### Épico 10: Indicação Lite no WhatsApp & Dashboard Executivo de ROI

#### US-10.1: Envio de Link de Indicação e Cálculo de ROI
- **Como** Dono da Loja (Rodrigo),
- **Quero** que os compradores recebam um link de recomendação para amigos e que eu veja no painel o dinheiro recuperado pelo sistema,
- **Para que** eu comprove que o software gera muito mais lucro do que custa a mensalidade.
- **Critérios de Aceitação:**
  - **Given** um cliente que comprou um smartphone,
  - **When** o sistema atinge D+1 pós-venda,
  - **Then** envia no WhatsApp dele uma mensagem de embaixador com link exclusivo contendo cupom para amigos.
  - **Given** o Dono da Loja acessando `/dashboard`,
  - **Then** o painel exibe em destaque a soma de faturamento de vendas recuperadas pelas réguas e indicações, o custo da assinatura do software e o multiplicador de retorno econômico (ROI).
