# CONCEPTUAL DATA & FLOWS: MODELAGEM CONCEITUAL DE DOMÍNIO E FLUXOS DE PRODUTO

---

## 1. Modelo Conceitual de Domínio (Entidades de Negócio)

```mermaid
erDiagram
    LOJA ||--o{ USUARIO : possui
    LOJA ||--o{ CLIENTE : mantem
    LOJA ||--o{ TAXA_MAQUININHA : configura
    LOJA ||--o{ REGUA_AUTOMACAO : define

    CLIENTE ||--o{ OPORTUNIDADE : gera
    CLIENTE ||--o{ APARELHO_CLIENTE : possui
    CLIENTE ||--o{ MENSAGEM : troca

    USUARIO ||--o{ OPORTUNIDADE : atende
    USUARIO ||--o{ MENSAGEM : envia_recebe

    OPPORTUNIDADE ||--o| VENDA_CONCLUIDA : resulta_em
    VENDA_CONCLUIDA ||--o| APARELHO_CLIENTE : registra_compra
    VENDA_CONCLUIDA ||--o| APARELHO_TROCA : aceita_trade_in
```

### 1.1 Descrição das Entidades Conceituais de Negócio

1. **Loja (Tenant):** O estabelecimento comercial de celulares. Agrupa a conta comercial oficial de WhatsApp (WABA), as regras de negócio, a escala de vendedores e as taxas de máquina de cartão.
2. **Usuário (Operador / Vendedor / Gerente):** Membro da equipe da loja com perfil de acesso definido (Admin, Gerente ou Vendedor) e status de disponibilidade na roleta.
3. **Cliente (Consumidor Final):** Contato associado a um número de telefone com histórico acumulado de compras, modelos de smartphone possuídos, tags de preferência e status de consentimento (Opt-in / Opt-out).
4. **Oportunidade (Lead / Negociação no Kanban):** Registro temporário do ciclo de venda, com modelo de interesse, valor potencial, vendedor responsável, etapa atual do funil e motivo de perda (quando aplicável).
5. **Aparelho do Cliente (Device Lifecycle):** Registro físico do smartphone do cliente com marca, modelo, capacidade de armazenamento, condição (novo ou seminovo), IMEI e saúde da bateria no momento da venda. É a entidade que dispara as réguas preditivas de pós-venda.
6. **Venda Concluída:** Registro da transação com data de entrega, valor final, forma de pagamento, comissão e link com o termo de garantia emitido.
7. **Régua de Automação:** Definição do gatilho temporal (D+0, D+15, D+180, D+360), modelo de template oficial da Meta associado e condições de disparo.

---

## 2. Diagrama Conceitual de Estados: Ciclo de Vida da Oportunidade (Lead)

```mermaid
stateDiagram-v2
    [*] --> NovoLead: Mensagem recebida no WhatsApp
    NovoLead --> EmAtendimento: Roleta atribui ao vendedor
    EmAtendimento --> QualificandoModelo: Vendedor identifica interesse
    QualificandoModelo --> AvaliandoTradeIn: Cliente oferece aparelho na troca
    QualificandoModelo --> PropostaEnviada: Sem aparelho na troca
    AvaliandoTradeIn --> PropostaEnviada: Calculadora simula saldo e parcelas
    PropostaEnviada --> NegociandoDecisao: Cliente analisa proposta
    
    NegociandoDecisao --> VendaConcluida: Cliente aceita e fecha compra
    NegociandoDecisao --> Perdido: Cliente desiste ou não responde
    
    VendaConcluida --> PosVendaAtivo: Alimenta Ficha do Aparelho
    Perdido --> ResgateProgramado: Gatilho automático em D+2 e D+5
    ResgateProgramado --> EmAtendimento: Cliente reengaja
    ResgateProgramado --> Arquivado: Sem resposta definitiva
```

---

## 3. Diagrama Conceitual de Estados: Ciclo de Vida do Aparelho (Device Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> AparelhoEntregue: Venda Concluída no Sistema
    
    AparelhoEntregue --> FaseGarantiaInicial: D+0 (Envio de Termo de Garantia)
    FaseGarantiaInicial --> FaseCrossSellAcessorios: D+15 (Oferta de Fonte/Capa)
    
    FaseCrossSellAcessorios --> UsoRegular: D+30 a D+179
    
    UsoRegular --> RevisaoPreventiva: D+180 (Checkup de Bateria e Limpeza)
    RevisaoPreventiva --> UsoAvancado: D+181 a D+359 (Degradação natural)
    
    UsoAvancado --> JanelaUpgradePreditivo: D+360 (Campanha de Troca por Novo)
    
    JanelaUpgradePreditivo --> NovaOportunidade: Cliente inicia negociação de Upgrade
    NovaOportunidade --> AparelhoEntregue: Ciclo recomeça com novo modelo
```

---

## 4. Fluxo Conceitual de Comunicação com a Meta WhatsApp Cloud API

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Consumidor Final
    participant Meta as Meta WhatsApp Cloud API
    participant SaaS as Plataforma SaaS
    actor Vendedor as Vendedor da Loja

    Cliente->>Meta: Envia mensagem no WhatsApp ("Tem iPhone 13?")
    Meta->>SaaS: Notificação de mensagem recebida
    Note over SaaS: Roleta identifica vendedor disponível da loja
    SaaS->>Vendedor: Alerta na tela e exibe conversa no Inbox
    Vendedor->>SaaS: Digita proposta ou usa Calculadora de 1 Clique
    SaaS->>Meta: Despacho de mensagem na Janela de 24h
    Meta->>Cliente: Entrega proposta no WhatsApp
    
    Note over SaaS: Se cliente fechar a compra...
    Vendedor->>SaaS: Marca como "Venda Concluída" + Dados do Aparelho
    SaaS->>Meta: Dispara D+0 com Termo de Garantia Digital
    Meta->>Cliente: Entrega Termo de Garantia no WhatsApp
```

---

## 5. Diretrizes de Coexistência com ERPs de Mercado

A plataforma opera em regime de **coexistência não-invasiva** com os sistemas ERP existentes na loja (ex: Balcão Phones, Bling, GestorOS):
- O lojista pode manter seu ERP fiscal para emissão de NF-e e controle de estoque de peças.
- A plataforma atua na camada frontal (*front-office*) de relacionamento, atração, fechamento de vendas e retenção preditiva.
- Na V1, a importação inicial de contatos antigos é suportada via arquivo CSV padronizado (com nome, telefone, modelo e data da última compra).
- Nas fases seguintes (V1.5 e V2), conectores via webhooks permitirão a sincronização automática de vendas entre a plataforma e os principais ERPs do setor.
