# ROTEIRO DE TESTES OPERACIONAIS E FUNCIONAIS — CRM HIAGO IPHONES
**Módulo Comercial, PDV, Caixa, Clientes e Pós-Venda**

> **Perfil do Testador:** Analista de QA, Gestor Comercial ou Operador de Loja.  
> **Ambiente:** Navegador Web (Google Chrome / Microsoft Edge / Safari) conectado ao Supabase.  
> **Versão do Sistema:** Módulo Comercial v2.0 Integrado.

---

## 📌 PRÉ-REQUISITOS ANTES DE INICIAR O TESTE

1. Inicie a aplicação no terminal:
   ```bash
   npm run dev --prefix client
   ```
2. Abra a URL: `http://localhost:5173` no navegador.
3. No canto superior direito, certifique-se de que o badge verde está visível:
   - **`🟢 SUPABASE CONECTADO`** (Garante que os dados serão salvos no banco real).

---

# ETAPA 1: CAIXA E OPERAÇÕES (ABERTURA, SANGRIA E SUPRIMENTO)

> **Objetivo:** Garantir que o caixa controla o saldo inicial em dinheiro, permite reforços e retiradas auditadas e reflete as vendas.

### Teste 1.1: Abertura e Visualização do Caixa
1. No menu lateral, clique na aba **"Caixa e vendas"** (ou **"Fluxo de Caixa"**).
2. Verifique o cabeçalho superior:
   - **Operador Responsável:** Deve exibir o nome do operador ativo (ex: `Operador Balcão` ou `Hiago`).
   - **Fundo de Troco Inicial:** Deve exibir o valor inicial (ex: R$ 300,00).
   - **Status:** Deve exibir a tag verde **"Aberto"**.
3. **Resultado Esperado:** O resumo mostra: Fundo de Caixa + Entradas - Saídas = Saldo Atual em Caixa.

### Teste 1.2: Registro de Suprimento (Reforço de Dinheiro)
1. Na tela de Caixa, clique no botão **"+ Suprimento"** (ou **"Reforço"**).
2. No modal que abrir, informe:
   - **Valor (R$):** `150,00`
   - **Motivo / Justificativa:** `Troco adicional para início de semana`
3. Clique em **"Confirmar Suprimento"**.
4. **Resultado Esperado:**
   - O modal se fecha com mensagem de sucesso.
   - O Saldo Atual em dinheiro aumenta em R$ 150,00.
   - Uma nova linha do tipo **"Entrada (Suprimento)"** de R$ 150,00 aparece no extrato de movimentações com data/hora.

### Teste 1.3: Registro de Sangria (Retirada de Dinheiro)
1. Na mesma tela de Caixa, clique no botão **"- Sangria"** (ou **"Retirada"**).
2. No modal que abrir, informe:
   - **Valor (R$):** `100,00`
   - **Motivo / Justificativa:** `Pagamento motoboy de entrega expressa`
3. Clique em **"Confirmar Sangria"**.
4. **Resultado Esperado:**
   - O Saldo Atual em dinheiro reduz em R$ 100,00.
   - Uma nova linha do tipo **"Saída (Sangria)"** de R$ 100,00 é registrada no extrato.

---

# ETAPA 2: CLIENTES (CADASTRO E HISTÓRICO)

> **Objetivo:** Cadastrar o cliente antes da venda e validar regras de integridade (telefone com DDD e prevenção de duplicidade).

### Teste 2.1: Tentativa com Telefone Inválido (Caso de Exceção)
1. No menu lateral, acesse a aba **"Clientes"**.
2. Clique em **"+ Novo Cliente"**.
3. Preencha:
   - **Nome Completo:** `Carlos Teste Erro`
   - **Telefone:** `123456` *(menos de 10 dígitos, sem DDD)*
4. Clique em **"Salvar Cliente"**.
5. **Resultado Esperado:** O sistema bloqueia o salvamento e exibe mensagem de alerta informando que o telefone deve ter DDD + 8 ou 9 dígitos.

### Teste 2.2: Cadastro Válido de Cliente para o Teste
1. Corrija os dados ou preencha:
   - **Nome Completo:** `Juliana Souza Rocha`
   - **Telefone:** `(77) 99876-5432` *(Telefone válido com DDD)*
   - **CPF (Opcional):** `123.456.789-00`
   - **E-mail (Opcional):** `juliana.rocha@email.com`
2. Clique em **"Salvar Cliente"**.
3. **Resultado Esperado:**
   - O cliente `Juliana Souza Rocha` aparece no topo da lista de clientes.
   - O **Total Comprado (LTV)** inicial deve ser **R$ 0,00**.
   - O campo **Última Compra** deve constar como "Nenhuma compra registrada".

---

# ETAPA 3: PDV — NOVA VENDA (CHECKOUT INTEGRADO)

> **Objetivo:** Realizar uma venda completa com cálculo de desconto, troco e baixa de estoque real.

### Teste 3.1: Alerta de Caixa Fechado (Trava Operacional)
1. *(Se o caixa estiver fechado)*: O PDV exibirá um banner vermelho de aviso no topo:  
   *"Atenção: O Caixa da Loja está Fechado"*, com botão rápido para abrir.
2. Certifique-se de que o caixa está aberto para seguir para a venda.

### Teste 3.2: Seleção de Cliente e Adição de Aparelho
1. Acesse o menu **"PDV / Checkout"** (ou **"Nova Venda"**).
2. No campo **"Cliente da Venda"**:
   - Comece a digitar `Juliana` no campo de busca.
   - O dropdown mostrará `Juliana Souza Rocha - (77) 99876-5432`.
   - Clique sobre o cliente para autocompletar.
3. No campo de produtos/aparelhos:
   - Selecione um iPhone disponível no catálogo (ex: `iPhone 13 128GB Meia-noite`).
   - Verifique que o valor unitário e o IMEI são carregados no carrinho.
4. Adicione um acessório se desejar (ex: `Capa MagSafe + Película`).
5. Informe um **Desconto**: `R$ 50,00`.
6. Observe o cálculo automático:
   - `Subtotal: R$ 2.890,00`
   - `Desconto: - R$ 50,00`
   - `Total da Venda: R$ 2.840,00`

### Teste 3.3: Pagamento em Dinheiro e Cálculo do Troco
1. Na lateral direita de pagamento, selecione **"Dinheiro"**.
2. No campo **"Valor Recebido do Cliente"**, digite: `3000,00`.
3. **Resultado Esperado:**
   - O sistema exibe em destaque verde: **"Troco a Devolver: R$ 160,00"**.
   - O botão **"Finalizar Venda"** fica habilitado.

### Teste 3.4: Finalização, Prevenção de Duplo Clique e Comprovante
1. Clique no botão **"Finalizar Venda"**.
2. **Resultado Esperado:**
   - O botão muda instantaneamente para **"Processando..."** e fica desabilitado (impede clique duplo).
   - Abre-se o **Comprovante de Venda** contendo:
     - Número do pedido (ex: `VD-2093`)
     - Nome da cliente (`Juliana Souza Rocha`)
     - Itens, IMEI, desconto, total e troco calculado.
     - Botão **"Imprimir Comprovante"** (dispara layout de impressão).
     - Botão **"Enviar Comprovante via WhatsApp"** (abre conversa formatada).
3. Feche o comprovante. O carrinho é limpo e volta pronto para a próxima venda.

---

# ETAPA 4: VERIFICAÇÃO CRUZADA ENTRE MÓDULOS (O TESTE DE INTEGRIDADE)

> **Essa é a etapa mais importante.** A venda finalizada precisa ter repercutido em **todos** os outros módulos do sistema.

### Teste 4.1: Conferir Baixa no Estoque
1. Acesse a aba **"Estoque"** (ou **"Vitrine"**).
2. Pesquise pelo modelo ou IMEI do aparelho vendido no Teste 3.
3. **Resultado Esperado:** O status do aparelho mudou de **"Disponível"** para **"Vendido"** (`sold`), não permitindo nova venda com o mesmo IMEI.

### Teste 4.2: Conferir Entrada no Fluxo de Caixa
1. Acesse a aba **"Caixa e vendas"** / **"Fluxo de Caixa"**.
2. Verifique o saldo e o extrato:
   - O saldo em dinheiro aumentou no valor da venda.
   - No extrato de movimentações, existe uma nova entrada:
     - **Tipo:** Entrada
     - **Categoria:** Venda (PDV)
     - **Descrição:** Venda VD-XXXX — Juliana Souza Rocha
     - **Valor:** R$ 2.840,00
     - **Forma:** Dinheiro

### Teste 4.3: Conferir Atualização no Cadastro de Clientes (LTV)
1. Acesse a aba **"Clientes"**.
2. Localize `Juliana Souza Rocha`.
3. **Resultado Esperado:**
   - O **Total Comprado (LTV)** agora é **R$ 2.840,00** (não é mais zero).
   - A **Última Compra** exibe a data de hoje.

### Teste 4.4: Conferir Gatilhos Automáticos no Pós-Venda
1. Acesse a aba **"Pós-venda"**.
2. **Resultado Esperado:**
   - Foram criadas automaticamente tarefas agendadas para `Juliana Souza Rocha`:
     - **D+15:** Acompanhamento de experiência e oferta de acessórios adicionais.
     - **D+180:** Check-up gratuito de saúde da bateria.
     - **D+360:** Oferta de Trade-In e Upgrade para nova geração.
   - O botão de WhatsApp ao lado da tarefa abre mensagem pré-configurada para a cliente.

---

# ETAPA 5: VENDAS (HISTÓRICO, DETALHES E CANCELAMENTO/ESTORNO)

> **Objetivo:** Auditar o histórico, consultar detalhes e testar o estorno financeiro e reposição de estoque.

### Teste 5.1: Filtros e Pesquisa
1. Acesse a aba **"Histórico de Vendas"** (ou **"Vendas"**).
2. Teste a busca pelo número da venda ou pelo nome `Juliana`.
3. Alterne os filtros de período: **"Hoje"**, **"7 dias"**, **"Este mês"**.
4. **Resultado Esperado:** A venda é localizada instantaneamente.

### Teste 5.2: Modal de Detalhes da Venda
1. Na linha da venda de Juliana, clique no botão **"Ver Detalhes"** (ícone de olho).
2. **Resultado Esperado:** Abre modal completo mostrando cliente, telefone, vendedor, itens, IMEI, desconto, forma de pagamento e status **"Concluída"**.

### Teste 5.3: Cancelamento e Estorno da Venda (Teste Crítico)
1. No histórico de vendas, clique no botão **"Estornar"** (ou **"Cancelar Venda"**).
2. Um modal de confirmação solicitará:
   - **Motivo do Cancelamento:** Digite `Desistência da cliente dentro do prazo legal`.
3. Clique em **"Confirmar Estorno e Devolução"**.
4. **Resultado Esperado no Histórico:**
   - A venda agora exibe a tag vermelha **"Cancelada"**.
   - O valor não entra mais como faturamento líquido positivo.

### Teste 5.4: Verificação Cruzada do Estorno (Garantia de Não Deixar Lixo)
1. **No Estoque:** O aparelho vendido volta automaticamente para o status **"Disponível"** e pode ser vendido novamente.
2. **No Caixa / Fluxo:** É gerada uma linha de contrapartida:
   - **Tipo:** Saída (Estorno)
   - **Valor:** R$ 2.840,00
   - O saldo atual do caixa é deduzido corretamente.
3. **No Cliente:** O LTV de `Juliana Souza Rocha` é reduzido, deduzindo a venda cancelada.

---

# ETAPA 6: FECHAMENTO DE CAIXA (CONFERÊNCIA CEGA)

> **Objetivo:** Encerrar o turno com apuração de sobra ou falta de dinheiro vivo sem distorcer o histórico de vendas.

### Teste 6.1: Fechamento com Saldo Correto
1. Acesse a aba **"Caixa e vendas"**.
2. Clique no botão vermelho **"Encerrar / Fechar Caixa"**.
3. O modal de **Fechamento de Caixa** solicitará a contagem do dinheiro físico em gaveta.
4. Digite o valor real contado:
   - O sistema compara: `Saldo Esperado vs. Saldo Contado`.
   - Se os valores baterem: Exibe indicador verde **"Caixa Conciliado (Diferença: R$ 0,00)"**.
   - Se faltar dinheiro: Exibe aviso amarelo/vermelho com o valor da diferença (**Falta** ou **Sobra**).
5. Clique em **"Confirmar Fechamento"**.
6. **Resultado Esperado:**
   - O status do caixa muda para **"Fechado"**.
   - O PDV passa a alertar que o caixa está fechado para o próximo operador.

---

## 📋 TABELA DE SÍNTESE PARA O TESTADOR (CHECKLIST RÁPIDO)

| # | Item de Teste | Ação Executada | Resultado Esperado | Status |
| :-: | :--- | :--- | :--- | :---: |
| **01** | Suprimento | Adicionar R$ 150 de troco | Saldo em dinheiro sobe e log gravado | [ ] Aprovado |
| **02** | Sangria | Retirar R$ 100 para despesa | Saldo em dinheiro cai e log gravado | [ ] Aprovado |
| **03** | Validação Cliente | Digitar telefone sem DDD | Sistema bloqueia com aviso | [ ] Aprovado |
| **04** | Cadastro Cliente | Salvar Juliana com DDD correto | Cliente salva com LTV R$ 0,00 | [ ] Aprovado |
| **05** | PDV - Dinheiro | Venda com valor entregue maior | Troco calculado com precisão | [ ] Aprovado |
| **06** | PDV - Conclusão | Clicar em finalizar venda | Trava de duplo clique + Comprovante | [ ] Aprovado |
| **07** | Baixa Estoque | Consultar IMEI vendido | Status muda para `sold` | [ ] Aprovado |
| **08** | LTV do Cliente | Consultar cliente pós-venda | Total comprado atualizado com a venda | [ ] Aprovado |
| **09** | Pós-Venda | Conferir gatilhos | Tarefas D+15, D+180 criadas no nome dela | [ ] Aprovado |
| **10** | Estorno Venda | Cancelar venda com justificativa | Estoque reverte, caixa estorna e LTV reduz | [ ] Aprovado |
| **11** | Fechamento Caixa | Conferência cega de dinheiro | Apuração de sobra/falta calculada | [ ] Aprovado |

---

**Observações para o Testador:**
- Caso algum passo não responda como descrito, anote o número do passo e a mensagem de erro que apareceu na tela para correção imediata pela equipe de desenvolvimento.
- O sistema opera conectado à base de dados real Supabase, sem dados fictícios na memória do navegador.
