# BUSINESS RULES: REGRAS DE NEGÓCIO E LÓGICA OPERACIONAL (V1)

---

## 1. RN-01: Roleta de Distribuição de Leads e Gestão de SLA

### RN-01.1: Fila Sequencial e Elegibilidade de Vendedor
1. Um vendedor é considerado elegível para receber novos leads se, e somente se:
   - Seu status no sistema for `Disponível / Online`.
   - Estiver dentro do seu horário de escala de trabalho cadastrado.
   - Não tiver excedido o limite máximo de conversas simultâneas abertas (teto configurável, padrão: 20 conversas ativas).
2. A distribuição segue a ordem estrita de menor tempo desde a última atribuição (Round-Robin equilibrado).

### RN-01.2: Escalabilidade de SLA Estourado
1. Se um vendedor não responder a um novo lead em até **5 minutos corridos** em horário comercial:
   - O card da conversa assume coloração vermelha piscante no painel do gerente.
   - Se configurado pelo gerente, o sistema transfere automaticamente a conversa para o próximo vendedor da fila.
   - O vendedor omisso perde a prioridade na próxima rodada da roleta.

---

## 2. RN-02: Calculadora de Parcelamento e Juros de Cartão

### RN-02.1: Cálculo de Juros Compostos da Maquininha
1. A base de cálculo do parcelamento segue a fórmula padrão de antecipação e juros praticada por adquirentes de maquininha de cartão no Brasil:
   $$\text{Valor Total com Juros} = \frac{\text{Saldo a Financiar}}{1 - \text{Taxa Percentual Total da Faixa}}$$
2. O valor de cada parcela é obtido pela divisão do Valor Total com Juros pelo número de parcelas ($n$):
   $$\text{Valor da Parcela} = \frac{\text{Valor Total com Juros}}{n}$$
3. O arredondamento é sempre feito para cima em centavos (duas casas decimais) para evitar que a loja absorva frações de centavos negativas.

### RN-02.2: Política de Entrada (Pix / Dinheiro)
1. O valor de entrada informado abate diretamente o valor do aparelho antes da aplicação dos juros do cartão de crédito.
2. O saldo financiado não pode ser inferior a R$ 50,00 (valor mínimo para processamento de transações parceladas em maquininha).

---

## 3. RN-03: Avaliação Comercial de Trade-in (Aparelho na Troca)

### RN-03.1: Critérios de Depreciação de Usados
1. A avaliação sugerida de um aparelho de entrada considera o valor de revenda de balcão da loja abatido de:
   - **Margem de Risco e Revenda da Loja:** Mínimo de 20% a 30% abaixo do preço final de venda.
   - **Desconto por Saúde da Bateria:**
     - Se Bateria ≥ 85%: Sem desconto adicional de bateria.
     - Se Bateria entre 80% e 84%: Desconto de R$ 150,00 (custo de reposição futura).
     - Se Bateria < 80%: Desconto obrigatório de R$ 250,00 (troca imediata de bateria homologada).
   - **Desconto por Avarias Estéticas ou Funcionais:**
     - Tela trincada ou com riscos profundos: Desconto do custo de troca de tela de linha premium.
     - Face ID ou Touch ID inoperante: Desconto de até 40% do valor do aparelho (dificuldade de revenda).
2. Nenhum aparelho com bloqueio de iCloud, impedimento por perda/roubo (blacklist/IMEI) ou procedência duvidosa pode ser aceito como troca.

---

## 4. RN-04: Disparo de Mensagens WhatsApp e Compliance com a Meta

### RN-04.1: A Janela de 24 Horas (Customer Service Window)
1. **Conversa Iniciada pelo Cliente:** Dentro da janela de 24 horas após a última mensagem recebida do cliente, o lojista e a plataforma podem enviar mensagens de formato livre (texto, áudio, mídia) sem cobrança de template por mensagem.
2. **Conversa Fora da Janela de 24 Horas:** Para reengajar um cliente após 24 horas de inatividade, é **obrigatório** o uso de Templates pré-aprovados pela Meta nas categorias:
   - `MARKETING` (para réguas de reativação de upgrade, ofertas de acessórios e datas comemorativas).
   - `UTILITY` (para envio de termo de garantia, confirmação de pedido e lembrete de agendamento de visita).

### RN-04.2: Política Antispam e Opt-Out do Consumidor
1. Todo template de marketing enviado pelo sistema deve conter a opção explícita de recusa (ex: *"Para não receber mais novidades, responda SAIR"*).
2. Caso o cliente responda "SAIR", o sistema altera imediatamente o status do contato para `Opt-Out / Não Perturbar`.
3. Contatos em `Opt-Out` são permanentemente bloqueados de receberem qualquer régua de automação futura, permitindo apenas atendimentos manuais solicitados ativamente pelo cliente.

---

## 5. RN-05: Atribuição de Vendas, Resgate e Cálculo de ROI

### RN-05.1: Modelo de Atribuição de Reativação
1. Uma venda é formalmente contabilizada como **"Venda Recuperada por Automação"** se atender a pelo menos um dos seguintes critérios:
   - O cliente final realizou a compra dentro de uma janela de até **7 dias corridos** após o envio de uma mensagem de régua de automação (D+15, D+180, D+360 ou resgate de orçamento).
   - O cliente respondeu à mensagem automática e a oportunidade foi movida de "Perdido/Inativo" para "Venda Concluída".
2. Se a venda ocorreu sem disparo prévio de régua nos últimos 30 dias, ela é classificada como **"Venda Orgânica / Tráfego Regular"**.

---

## 6. RN-06: Matriz de Permissões e Perfis de Acesso (RBAC)

| Ação / Funcionalidade | Dono / Administrador | Gerente de Loja | Vendedor / Atendente |
| :--- | :---: | :---: | :---: |
| Conectar / Desconectar WhatsApp WABA | **Sim** | Não | Não |
| Configurar Taxas de Maquininha | **Sim** | **Sim** | Não (Apenas consulta) |
| Criar / Editar Réguas de Automação | **Sim** | **Sim** | Não |
| Visualizar Dashboard Geral de ROI da Loja | **Sim** | **Sim** | Não |
| Visualizar Desempenho de Todos os Vendedores | **Sim** | **Sim** | Não (Apenas o seu) |
| Transferir Leads entre Vendedores | **Sim** | **Sim** | Não |
| Atender Conversas Atribuídas e Usar Calculadora | **Sim** | **Sim** | **Sim** |
| Exportar Lista de Clientes (Download CSV) | **Sim** (Exige 2FA) | Não | Não |
