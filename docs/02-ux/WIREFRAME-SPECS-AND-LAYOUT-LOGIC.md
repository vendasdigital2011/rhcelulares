# WIREFRAME SPECS & LAYOUT LOGIC: ESPECIFICAÇÃO CONCEITUAL DE INTERFACE (V1)

---

## 1. Princípios de Design & Ergonomia para o Varejo de Celulares

1. **Densidade e Alta Velocidade:** O vendedor opera dezenas de negociações simultâneas. A interface deve priorizar visualização compacta de dados sem rolagem excessiva.
2. **SLA Cromático Imediato:** O cérebro do atendente e do gerente deve identificar gargalos instantaneamente através de codificação de cores:
   - 🟢 **Verde:** Conversa respondida ou aguardando resposta há menos de 2 minutos.
   - 🟡 **Amarelo:** Conversa sem resposta entre 2 e 5 minutos (atenção).
   - 🔴 **Vermelho:** Conversa sem resposta há mais de 5 minutos (risco crítico de perda).
3. **PWA Mobile Touch-Friendly:** Em celulares (iPhone/Android dos vendedores), todas as ações primárias (botão de proposta, calculadora, troca de status) devem estar posicionadas na metade inferior da tela (zona do polegar).

---

## 2. Layout da Tela Principal: Inbox Comercial de 3 Colunas (`/inbox`)

Em telas desktop/notebook, a interface adota a estrutura consagrada de 3 colunas integradas com foco na venda:

```
┌─────────────────┬──────────────────────────────────┬─────────────────────────────┐
│ COLUNA 1 (25%)  │ COLUNA 2 (50%)                   │ COLUNA 3 (25%)              │
│ FILA & CONVERSAS│ CHAT ATIVO & MENSAGENS           │ GAVETA DE VENDA ASSISTIDA   │
├─────────────────┼──────────────────────────────────┼─────────────────────────────┤
│ [Buscar Lead..] │ CABEÇALHO DO CHAT:               │ ABA 1: [CALCULADORA DE 1-CL]│
│ [Filtro Vendedor│ • Nome: Carlos Eduardo           │ • Aparelho: iPhone 14 128GB │
│ [🔴 2 | 🟡 4]   │ • Telefone: (11) 98765-4321      │ • Valor: R$ 3.899,00        │
│ ────────────────│ • Responsável: Lucas             │ ─────────────────────────── │
│ [Card 1] 🔴 6m  │ • Etapa: [Avaliando Trade-in ▼]  │ TRADE-IN (APARELHO USADO):  │
│ Carlos Eduardo  │ ──────────────────────────────── │ • Modelo: iPhone 11 64GB    │
│ "Faz quanto..?" │ ÁREA DE MENSAGENS:               │ • Bateria: [ 82% ]          │
│ ────────────────│ [Cliente 14:22]                  │ • Avaliação Sugerida:       │
│ [Card 2] 🟡 3m  │ Quanto fica dando meu 11 na      │   - R$ 1.300,00             │
│ Mariana Silva   │ troca e o resto em 12x?          │ ─────────────────────────── │
│ "Tem branco?"   │                                  │ ENTRADA NO PIX:             │
│ ────────────────│ [Vendedor 14:23]                 │ • Valor: R$ 500,00          │
│ [Card 3] 🟢 1m  │ Opa Carlos! Vou simular agora    │ ─────────────────────────── │
│ João Paulo      │ mesmo para você, um minuto!      │ SIMULAÇÃO DE PARCELAMENTO:  │
│ [Audio 0:15]    │                                  │ • Saldo Cartão: R$ 2.099,00 │
│                 │                                  │ • 6x de R$ 381,20           │
│                 │                                  │ • 10x de R$ 237,50          │
│                 │                                  │ • 12x de R$ 202,60          │
│                 │                                  │ • 18x de R$ 142,10          │
│                 │ ──────────────────────────────── │ ─────────────────────────── │
│                 │ CAMPO DE TEXTO:                  │ [ 📋 COPIAR / ENVIAR CHAT ] │
│                 │ [Digitar resposta ou /atalho... ]│                             │
│                 │ [ Anexar Foto ] [ Enviar Áudio ] │ ABA 2: [DADOS DO CLIENTE]   │
└─────────────────┴──────────────────────────────────┴─────────────────────────────┘
```

---

## 3. Layout do Pipeline Kanban Especializado (`/pipeline`)

O Kanban é estruturado especificamente para as fases de negociação de celulares:

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ NOVO LEAD    │ QUALIFICANDO │ AVALIANDO    │ PROPOSTA     │ AGUARDANDO   │ VENDA        │
│ (8 leads)    │ MODELO (5)   │ TRADE-IN (3) │ ENVIADA (6)  │ DECISÃO (4)  │ FECHADA (12) │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ [Card Lead]  │ [Card Lead]  │ [Card Lead]  │ [Card Lead]  │ [Card Lead]  │ [Card Lead]  │
│ Bruno Dias   │ Aline Souza  │ Carlos Ed.   │ Felipe Melo  │ Larissa Vaz  │ Marcos Lima  │
│ Origem: Meta │ Busca: 13 Pro│ Tem: iP 11   │ iP 14 128GB  │ Aguarda Cart.│ iP 15 Pro Max│
│ Resp: Lucas  │ R$ 4.200     │ Aval: R$ 1.3k│ Proposta 12x │ Visita 16h   │ R$ 6.499     │
│ ⏱️ 2m        │ ⏱️ 15m       │ ⏱️ 25m       │ ⏱️ 1h        │ ⏱️ 3h        │ ⏱️ Hoje      │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

- **Ação de Arraste para "Perdido":** Uma zona de descarte surge no rodapé com o rótulo **"Arrastar aqui para Descartar / Perdido"**. Ao soltar o card sobre essa área, dispara-se o modal obrigatório de motivo de perda.

---

## 4. Modal Rápido de Conclusão de Venda e Registro do Aparelho

Ao mover um card para **"Venda Fechada"**, surge uma janela modal leve, desenhada para ser preenchida em menos de 30 segundos pelo vendedor:

```
┌────────────────────────────────────────────────────────┐
│  🎉 PARABÉNS PELA VENDA! REGISTRO DO APARELHO          │
├────────────────────────────────────────────────────────┤
│ Cliente: Carlos Eduardo | Telefone: (11) 98765-4321    │
│                                                        │
│ 1. Modelo Vendido:                                     │
│    [ iPhone 14 128GB Estelar                       ▼ ] │
│                                                        │
│ 2. Condição do Aparelho:                               │
│    ( ) Novo Lacrado       (●) Seminovo Certificado     │
│                                                        │
│ 3. Saúde da Bateria na Entrega:                        │
│    [ 87 % ] (Ex: 85% a 100%)                           │
│                                                        │
│ 4. IMEI / Número de Série:                             │
│    [ 354892019482910                                 ] │
│                                                        │
│ 5. Teve Aparelho na Troca (Trade-in)?                  │
│    [X] Sim, recebemos iPhone 11 64GB Preto (R$ 1.300)  │
│                                                        │
│ 6. Acessórios Adicionados:                             │
│    [X] Fonte 20W Apple   [X] Película 3D   [ ] Capa    │
├────────────────────────────────────────────────────────┤
│ [ Cancelar ]          [ 🚀 SALVAR E EMITIR GARANTIA ]  │
│                       (Aciona D+0 no WhatsApp agora)   │
└────────────────────────────────────────────────────────┘
```

---

## 5. Layout do Dashboard Executivo de ROI (`/dashboard`)

Desenhado para o proprietário da loja abrir no smartphone ao acordar ou no fim do expediente:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  DASHBOARD EXECUTIVO: RETORNO SOBRE O INVESTIMENTO (ROI)                     │
│  Período: [ Este Mês (01 a 12 Outubro) ▼ ]          Loja: [ Matriz Centro ▼ ]│
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐ ┌───────────────────────────┐ ┌──────────────┐ │
│ │ 💰 RECEITA RECUPERADA     │ │ 🤝 VENDAS POR INDICAÇÃO   │ │ 📈 MULTIPLI- │ │
│ │ R$ 42.800,00              │ │ R$ 8.900,00               │ │    CADOR     │ │
│ │ 11 Aparelhos Reativados   │ │ 3 Aparelhos por Indicação │ │ 104x Custo   │ │
│ └───────────────────────────┘ └───────────────────────────┘ └──────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ DESEMPENHO DA EQUIPE & SLA COMERCIAL                                         │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Vendedor     │ Atendimentos │ SLA Médio    │ Vendas Fech. │ Conversão    │ │
│ ├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤ │
│ │ Lucas        │ 142          │ 🟢 1m 45s    │ 24 aparelhos │ 16.9%        │ │
│ │ Beatriz      │ 128          │ 🟢 2m 10s    │ 19 aparelhos │ 14.8%        │ │
│ │ Gabriel      │ 95           │ 🔴 6m 30s    │ 8 aparelhos  │ 8.4% (Alerta)│ │
│ └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Lógica de Estados de Interface (UX State Logic)

- **Empty States Significativos:**
  - *Sem conversas no Inbox:* Ilustração amigável com a frase: *"Tudo em dia por aqui! Novos leads de anúncios e mensagens de WhatsApp cairão aqui automaticamente via roleta."*
  - *Sem clientes na régua de reativação:* Mensagem com botão de ação direta: *"Você ainda não ativou sua base antiga. [Clique aqui para importar sua planilha CSV] e comece a resgatar clientes em 5 minutos."*
- **Tratamento de Alertas e Falhas de Rede:**
  - *Queda de conexão com a Meta API:* Banner fixo superior com aviso discreto: *"Reconectando à Meta WhatsApp Cloud API... As mensagens recebidas estão preservadas na fila de segurança."*
- **Feedback de Ação (Success Toasts):**
  - Ao copiar ou enviar a proposta formatada: Toast verde discreto no topo com mensagem *"Proposta de parcelamento copiada com sucesso!"* por 2,5 segundos.
