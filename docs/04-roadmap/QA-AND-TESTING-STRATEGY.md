# QA & TESTING STRATEGY: ESTRATÉGIA DE TESTES E QUALIDADE DE SOFTWARE (V1)

---

## 1. Visão Geral da Pirâmide de Testes

Para assegurar que o sistema opere com zero perda de mensagens no WhatsApp, precisão matemática nas taxas de maquininha e isolamento absoluto entre lojas, a estratégia de garantia da qualidade (QA) adota uma pirâmide de testes balanceada:

```
                  /\
                 /  \
                / E2E \       10% Testes End-to-End (Playwright)
               /───────\      - Fluxos críticos de ponta a ponta
              /         \
             / INTEGRAÇÃO \   30% Testes de Integração (Supertest / Testcontainers)
            /───────────────\ - Webhooks Meta (Mock), Filas BullMQ e PostgreSQL RLS
           /                 \
          /    UNITÁRIOS      \ 60% Testes Unitários (Vitest / Jest)
         /─────────────────────\- Cálculos de Juros, Validação E.164, Regras de Roleta
```

---

## 2. Níveis de Teste e Escopo de Validação

### 2.1 Testes Unitários (Cobertura Alvo: ≥ 85% do Core Business)
- **Cálculo da Maquininha e Parcelamento:**
  - Validação da fórmula de antecipação com taxas nominais de 1x a 21x.
  - Validação de arredondamento positivo em centavos (nunca subtrair centavos da loja).
  - Testes com entradas combinadas (Pix + Trade-in com desconto de bateria degradada).
- **Higienização de Números de Telefone:**
  - Conversão de números brasileiros em diversos formatos (`(11) 98765-4321`, `11987654321`, `5511987654321`) para o padrão estrito E.164 (`+5511987654321`).
- **Lógica da Roleta de Atendimento:**
  - Simulação de distribuição sequencial entre 5 vendedores.
  - Validação de exclusão automática de vendedores com status `Pausa` ou que atingiram o teto de 20 conversas abertas.

---

### 2.2 Testes de Integração
- **Isolamento Rigoroso de Multi-Tenancy (RLS Tests):**
  - Criação de dois tenants de teste (`Tenant A` e `Tenant B`).
  - Execução de queries sem cláusula `WHERE` explícita simulando requisições com o token do `Tenant A`.
  - **Critério de Aprovação:** O resultado deve retornar zero registros pertencentes ao `Tenant B`. Qualquer retorno cruzado falha a esteira de CI/CD imediatamente.
- **Pipeline de Ingestão de Webhooks:**
  - Envio de payloads simulados da Meta para `/webhooks/meta`.
  - Validação de validação de assinatura HMAC SHA256 (rejeição de payloads não assinados com `HTTP 401/403`).
  - Validação de tempo de resposta síncrono (< 100ms) e persistência correta na fila Redis.
- **Desduplicação por WAMID (Idempotência):**
  - Envio do mesmo payload da Meta 3 vezes consecutivas com o mesmo `wamid`.
  - Confirmação de que apenas 1 mensagem é gravada no PostgreSQL e apenas 1 evento é disparado via WebSocket.

---

### 2.3 Testes End-to-End (E2E com Playwright)
Automação de navegadores validando as 3 jornadas mais críticas do usuário:
1. **Jornada de Venda Completa no Inbox:**
   - Login do Vendedor Lucas -> Abertura de conversa atribuída -> Preenchimento da Calculadora -> Envio da Proposta -> Arraste do Card para "Venda Concluída" -> Preenchimento do Modal de Aparelho/IMEI -> Validação de registro gravado.
2. **Jornada de Ingestão CSV:**
   - Login do Dono Rodrigo -> Upload de arquivo CSV com 50 contatos de teste -> Validação da tela de prévia -> Confirmação de importação -> Verificação da fila de clientes com mais de 300 dias pronta para upgrade.

---

## 3. Testes de Carga e Estresse (Stress Testing com k6)

O sistema deve estar preparado para suportar datas de altíssima intensidade (Black Friday e Lançamento anual de iPhones):

| Cenário de Teste | Carga Aplicada | Duração | Métrica Alvo de Sucesso |
| :--- | :--- | :--- | :--- |
| **Pico de Webhooks Recebidos** | 200 webhooks / segundo | 10 minutos | Taxa de sucesso 100% (`HTTP 200`), P95 Latency < 120ms, zero perda de mensagens no Redis. |
| **Concorrência de Vendedores** | 500 vendedores ativos conectados ao WebSocket | 30 minutos | Latência de entrega de mensagens no browser < 600ms, CPU do servidor < 70%. |
| **Disparo em Lote de Réguas** | Fila de 5.000 mensagens de régua D+360 | Contínuo | Rate limiter mantém estritamente 30 msgs/seg por tenant sem rejeição por 429 da Meta. |

---

## 4. Critérios de Homologação para Produção (Quality Gates)

Nenhuma versão do software será promovida para o ambiente de produção se não cumprir 100% dos seguintes critérios:
- [x] Zero testes unitários, de integração ou E2E falhando.
- [x] Cobertura de código superior a 80% nos serviços de cálculo, roleta e regras de negócio.
- [x] Análise estática de segurança (SAST) sem vulnerabilidades críticas ou altas no código ou dependências (`npm audit` / Snyk).
- [x] Teste de isolamento multi-tenant executado e aprovado com sucesso.
- [x] Certificado SSL TLS 1.3 válido e nota mínima A no teste SSL Labs.
