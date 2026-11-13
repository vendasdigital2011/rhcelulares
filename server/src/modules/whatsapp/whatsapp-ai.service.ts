import { env } from '../../config/index.js';
import { sendWhatsAppCloudMessage } from './whatsapp.service.js';

export interface StockItemSummary {
  model: string;
  price: number;
  color?: string;
  batteryHealth?: number;
}

export interface OSSummary {
  osNumber: string;
  deviceModel: string;
  status: string;
  value: number;
}

export interface CopilotRequest {
  customerName: string;
  lastMessageText: string;
  recentMessages?: Array<{ direction?: string; text: string; senderName?: string; sender?: string }>;
  availableStock?: StockItemSummary[];
  currentOS?: OSSummary;
}

export interface CopilotSuggestion {
  id: string;
  title: string;
  text: string;
  category: 'direct_reply' | 'trade_in' | 'product_offer' | 'technical_status';
  intentDetected: string;
}

export interface AutomationTask {
  id: string;
  triggerType: 'os_ready' | 'sale_completed' | 'budget_no_reply' | 'lead_idle' | 'dissatisfied_client';
  title: string;
  targetName: string;
  targetPhone: string;
  referenceId: string;
  suggestedMessage: string;
  status: 'pending' | 'approved' | 'executed' | 'dismissed';
  createdAt: string;
}

// Fila em memória para automações operacionais
let automationQueue: AutomationTask[] = [
  {
    id: 'auto-001',
    triggerType: 'os_ready',
    title: 'Aviso de OS Pronta para Retirada',
    targetName: 'Camila Fernandes',
    targetPhone: '(77) 98112-3344',
    referenceId: 'OS-1042',
    suggestedMessage: 'Olá Camila! Seu iPhone 12 (OS 1042) já está com a nova tela instalada, testada e 100% pronta para retirada na nossa loja. Ficamos no aguardo da sua visita!',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'auto-002',
    triggerType: 'sale_completed',
    title: 'Acompanhamento Pós-Venda (D+7)',
    targetName: 'Matheus Oliveira',
    targetPhone: '(77) 99876-5432',
    referenceId: 'VND-2041',
    suggestedMessage: 'Olá Matheus, tudo bem? Passando para saber como está sendo a experiência com o seu novo iPhone 13! Qualquer dúvida ou acessório que precisar, estamos à sua disposição.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'auto-003',
    triggerType: 'budget_no_reply',
    title: 'Lembrete de Orçamento de Assistência (48h)',
    targetName: 'Lucas Rodrigues',
    targetPhone: '(77) 99123-8899',
    referenceId: 'OS-1039',
    suggestedMessage: 'Olá Lucas! Passando para checar se você conseguiu avaliar o orçamento que enviamos para o reparo do seu aparelho (OS 1039). As peças originais continuam reservadas na bancada para você.',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export class WhatsAppAIService {
  /**
   * Gera sugestões contextuais de resposta (Copiloto Comercial)
   */
  public static async generateSuggestions(params: CopilotRequest): Promise<{
    intent: string;
    suggestions: CopilotSuggestion[];
    source: 'gemini' | 'openai' | 'deterministic_engine';
  }> {
    const { customerName, lastMessageText, availableStock = [], currentOS } = params;
    const cleanMsg = (lastMessageText || '').toLowerCase();

    // 1. Tenta Google Gemini se a chave estiver configurada
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        const geminiResult = await this.callGeminiCopilot(params);
        if (geminiResult && geminiResult.suggestions.length > 0) {
          return {
            intent: geminiResult.intent,
            suggestions: geminiResult.suggestions,
            source: 'gemini',
          };
        }
      } catch (err: any) {
        console.warn('⚠️ Falha na chamada do Google Gemini para WhatsApp Copilot, acionando fallback:', err.message);
      }
    }

    // 2. Tenta OpenAI se a chave estiver configurada
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim() !== '') {
      try {
        const aiResult = await this.callOpenAICopilot(params);
        if (aiResult && aiResult.suggestions.length > 0) {
          return {
            intent: aiResult.intent,
            suggestions: aiResult.suggestions,
            source: 'openai',
          };
        }
      } catch (err: any) {
        console.warn('⚠️ Falha na chamada da OpenAI para WhatsApp Copilot, acionando fallback determinístico:', err.message);
      }
    }

    // 3. Motor Determinístico de Regras de Negócio (RF05: Sem alucinações de preço ou estoque)
    let intent = 'general_inquiry';
    const suggestions: CopilotSuggestion[] = [];

    const isTradeIn = cleanMsg.includes('troca') || cleanMsg.includes('usado') || cleanMsg.includes('pega') || cleanMsg.includes('trade');
    const isPriceStock = cleanMsg.includes('quanto') || cleanMsg.includes('preço') || cleanMsg.includes('valor') || cleanMsg.includes('tem') || cleanMsg.includes('disponivel') || cleanMsg.includes('iphone');
    const isOS = cleanMsg.includes('conserto') || cleanMsg.includes('tela') || cleanMsg.includes('reparo') || cleanMsg.includes('bateria') || cleanMsg.includes('pronto') || cleanMsg.includes('os');

    if (isTradeIn) {
      intent = 'trade_in_inquiry';
      suggestions.push({
        id: 'sug-1',
        title: 'Solicitar Detalhes do Usado',
        text: `Olá ${customerName}! Pegamos seu usado sim como entrada! Para fazer uma avaliação precisa, por favor me informe o modelo exato, capacidade em GB, porcentagem da bateria e se tem alguma marquinha de uso.`,
        category: 'trade_in',
        intentDetected: intent,
      });

      suggestions.push({
        id: 'sug-2',
        title: 'Convidar para Avaliação Presencial',
        text: `Olá ${customerName}! Conseguimos a melhor avaliação do seu iPhone usado aqui na nossa loja física. Consegue passar aqui para tomarmos um café e fazermos o teste presencial de bancada?`,
        category: 'trade_in',
        intentDetected: intent,
      });

      if (availableStock.length > 0) {
        const topItem = availableStock[0];
        suggestions.push({
          id: 'sug-3',
          title: `Oferecer ${topItem.model} Disponível`,
          text: `Podemos abater o seu usado diretamente no ${topItem.model} que temos na vitrine por R$ ${topItem.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}! Que acha?`,
          category: 'product_offer',
          intentDetected: intent,
        });
      }
    } else if (isOS && currentOS) {
      intent = 'os_status_inquiry';
      suggestions.push({
        id: 'sug-1',
        title: `Informar Status da OS ${currentOS.osNumber}`,
        text: `Olá ${customerName}! Sobre a sua Ordem de Serviço ${currentOS.osNumber} (${currentOS.deviceModel}): o aparelho está com status atual "${currentOS.status}" com nosso técnico responsável.`,
        category: 'technical_status',
        intentDetected: intent,
      });

      suggestions.push({
        id: 'sug-2',
        title: 'Confirmar Valor do Reparo',
        text: `O valor do serviço ficou em R$ ${currentOS.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com 90 dias de garantia total na peça instalada. Assim que finalizar os testes avisamos por aqui!`,
        category: 'technical_status',
        intentDetected: intent,
      });
    } else if (isPriceStock && availableStock.length > 0) {
      intent = 'stock_inquiry';
      const item = availableStock[0];
      suggestions.push({
        id: 'sug-1',
        title: `Apresentar ${item.model}`,
        text: `Olá ${customerName}! Temos o ${item.model} disponível na loja por R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Ele está impecável, bateria em ${item.batteryHealth || 90}% e conta com 90 dias de garantia da Hiago iPhones!`,
        category: 'product_offer',
        intentDetected: intent,
      });

      suggestions.push({
        id: 'sug-2',
        title: 'Oferecer Condição Parcelada',
        text: `Esse valor no Pix ou facilitamos em até 18x no cartão de crédito com as melhores taxas do mercado. Gostaria de uma simulação de parcelamento?`,
        category: 'direct_reply',
        intentDetected: intent,
      });

      suggestions.push({
        id: 'sug-3',
        title: 'Reserva Rápida de Aparelho',
        text: `Como o giro desse modelo é muito alto aqui no balcão, posso segurar ele reservado para você retirar hoje?`,
        category: 'direct_reply',
        intentDetected: intent,
      });
    } else {
      intent = 'general_assistance';
      suggestions.push({
        id: 'sug-1',
        title: 'Saudação Padrão Vendedora',
        text: `Olá ${customerName}, tudo bem? Aqui é da equipe Hiago iPhones! Como podemos te ajudar hoje? Está procurando algum modelo específico ou precisa de assistência técnica?`,
        category: 'direct_reply',
        intentDetected: intent,
      });

      suggestions.push({
        id: 'sug-2',
        title: 'Enviar Catálogo / Vitrine',
        text: `Temos várias opções de iPhones novos e seminovos revisados com garantia disponíveis na nossa vitrine hoje! Gostaria que eu te enviasse nossa lista atualizada?`,
        category: 'product_offer',
        intentDetected: intent,
      });
    }

    return {
      intent,
      suggestions,
      source: 'deterministic_engine',
    };
  }

  /**
   * Chamada à API oficial do Google Gemini para geração de sugestões contextuais
   */
  private static async callGeminiCopilot(params: CopilotRequest): Promise<{
    intent: string;
    suggestions: CopilotSuggestion[];
  }> {
    const stockSummary = (params.availableStock || [])
      .slice(0, 5)
      .map(s => `- ${s.model} por R$ ${s.price} (Bateria: ${s.batteryHealth || 'N/D'}%)`)
      .join('\n');

    const osSummary = params.currentOS
      ? `OS: ${params.currentOS.osNumber}, Aparelho: ${params.currentOS.deviceModel}, Status: ${params.currentOS.status}, Valor: R$ ${params.currentOS.value}`
      : 'Nenhuma OS ativa';

    const recentChat = (params.recentMessages || [])
      .slice(-4)
      .map(m => `${m.senderName || m.sender || 'Mensagem'}: ${m.text}`)
      .join('\n');

    const prompt = `
Você é o Copiloto Comercial e de Atendimento da loja Hiago iPhones no WhatsApp.
O cliente ${params.customerName} enviou a seguinte mensagem:
"${params.lastMessageText}"

HISTÓRICO RECENTE:
${recentChat || 'Sem histórico prévio.'}

ESTOQUE REAL DISPONÍVEL NA LOJA (REGRA ABSOLUTA: NUNCA invente aparelhos ou preços que não constam aqui):
${stockSummary || 'Estoque não informado.'}

DADOS DA ASSISTÊNCIA TÉCNICA (OS):
${osSummary}

INSTRUÇÕES:
Gere exatamente 3 sugestões de mensagens curtas, profissionais, envolventes e comerciais para o vendedor da Hiago iPhones revisar e enviar com 1 clique no WhatsApp.
Retorne APENAS um objeto JSON com as chaves "intent" e "suggestions", onde cada sugestão tem "id" (ex: "sug-1"), "title" (título curto descritivo), "text" (texto pronto da mensagem com emojis) e "category" ("direct_reply" | "trade_in" | "product_offer" | "technical_status").
`;

    const modelName = env.GEMINI_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Gemini retornou erro HTTP ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json() as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      intent: parsed.intent || 'geral',
      suggestions: (parsed.suggestions || []).map((s: any, idx: number) => ({
        id: s.id || `gemini-sug-${idx + 1}`,
        title: s.title || `Sugestão ${idx + 1}`,
        text: s.text || '',
        category: s.category || 'direct_reply',
        intentDetected: parsed.intent || 'geral',
      })),
    };
  }

  /**
   * Chamada à API da OpenAI para geração de sugestões
   */
  private static async callOpenAICopilot(params: CopilotRequest): Promise<{
    intent: string;
    suggestions: CopilotSuggestion[];
  }> {
    const stockSummary = (params.availableStock || [])
      .slice(0, 5)
      .map(s => `- ${s.model} por R$ ${s.price} (Bateria: ${s.batteryHealth || 'N/D'}%)`)
      .join('\n');

    const osSummary = params.currentOS
      ? `OS: ${params.currentOS.osNumber}, Aparelho: ${params.currentOS.deviceModel}, Status: ${params.currentOS.status}, Valor: R$ ${params.currentOS.value}`
      : 'Nenhuma OS ativa';

    const prompt = `
Você é o Copiloto Comercial da loja Hiago iPhones no WhatsApp.
O cliente ${params.customerName} enviou a seguinte mensagem:
"${params.lastMessageText}"

ESTOQUE REAL DISPONÍVEL (NUNCA invente outros aparelhos ou preços):
${stockSummary || 'Estoque não informado.'}

DADOS DA ASSISTÊNCIA TÉCNICA:
${osSummary}

Gere exatamente 3 sugestões de respostas curtas, profissionais e amigáveis para o atendente humano revisar e enviar.
Retorne APENAS um JSON no formato:
{
  "intent": "identificação_da_intenção",
  "suggestions": [
    {
      "id": "sug-1",
      "title": "Título Curto",
      "text": "Texto completo da mensagem sugerida",
      "category": "direct_reply"
    }
  ]
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente de vendas e CRM para lojas de celular. Responda em JSON válido estrito.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI retornou erro HTTP ${response.status}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      intent: parsed.intent || 'geral',
      suggestions: parsed.suggestions || [],
    };
  }

  /**
   * Retorna a lista de tarefas de automação pendentes
   */
  public static getAutomations(): AutomationTask[] {
    return automationQueue;
  }

  /**
   * Aprova e executa uma automação (RF06: Human-in-the-loop)
   */
  public static async approveAutomation(id: string, operator: string = 'Hiago Vendas'): Promise<{
    success: boolean;
    automation?: AutomationTask;
    error?: string;
  }> {
    const task = automationQueue.find(a => a.id === id);
    if (!task) {
      return { success: false, error: 'Automação não encontrada' };
    }

    if (task.status === 'executed') {
      return { success: false, error: 'Esta automação já foi executada' };
    }

    // Dispara a mensagem via WhatsApp Cloud API
    const sendResult = await sendWhatsAppCloudMessage({
      to: task.targetPhone,
      message: task.suggestedMessage,
      senderName: operator,
    });

    if (sendResult.success) {
      task.status = 'executed';
      console.log(`🤖 [Automação Executada] ${task.title} para ${task.targetName} (${task.targetPhone})`);
      return { success: true, automation: task };
    }

    return { success: false, error: sendResult.error || 'Falha no disparo da mensagem' };
  }

  /**
   * Descarta uma automação
   */
  public static dismissAutomation(id: string): boolean {
    const task = automationQueue.find(a => a.id === id);
    if (task) {
      task.status = 'dismissed';
      return true;
    }
    return false;
  }
}

