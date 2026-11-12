# Auditoria de Integridade Operacional — CRM Hiago

Data da auditoria: 12/11/2026

## Resultado executivo

Os dois defeitos relatados foram reproduzidos por inspeção do fluxo e tiveram suas causas confirmadas no código.

- O estorno retornava sucesso sem verificar erros do Supabase, podia executar apenas parte das reversões e alterava o estado da interface mesmo sem persistência.
- O cadastro de acessórios criava um registro somente em memória quando o `INSERT` falhava. O modal fechava antes da conclusão e o PDV consumia uma lista fixa, desconectada da tabela `products`.

As correções desta etapa eliminam esses sucessos falsos, conectam o catálogo persistido ao PDV, excluem vendas estornadas dos indicadores e fornecem uma migração transacional/idempotente para estorno, estoque de acessórios e ajustes manuais.

## Correções aplicadas

### Estorno de venda

- O frontend chama `cancel_sale_transaction` e só confirma a operação após reler a venda com `status = cancelled`.
- Motivo mínimo é validado.
- Estorno duplicado é bloqueado por estado, trava de linha e restrição única.
- O banco registra `sale_reversals` sem apagar a venda original.
- A mesma transação recompõe aparelhos e acessórios, registra caixa, reverte lançamentos/recebíveis, corrige saldo financeiro, ajusta LTV e cancela comissões ainda não pagas.
- Comissões já pagas são preservadas e geram um ajuste pendente rastreável.
- Tarefas pendentes de pós-venda são canceladas.
- O frontend relê vendas e atualiza os demais módulos após a confirmação.

### Produtos e acessórios

- Cadastro não gera mais objeto local quando o Supabase falha.
- O modal aguarda a resposta, bloqueia envio duplicado e mostra o erro real.
- O produto precisa voltar na leitura de confirmação antes de a UI concluir o cadastro.
- O PDV usa os produtos ativos persistidos, em vez de `INITIAL_ACCESSORIES`.
- O cadastro com saldo inicial gera movimentação de estoque na mesma transação.
- Ajustes de estoque são transacionais, bloqueiam saldo negativo e registram movimento.
- Itens de venda guardam `product_id`; a baixa de acessório ocorre no banco e o estorno usa esse vínculo para recompor a quantidade correta.

### Indicadores

- Dashboard principal ignora vendas canceladas e aplica o período selecionado.
- Inteligência financeira ignora vendas canceladas.
- Foram removidos faturamento, CMV, volumes, margens e despesas fictícios usados quando o valor real era zero.
- Rentabilidade por categoria usa os itens reais e custos encontrados no catálogo/estoque.
- O rótulo mensal deixou de estar fixo em outubro de 2026.

### Carregamento e falhas

- Uma falha em um módulo não impede a leitura dos demais (`Promise.allSettled`).
- Em modo Supabase, vendas, clientes, aparelhos e ordens não iniciam mais mostrando dados de demonstração como se fossem reais.
- Falhas de leitura são registradas separadamente no estado de saúde do banco.

## Migração obrigatória

Aplicar `docs/supabase_integridade_operacional.sql` no SQL Editor do Supabase antes de publicar o frontend. O frontend falha de forma explícita se as RPCs ainda não existirem; ele não simula sucesso.

Recomenda-se executar a migração primeiro em um projeto de homologação e validar:

1. cadastro de produto com estoque zero;
2. cadastro com saldo inicial e respectivo movimento;
3. venda de acessório e baixa;
4. estorno e reposição;
5. repetição do mesmo estorno, que deve ser recusada;
6. venda à vista e parcelada com reflexos em caixa/financeiro;
7. comissão pendente e comissão já paga.

## Riscos críticos ainda abertos

### P0 — Isolamento de empresa e permissões

Os schemas Supabase atuais criam políticas `FOR ALL ... USING (true)`. Os repositórios também não enviam `store_id` de forma consistente. Portanto, o isolamento multiempresa e a autorização de estorno ainda não podem ser considerados seguros. A migração mantém `SECURITY INVOKER`, mas herda as políticas permissivas existentes.

Correção necessária: vincular `auth.uid()` a usuário/loja, exigir `store_id NOT NULL`, criar políticas por empresa e validar a permissão `sales.cancelSale` no servidor/banco. Isso exige uma decisão de identidade e migração de dados; não deve ser presumido diretamente em produção.

### P0 — Finalização de venda ainda não é uma única transação

`SaleRepository.create` ainda grava venda, itens, aparelhos, trade-in, caixa, cliente e pós-venda em chamadas separadas. `FinancialRepository.syncFromSale` ocorre depois. Uma falha intermediária pode deixar uma venda parcialmente concluída.

Correção necessária: mover toda a finalização para uma RPC transacional com chave de idempotência e restrições únicas. A regra de momento financeiro (à vista, cartão, recebível e caixa) precisa ser confirmada antes dessa migração.

### P0 — Persistência financeira híbrida

Contas, títulos, lançamentos e comissões ainda usam `localStorage` como fallback e várias escritas não verificam o objeto `error` retornado pelo Supabase. Isso pode mostrar saldo, pagamento ou comissão que só existe no navegador.

Correção necessária: remover fallback silencioso em produção, confirmar cada mutation com `select`, adicionar chaves únicas de origem/referência e transacionar saldo com o lançamento.

### P1 — Outros repositórios com sucesso local falso

Peças, fornecedores, compras, garantias, serviços, usuários, ponto e configurações repetem o padrão de capturar erro, atualizar memória/localStorage e retornar sucesso. Eles devem receber o mesmo contrato aplicado a produtos: persistir, reler/confirmar e só então atualizar a interface.

### P1 — Assistência técnica e estoque

Mudanças de status de O.S., consumo/devolução de peças e geração financeira são chamadas separadas e alguns erros são apenas registrados no console. É necessário um fluxo transacional por transição de estado.

### P1 — Divergência de schemas

`server/src/db/schema.sql` e os schemas em `docs/supabase_schema_*.sql` descrevem modelos diferentes de vendas, usuários e tenancy. É preciso eleger um schema canônico e gerar migrações versionadas a partir dele.

### P1 — Teste comercial aponta para banco remoto

`server/src/test/commercial_audit.test.ts` contém URL/chave de um Supabase e cria/remove dados reais via REST. Ele não roda no script padrão atual, mas não deve ser executado contra produção. Mover para um projeto efêmero de testes e exigir variáveis de ambiente explícitas.

## Validação executada

- `npm run build`: aprovado.
- `npm --prefix client run lint`: aprovado sem erros; permanecem avisos preexistentes de hooks, pureza e catches não utilizados.
- `git diff --check`: aprovado.
- `npm test`: 8 testes do Sprint 1 aprovados.

## Critério de conclusão operacional

Os bugs 001 e 002 ficam corrigidos no código, mas o estorno e as novas operações transacionais só estarão ativos após a migração obrigatória no Supabase. A auditoria global não deve ser declarada encerrada enquanto os itens P0 acima não forem migrados e testados em homologação com perfis de duas empresas diferentes.
