# ROTEIRO DE TESTES OPERACIONAIS E HOMOLOGAÇÃO (IMPRESSÃO / AUDITORIA)

**Sistema:** Hiago iPhones ERP & CRM  
**Versão Homologada:** Produção (`https://hiago-iphones.vercel.app`)  
**Data da Aplicação do Teste:** _____/_____/2026  
**Responsável pelo Teste:** __________________________________  
**Unidade / Loja:** _________________________________________  

---

### INSTRUÇÕES PARA O AVALIADOR
1. Siga os passos na ordem sequencial recomendada.
2. No campo **Status**, marque `[X] OK` se o comportamento foi exatamente o esperado, ou `[X] NOK` se ocorreu falha/bloqueio.
3. Se marcar `NOK`, descreva detalhadamente a mensagem de erro ou comportamento inesperado no campo **Anotação de Erro**.
4. Este documento foi diagramado em formato compatível com impressão (A4).

---

## BLOCO 1: PREPARAÇÃO INICIAL E CONTROLE DE CAIXA

### Teste 1.1 — Abertura do Caixa Diário
* **Caminho no Sistema:** `Menu Lateral ➔ Gestão ➔ Controle de Caixa`
* **Ação a Executar:**
  1. Verificar se o caixa está fechado.
  2. Clicar no botão **"Abrir Caixa"**.
  3. Informar o saldo inicial em dinheiro (Ex: `R$ 100,00`) e o operador responsável.
  4. Confirmar a abertura.
* **Resultado Esperado:** O status do caixa muda para **"Aberto"**, exibe o saldo inicial e habilita o registro de vendas do dia.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## BLOCO 2: CADASTRO DE CLIENTES

### Teste 2.1 — Cadastro e Consulta de Cliente
* **Caminho no Sistema:** `Menu Lateral ➔ Cadastros ➔ Clientes`
* **Ação a Executar:**
  1. Clicar em **"Novo Cliente"**.
  2. Preencher: Nome (`Cliente Teste Homologação`), Telefone/WhatsApp (`(77) 99999-0000`) e CPF.
  3. Clicar em **"Salvar"**.
  4. Localizar o cliente recém-cadastrado na barra de pesquisa.
* **Resultado Esperado:** Cliente salvo sem erros, exibido na lista e disponível para vinculação imediata em vendas e OS.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## BLOCO 3: ENTRADA DE ESTOQUE (IPHONES E ACESSÓRIOS)

### Teste 3.1 — Entrada de iPhone no Estoque
* **Caminho no Sistema:** `Menu Lateral ➔ Estoque & Vitrine ➔ Aparelhos`
* **Ação a Executar:**
  1. Clicar em **"Cadastrar Aparelho"**.
  2. Preencher: Modelo (`iPhone 13 128GB`), Cor (`Meia-Noite`), Condição (`Seminovo`), Saúde da Bateria (`89%`).
  3. Informar um IMEI único de teste (Ex: `359876543210123`).
  4. Informar Preço de Custo (`R$ 2.200,00`) e Preço de Venda (`R$ 3.100,00`).
  5. Clicar em **"Salvar Aparelho"**.
* **Resultado Esperado:** O aparelho é inserido com status **"Disponível"** e passa a aparecer imediatamente na vitrine/estoque com IMEI pesquisável.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

### Teste 3.2 — Entrada de Acessório / Produto Físico
* **Caminho no Sistema:** `Menu Lateral ➔ Estoque & Vitrine ➔ Produtos / Acessórios`
* **Ação a Executar:**
  1. Clicar em **"Cadastrar Produto"**.
  2. Preencher: Nome (`Fonte Carregador 20W USB-C`), SKU (`FNT-20W-HOMOLOG`), Categoria (`Carregador`).
  3. Definir Preço Custo (`R$ 40,00`), Preço Venda (`R$ 120,00`) e Estoque Inicial (`10`).
  4. Clicar em **"Cadastrar Produto"**.
* **Resultado Esperado:** Produto registrado no catálogo com estoque `10 un` e movimentação de saldo inicial gerada.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## BLOCO 4: OPERAÇÃO COMERCIAL / FRENTE DE CAIXA (PDV)

### Teste 4.1 — Venda de iPhone (Baixa por IMEI)
* **Caminho no Sistema:** `Menu Lateral ➔ Vendas & PDV ➔ Nova Venda`
* **Ação a Executar:**
  1. Selecionar o cliente cadastrado no Teste 2.1.
  2. No campo de busca de itens, selecionar o iPhone cadastrado no Teste 3.1 pelo IMEI.
  3. Escolher a forma de pagamento: **Pix** ou **Cartão**.
  4. Clicar em **"Finalizar Venda"**.
* **Resultado Esperado:**
  - Venda finalizada com sucesso gerando número de pedido.
  - O iPhone muda automaticamente seu status para **"Vendido"** no estoque.
  - O valor da venda é lançado automaticamente nas entradas do caixa aberto.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

### Teste 4.2 — Venda de Acessório (Baixa Quantitativa)
* **Caminho no Sistema:** `Menu Lateral ➔ Vendas & PDV ➔ Nova Venda`
* **Ação a Executar:**
  1. Iniciar nova venda.
  2. Adicionar o produto `Fonte Carregador 20W USB-C` (Quantidade: `2 un`).
  3. Finalizar a venda no Dinheiro.
  4. Ir até `Estoque ➔ Produtos` e verificar o saldo do item.
* **Resultado Esperado:** O saldo atual do produto diminui de `10 un` para `8 un` imediatamente, sem erros de estoque insuficiente.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## BLOCO 5: ASSISTÊNCIA TÉCNICA E ORDENS DE SERVIÇO

### Teste 5.1 — Abertura de Ordem de Serviço (OS)
* **Caminho no Sistema:** `Menu Lateral ➔ Serviços ➔ Assistência Técnica`
* **Ação a Executar:**
  1. Clicar no botão **"Nova Ordem de Serviço"** (ou `+ Nova OS`).
  2. Vincular o cliente cadastrado.
  3. Informar dados do aparelho: Modelo (`iPhone 11`), Defeito Reclamado (`Tela quebrada e sem touch`).
  4. Preencher o Checklist Inicial de Entrada (ex: carcaça arranhada, Face ID funcional).
  5. Salvar a OS.
* **Resultado Esperado:** OS criada com número sequencial único (ex: `OS-0001`), status **"Aberta"** ou **"Em Análise"** e checklist registrado.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

### Teste 5.2 — Orçamento, Troca de Status e Conclusão da OS
* **Caminho no Sistema:** `Menu Lateral ➔ Serviços ➔ Assistência Técnica`
* **Ação a Executar:**
  1. Abrir a OS criada no Teste 5.1.
  2. Adicionar o serviço/peça: `Troca de Display Frontal` (Valor: `R$ 450,00`).
  3. Alterar o status para **"Aprovado pelo Cliente"** ➔ depois para **"Em Manutenção"**.
  4. Finalizar o reparo e marcar como **"Pronto / Concluído"**.
* **Resultado Esperado:** Linha do tempo da OS registra a troca de técnicos/status e o valor total fica pronto para faturamento/entrega.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

### Teste 5.3 — Entrega e Faturamento da OS
* **Caminho no Sistema:** `Assistência Técnica ➔ Detalhe da OS`
* **Ação a Executar:**
  1. Clicar em **"Entregar Aparelho / Finalizar Pagamento"**.
  2. Selecionar o método de pagamento (Ex: Cartão de Débito `R$ 450,00`).
  3. Confirmar a entrega.
* **Resultado Esperado:** Status da OS muda para **"Entregue"**, gera recibo com termo de garantia e lança a receita no fluxo de caixa.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## BLOCO 6: INTEGRIDADE OPERACIONAL E ESTORNO (TESTE DE SEGURANÇA)

### Teste 6.1 — Estorno de Venda e Devolução ao Estoque
* **Caminho no Sistema:** `Menu Lateral ➔ Vendas & PDV ➔ Histórico de Vendas`
* **Ação a Executar:**
  1. Localizar a venda do iPhone realizada no Teste 4.1.
  2. Clicar na opção **"Cancelar / Estornar Venda"**.
  3. Informar o motivo obrigatório (mínimo 5 letras, ex: `Devolução por desistência do cliente`).
  4. Confirmar o estorno.
* **Resultado Esperado:**
  - Venda marcada como **"Cancelada / Estornada"**.
  - O iPhone retorna automaticamente para o status **"Disponível"** no estoque.
  - É lançado um estorno de saída no Caixa sem duplicidade.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## BLOCO 7: FECHAMENTO DE CAIXA E AUDITORIA

### Teste 7.1 — Conferência e Fechamento do Caixa
* **Caminho no Sistema:** `Menu Lateral ➔ Gestão ➔ Controle de Caixa`
* **Ação a Executar:**
  1. Verificar o relatório de entradas e saídas do dia.
  2. Conferir se os totais de Dinheiro, Pix e Cartão batem com as vendas e OS finalizadas.
  3. Clicar em **"Fechar Caixa"**.
* **Resultado Esperado:** O caixa é encerrado com saldo final consolidado, impedindo novas vendas sem reabertura.
* **Validação:**
  - [ ] **OK** &nbsp;&nbsp;&nbsp;&nbsp; [ ] **NOK (Erro)**
* **Anotação de Erro / Observações:**
  ```text
  __________________________________________________________________________________
  __________________________________________________________________________________
  ```

---

## RESUMO DA AVALIAÇÃO

* **Total de Testes Realizados:** 10
* **Total Aprovados [OK]:** ______
* **Total Reprovados [NOK]:** ______
* **Taxa de Sucesso:** ______%

### Parecer do Responsável:
`[ ] APROVADO PARA OPERAÇÃO REAL` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `[ ] BLOQUEADO / REQUER AJUSTES`

**Assinatura do Testador:** _______________________________________ **Data:** _____/_____/2026
