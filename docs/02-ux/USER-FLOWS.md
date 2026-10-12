# USER FLOWS: MAPEAMENTO DE FLUXOS DE INTERAÇÃO E DECISÃO (V1)

---

## 1. Fluxo 1: Atendimento, Qualificação e Envio de Proposta no WhatsApp (Vendedor)

- **Ator:** Vendedor de Balcão / Atendente de WhatsApp (Lucas).
- **Gatilho:** Novo lead envia mensagem no WhatsApp da loja interessado em comprar um smartphone.
- **Objetivo:** Responder em menos de 2 minutos, qualificar necessidade, calcular parcelamento/trade-in e enviar proposta formatada.

```mermaid
graph TD
    A[Lead envia mensagem no WhatsApp] --> B[Roleta atribui ao Vendedor Lucas]
    B --> C[Notificação Sonora + Card Verde no Inbox]
    C --> D[Vendedor abre conversa no /inbox]
    D --> E[Vendedor qualifica interesse: Modelo + GB + Cor]
    E --> F{Cliente tem aparelho na troca?}
    
    F -- Sim --> G[Abre Gaveta Lateral: Aba Trade-in]
    G --> H[Insere dados do Usado: Modelo + % Bateria + Avarias]
    H --> I[Sistema sugere valor de avaliação]
    
    F -- Não --> J[Abre Gaveta Lateral: Calculadora Direta]
    
    I --> K[Vendedor digita valor do Novo + Entrada Pix se houver]
    J --> K
    
    K --> L[Sistema calcula saldo financiado e opções 1x a 21x]
    L --> M[Vendedor clica em 'Enviar Proposta Formatada']
    M --> N[Texto com emojis e opções de parcela cai no chat do WhatsApp]
    N --> O[Card do Lead move automaticamente para 'Proposta Enviada']
```

---

## 2. Fluxo 2: Conclusão de Venda, Registro do Aparelho e Ativação de Pós-Venda

- **Ator:** Vendedor de Balcão (Lucas).
- **Gatilho:** Cliente aceitou a proposta e efetuou o pagamento na loja física ou via motoboy/link.
- **Objetivo:** Registrar a venda em menos de 30 segundos, alimentar a Ficha do Aparelho e acionar o ciclo D+0.

```mermaid
graph TD
    A[Vendedor arrasta Card para 'Venda Concluída'] --> B[Abre Modal Rápido de Finalização]
    B --> C[Vendedor preenche 4 campos obrigatórios]
    
    subgraph "Campos Rápidos (Tempo < 30s)"
    C1[Modelo Vendido: ex: iPhone 14 128GB Estelar]
    C2[Condição: Novo Lacrado ou Seminovo]
    C3[Se Seminovo: % Saúde Bateria ex: 87%]
    C4[IMEI / Serial do Aparelho]
    end
    
    C --> D[Vendedor clica em 'Confirmar e Emitir Garantia']
    D --> E[Sistema cria Ficha Permanente do Aparelho]
    E --> F[Disparo Automático D+0 no WhatsApp do Cliente]
    F --> G[Cliente recebe Termo de Garantia Digital + Dicas de Bateria]
    G --> H[Sistema agenda réguas de D+15, D+180 e D+360]
```

---

## 3. Fluxo 3: Onboarding & Ingestão da Base Histórica via CSV

- **Ator:** Gerente Comercial (Camila) ou Proprietário (Rodrigo).
- **Gatilho:** Primeiro acesso à plataforma ou migração de clientes do ERP anterior (ex: Balcão Phones, Bling).
- **Objetivo:** Importar de 1.000 a 15.000 contatos legados e ativar réguas de reativação imediatamente.

```mermaid
graph TD
    A[Acessa /clientes/importar] --> B[Faz download do template CSV simples]
    B --> C[Preenche ou exporta do ERP legado: Nome, Telefone, Modelo, Data Compra]
    C --> D[Arrasta arquivo CSV para a área de upload]
    D --> E[Motor de Validação executa Pré-análise]
    
    E --> F{Erros encontrados?}
    F -- Sim --> G[Exibe relatório visual: Linhas com telefone inválido corrigidas/destacadas]
    G --> H[Usuário confirma correção ou descarta inválidos]
    
    F -- Não --> I[Exibe Resumo de Ingestão: ex: 3.420 contatos prontos]
    H --> I
    
    I --> J[Usuário clica em 'Processar e Distribuir em Réguas']
    J --> K[Sistema calcula retroatividade: 420 clientes entram na fila D+360 de Upgrade]
    K --> L[Tela de Sucesso com estimativa de potencial de receita a reativar]
```

---

## 4. Fluxo 4: Configuração e Monitoramento de Réguas de Reativação

- **Ator:** Gerente de Loja (Camila).
- **Gatilho:** Rotina semanal de acompanhamento comercial ou ativação de campanhas.
- **Objetivo:** Ajustar parâmetros das réguas nativas e conferir disparos agendados.

```mermaid
graph TD
    A[Acessa /automacoes] --> B[Visualiza cards das 5 Réguas Nativas]
    B --> C[Clica na régua desejada: ex: 'D+360 Upgrade Anual']
    C --> D[Visualiza status: Ativa / Pausada + Volume na fila para os próximos 7 dias]
    D --> E[Visualiza prévia do Template Oficial Meta aprovado]
    E --> F[Ajusta variáveis permitidas: valor de bônus na troca / texto de incentivo]
    F --> G[Clica em 'Salvar Configurações']
    G --> H[Notificação de sucesso: Próximos disparos seguirão os novos parâmetros]
```

---

## 5. Fluxo 5: Acompanhamento de ROI e Performance da Equipe (Dono da Loja)

- **Ator:** Proprietário da Loja (Rodrigo).
- **Gatilho:** Verificação diária ou semanal do retorno financeiro do negócio.
- **Objetivo:** Comprovar que o software está se pagando e auditar o SLA de resposta dos vendedores.

```mermaid
graph TD
    A[Acessa /dashboard pelo celular ou desktop] --> B[Visualiza Card Principal de Destaque]
    
    subgraph "Bloco de ROI em Tempo Real"
    B1[Vendas Recuperadas pelas Réguas no Mês: R$ 42.800]
    B2[Vendas vindas de Indicação: R$ 8.900]
    B3[Custo da Plataforma: R$ 497]
    B4[Multiplicador de Retorno: 104x o investimento]
    end
    
    B --> C[Rola para o Bloco de Desempenho da Equipe]
    C --> D[Visualiza Tabela de Vendedores]
    D --> E[Identifica gargalos: Vendedor com tempo de resposta > 6 min ou taxa de conversão baixa]
    E --> F[Clica no vendedor para ver detalhes de orçamentos pendentes]
```
