# FUNCTIONAL REQUIREMENTS: ESPECIFICAÇÃO DE REQUISITOS FUNCIONAIS (V1)

---

## 1. Módulo 01: Inbox Comercial Multiatendente WhatsApp (MOD-01)

### RF-01.1: Conexão Oficial via Meta WhatsApp Cloud API
- **Descrição:** O sistema deve permitir a conexão de um número comercial oficial de WhatsApp através da infraestrutura da Meta Cloud API (Embedded Signup ou credenciais de WABA).
- **Critérios de Aceitação:**
  - O sistema deve validar o status da conexão (Conectado, Desconectado, Qualidade do Número: Verde/Amarelo/Vermelho).
  - O sistema deve receber e enviar mensagens de texto, imagens, áudios, vídeos e documentos PDF.
  - O lojista deve ter visibilidade do limite de mensagens diárias atribuído pela Meta (Tier 1K, 10K, 100K).

### RF-01.2: Roleta de Distribuição de Leads (Round-Robin)
- **Descrição:** Novos contatos que enviarem mensagem para o WhatsApp da loja devem ser distribuídos automaticamente e equitativamente entre os vendedores com status "Em Atendimento / Disponível".
- **Critérios de Aceitação:**
  - O sistema deve respeitar a fila sequencial de vendedores ativos no turno.
  - Caso um vendedor esteja com status "Pausa / Almoço" ou inativo, o lead é distribuído para o próximo da fila.
  - O gerente pode reatribuir manualmente qualquer conversa para outro vendedor a qualquer momento.
  - O histórico completo da conversa permanece intacto ao transferir de atendente.

### RF-01.3: Painel de Atendimento Unificado e Histórico do Cliente
- **Descrição:** Interface centralizada onde o vendedor visualiza a lista de conversas ativas, filtros de status e a conversa aberta, com uma barra lateral com dados do cliente.
- **Critérios de Aceitação:**
  - A barra lateral direita deve exibir: Nome, Telefone, Histórico de Aparelhos Comprados na Loja, Etapa atual no Funil de Vendas, e Notas Internas.
  - Deve permitir o envio de respostas rápidas (atalhos de texto com teclado, ex: `/pix`, `/garantia`, `/endereco`).
  - Alerta visual com cores indicando tempo sem resposta: Verde (< 2 min), Amarelo (2 a 5 min), Vermelho (> 5 min).

---

## 2. Módulo 02: Pipeline Comercial Especializado em Celulares (MOD-02)

### RF-02.1: Quadro Kanban com Estágios Nativos de Smartphones
- **Descrição:** Visualização em colunas refletindo o fluxo real de negociação de celulares.
- **Estágios Obrigatórios da V1:**
  1. *Novo Lead* (Lead recebido sem qualificação)
  2. *Qualificação de Modelo* (Identificando marca, modelo, capacidade e cor desejada)
  3. *Avaliação de Usado (Trade-in)* (Cliente possui aparelho para dar como entrada)
  4. *Proposta / Simulação Enviada* (Condições de parcelamento e troca enviadas)
  5. *Aguardando Decisão / Reserva* (Cliente em fase final de escolha ou agendou ida à loja)
  6. *Venda Concluída* (Fechamento do pedido)
  7. *Perdido / Desistência* (Registrando motivo obrigatório de perda)
- **Critérios de Aceitação:**
  - Os cards devem exibir: Nome do cliente, Modelo de interesse, Valor estimado, Vendedor responsável e tempo de permanência na etapa.
  - Movimentação de cards por arrastar e soltar (drag-and-drop) ou via menu rápido no próprio chat do WhatsApp.

### RF-02.2: Motivos Estruturados de Perda de Venda
- **Descrição:** Ao mover um lead para a coluna "Perdido", o sistema deve exigir a seleção de um motivo padronizado.
- **Opções Nativas:** *Preço / Concorrente mais barato*, *Aparelho fora de estoque*, *Limite de cartão insuficiente*, *Avaliação de usado recusada pelo cliente*, *Cliente parou de responder*, *Comprou novo modelo em outra loja*.
- **Critérios de Aceitação:**
  - O lead não pode ser marcado como perdido sem a seleção do motivo.
  - O sistema agenda automaticamente uma tarefa de resgate no funil de recuperação em D+30 ou D+60 para motivos selecionados.

---

## 3. Módulo 03: Calculadora Comercial de 1 Clique (MOD-03)

### RF-03.1: Cadastro de Taxas de Maquininha da Loja
- **Descrição:** O gerente/proprietário cadastra as taxas praticadas pela adquirente da loja (ex: Stone, PagBank, InfinitePay, Cielo).
- **Critérios de Aceitação:**
  - Campos para taxa de Débito, Pix e Crédito parcelado de 1x até 21x.
  - Opção de repassar juros integralmente ao cliente ou aplicar subsídio de juros da loja.

### RF-03.2: Simulador Instantâneo de Parcelamento e Trade-in no Chat
- **Descrição:** Ferramenta acessível diretamente dentro da janela de conversa do WhatsApp com o cliente.
- **Entradas do Vendedor:**
  - Valor do aparelho vendido (ex: R$ 4.200).
  - Valor aceito no aparelho usado do cliente na troca (ex: R$ 1.500) [Opcional].
  - Valor de entrada em Pix ou Dinheiro (ex: R$ 500) [Opcional].
- **Processamento:**
  - O sistema calcula o saldo residual a ser financiado no cartão: (R$ 4.200 - R$ 1.500 - R$ 500 = R$ 2.200).
  - Aplica a taxa da maquininha cadastrada para cada faixa de parcelamento (1x, 6x, 10x, 12x, 18x).
- **Saída:**
  - Botão **"Copiar Proposta Formatada"** ou **"Enviar no Chat com 1 Clique"**, gerando texto limpo, elegante e com emojis para o cliente no WhatsApp:
    ```text
    📱 Proposta Especial para Você:
    • Aparelho: iPhone 14 128GB Estelar
    • Seu usado na troca: - R$ 1.500,00
    • Entrada no Pix: - R$ 500,00
    • Saldo no Cartão de Crédito:
      - 6x de R$ 399,50
      - 10x de R$ 248,90
      - 12x de R$ 212,30
      - 18x de R$ 148,80
    Garantia de 1 ano inclusa. Posso separar a unidade para você?
    ```

---

## 4. Módulo 04: Ficha de Ciclo de Vida do Aparelho (MOD-04)

### RF-04.1: Cadastro Rápido de Venda Concluída
- **Descrição:** Ao mover a oportunidade para "Venda Concluída", abre-se um modal de preenchimento rápido (tempo de preenchimento < 30 segundos).
- **Campos Obrigatórios:**
  - Modelo do Aparelho (ex: iPhone 13, 128GB, Meia-noite).
  - Condição: `Novo Lacrado` ou `Seminovo Certificado`.
  - Se Seminovo: Saúde da Bateria (%) no ato da entrega (ex: 88%).
  - IMEI / Número de Série do aparelho vendido.
  - Aparelho dado na troca (se houver): Modelo + IMEI + Valor pago.
  - Acessórios vendidos em conjunto: Capa, Película, Fonte, Fone, etc.
- **Critérios de Aceitação:**
  - Os dados ficam vinculados ao cadastro permanente do cliente.
  - O sistema alimenta automaticamente a linha do tempo do aparelho para disparar as réguas de pós-venda.

---

## 5. Módulo 05: Motor de Reativação Automática (MOD-05)

### RF-05.1: Réguas Nativas Pré-Configuradas (Plug & Play)
- **Descrição:** Automações que disparam mensagens transacionais e de marketing pelo WhatsApp oficial com base no tempo decorrido desde a data da venda.
- **Especificação dos Gatilhos:**
  - **Gatilho D+0 (Imediato à venda):** Envio automático de comprovante/termo de garantia digital da loja com checklist de conferência e orientações de primeiro uso.
  - **Gatilho D+15 (Acessórios):** Envio de oferta com benefício exclusivo para compra de carregador homologado ou fone de ouvido.
  - **Gatilho D+180 (Checkup Semestral):** Convite para revisão gratuita, limpeza de alto-falantes e troca de película na loja física.
  - **Gatilho D+360 (Upgrade Preditivo):** Oferta personalizada de troca de modelo baseada no aparelho comprado há 1 ano, calculando valor estimado de entrada.
  - **Gatilho D+2 e D+5 (Resgate de Orçamento Perdido):** Mensagem suave para leads que receberam proposta mas não fecharam nem responderam.
- **Critérios de Aceitação:**
  - Todas as mensagens utilizam Templates oficiais aprovados pela Meta (Category: Utility ou Marketing).
  - O sistema respeita as regras de consentimento (opt-out fácil com comando "SAIR").
  - O lojista pode ativar, pausar ou editar os textos de cada régua no painel.

---

## 6. Módulo 06: Dashboard Executivo de ROI e Performance (MOD-06)

### RF-06.1: Cartão de Destaque de Retorno Financeiro (ROI Card)
- **Descrição:** Métrica principal no topo do painel do proprietário comprovando o retorno econômico gerado pela plataforma.
- **Fórmula de Exibição:**
  - `Vendas Recuperadas pelas Automações no Mês (Qtd e R$)`.
  - `Vendas de Acessórios Geradas via D+15 (R$)`.
  - `Valor da Mensalidade do SaaS`.
  - `Multiplicador de Retorno:` (Receita Recuperada ÷ Valor do SaaS).

### RF-06.2: Indicadores Comerciais por Vendedor
- **Descrição:** Tabela de performance individual da equipe.
- **Métricas:**
  - Total de novos leads atendidos.
  - Tempo Médio de Primeira Resposta (FRT - First Response Time).
  - Taxa de Conversão de Fechamento (% de leads que viraram venda).
  - Vendas com Trade-in vs Vendas Diretas.

---

## 7. Módulo 07: Ingestão e Ativação de Base Histórica (MOD-07)

### RF-07.1: Importador de Contatos Históricos via Planilha CSV
- **Descrição:** O lojista ou gerente pode importar sua base de clientes antigos vindos do ERP anterior (Balcão Phones, Bling, etc.) ou planilha.
- **Estrutura Mínima do Arquivo:**
  - `Nome`
  - `WhatsApp / Telefone`
  - `Modelo do Aparelho Comprado` (ex: iPhone 12 128GB)
  - `Data da Compra` (ex: DD/MM/AAAA)
- **Critérios de Aceitação:**
  - O sistema deve validar e higienizar automaticamente os números de telefone para o padrão WhatsApp (+55 DDD 9XXXX-XXXX).
  - Ao concluir a importação, o sistema calcula retroativamente o ciclo de vida e distribui os contatos nas filas das réguas correspondentes (ex: quem comprou há 11 meses entra imediatamente na régua de Upgrade).

---

## 8. Módulo 08: Programa de Indicação Lite no WhatsApp (MOD-08)

### RF-08.1: Disparo de Link e Cupom de Indicação
- **Descrição:** No D+1 pós-venda, o cliente recebe uma mensagem de agradecimento com seu link exclusivo de embaixador da loja para indicar a amigos.
- **Critérios de Aceitação:**
  - O link, quando clicado pelo amigo indicado, abre o WhatsApp da loja com texto pré-definido e código de indicação do cliente.
  - Ao receber a mensagem com o código de indicação, a oportunidade no Kanban é automaticamente tagueada com `#Indicado-por-[NomeDoCliente]`.
  - O painel exibe a contagem de indicações geradas e vendas convertidas por indicador.
