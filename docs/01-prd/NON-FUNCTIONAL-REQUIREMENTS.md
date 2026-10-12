# NON-FUNCTIONAL REQUIREMENTS: ESPECIFICAÇÃO DE REQUISITOS NÃO-FUNCIONAIS (RNF)

---

## 1. RNF-01: Desempenho, Tempo de Resposta e Latência

### 1.1 Latência de Mensagens em Tempo Real
- O tempo total entre a chegada de uma mensagem de WhatsApp nos servidores da Meta e a sua renderização visual na tela do vendedor deve ser inferior a **1.500 milissegundos** em condições normais de rede.
- O envio de mensagens a partir da interface do vendedor para a API da Meta deve ter tempo de despacho inferior a **800 milissegundos**.

### 1.2 Desempenho da Interface de Usuário
- O carregamento inicial da aplicação web (First Contentful Paint - FCP) deve ocorrer em menos de **1,8 segundos** em conexões 4G/Banda Larga.
- O cálculo da simulação de parcelamento de maquininha e trade-in deve ser executado de forma instantânea na interface (tempo de resposta < **100 milissegundos**).
- A troca de conversas na caixa de entrada não deve apresentar travamentos ou recarregamentos perceptíveis de tela.

---

## 2. RNF-02: Disponibilidade, Confiabilidade e Resiliência

### 2.1 Acordo de Nível de Serviço (SLA)
- O sistema deve operar com disponibilidade mínima garantida de **99,5% de Uptime** em horário comercial (08:00 às 22:00 no fuso de Brasília).
- As janelas de manutenção programada devem ser executadas preferencialmente na madrugada (01:00 às 05:00) com aviso prévio de 48 horas.

### 2.2 Tratamento de Falhas e Filas de Mensagens
- Caso o endpoint da Meta Cloud API apresente instabilidade temporária (erros 5xx ou limites de taxa / rate limiting), o sistema deve enfileirar as mensagens com mecanismo de retentativa automática (exponential backoff com jitter).
- Nenhuma mensagem recebida ou enviada deve ser perdida em caso de reinicialização de instâncias ou picos temporários de tráfego.

---

## 3. RNF-03: Segurança da Informação, LGPD e Privacidade

### 3.1 Isolamento Rigoroso de Dados (Multi-Tenancy)
- Cada loja cliente constitui um tenant isolado. Sob nenhuma circunstância leads, contatos, conversas, taxas ou métricas de uma loja podem ser acessados ou visualizados por outra loja.
- Políticas rígidas de autorização a nível de requisição garantem que cada consulta seja escopada exclusivamente pelo identificador único da loja.

### 3.2 Proteção Criptográfica
- Todas as comunicações entre o navegador do usuário e a plataforma devem trafegar obrigatoriamente sob protocolo criptografado **HTTPS com TLS 1.3**.
- Dados sensíveis em repouso (chaves de acesso de APIs de terceiros, tokens WABA e credenciais de integração) devem ser armazenados com criptografia simétrica robusta (padrão **AES-256**).

### 3.3 Conformidade com a Lei Geral de Proteção de Dados (LGPD)
- O sistema deve garantir a rastreabilidade de consentimento e oferecer mecanismo imediato de opt-out ("SAIR") em todas as mensagens ativas de marketing.
- O proprietário da loja tem a faculdade de atender a solicitações de exclusão de dados pessoais de clientes finais, anonimizando histórico comercial quando requerido por lei.
- Qualquer exportação de base de dados para arquivos CSV é restrita ao perfil de Administrador com confirmação de segurança (2FA ou senha).

---

## 4. RNF-04: Usabilidade, Responsividade e Acessibilidade

### 4.1 Experiência Mobile (Mobile-First / PWA)
- Como os vendedores de lojas físicas operam com frequência em pé, circulando pela loja ou conferindo aparelhos no estoque, a aplicação deve ser 100% responsiva para smartphones (largura mínima de 360px) no formato Progressive Web App (PWA).
- As ações prioritárias (calculadora de maquininha, consulta de conversas e troca de status do kanban) devem ter áreas de toque de no mínimo 44x44 pixels para operação ágil com polegares.

### 4.2 Padrões Visuais e Acessibilidade
- O design deve manter contraste visual adequado conforme os padrões internacionais **WCAG 2.1 nível AA**, garantindo legibilidade sob iluminação intensa de lojas físicas de rua ou galerias.
- Interface limpa e intuitiva: um vendedor recém-contratado deve ser capaz de operar a caixa de entrada e a calculadora com menos de 10 minutos de instrução.

---

## 5. RNF-05: Escalabilidade para Picos Sazonais de Demanda

- O sistema deve ser projetado para suportar picos de tráfego extremos correspondentes a datas críticas do varejo de smartphones:
  - **Black Friday** (volume de mensagens até 8x superior à média diária).
  - **Semana de Lançamento de Novos iPhones** (setembro/outubro).
  - **Dia das Mães e Natal**.
- A arquitetura de processamento de webhooks de mensagens deve ser desacoplada da interface web do usuário, garantindo que explosões repentinas de conversas recebidas não degradem a usabilidade dos operadores.
