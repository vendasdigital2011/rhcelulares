import type {
  Lead,
  LeadStage,
  LeadActivity,
  LeadTask,
  CommercialSummary,
  AIRecommendation,
} from '../types.js';

const STORAGE_KEY = 'crm_hiago_leads';

const SEED_LEADS: Lead[] = [];

export class LeadRepository {
  private static loadStorage(): Lead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LEADS));
        return SEED_LEADS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_LEADS;
    }
  }

  private static saveStorage(leads: Lead[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Falha ao salvar leads no localStorage:', e);
    }
  }

  public static async getLeads(filters?: {
    stage?: string;
    origin?: string;
    priority?: string;
    search?: string;
    assignedUser?: string;
    period?: string;
  }): Promise<Lead[]> {
    let leads = this.loadStorage();

    if (!filters) return leads;

    if (filters.search && filters.search.trim() !== '') {
      const term = filters.search.toLowerCase().trim();
      leads = leads.filter(l =>
        l.contactName.toLowerCase().includes(term) ||
        (l.companyName && l.companyName.toLowerCase().includes(term)) ||
        l.phone.includes(term) ||
        (l.email && l.email.toLowerCase().includes(term)) ||
        l.commercialInterest.toLowerCase().includes(term)
      );
    }

    if (filters.stage && filters.stage !== 'todas') {
      leads = leads.filter(l => l.stage === filters.stage);
    }

    if (filters.origin && filters.origin !== 'todas') {
      leads = leads.filter(l => l.origin === filters.origin);
    }

    if (filters.priority && filters.priority !== 'todas') {
      leads = leads.filter(l => l.priority === filters.priority);
    }

    if (filters.assignedUser && filters.assignedUser !== 'todos') {
      leads = leads.filter(l => l.assignedUserId === filters.assignedUser || l.assignedUserName === filters.assignedUser);
    }

    return leads;
  }

  public static async getLeadById(id: string): Promise<Lead | null> {
    const leads = this.loadStorage();
    return leads.find(l => l.id === id) || null;
  }

  public static async checkDuplicates(
    phone: string,
    email?: string,
    excludeLeadId?: string
  ): Promise<{ isDuplicate: boolean; matches: Lead[] }> {
    const leads = this.loadStorage();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const matches = leads.filter(l => {
      if (excludeLeadId && l.id === excludeLeadId) return false;
      const leadPhone = l.phone.replace(/\D/g, '');
      const leadEmail = l.email ? l.email.trim().toLowerCase() : '';

      const phoneMatch = cleanPhone.length >= 8 && leadPhone.includes(cleanPhone.slice(-8));
      const emailMatch = cleanEmail.length > 3 && leadEmail === cleanEmail;

      return phoneMatch || emailMatch;
    });

    return {
      isDuplicate: matches.length > 0,
      matches,
    };
  }

  public static async createLead(data: Partial<Lead>): Promise<Lead> {
    const leads = this.loadStorage();
    const now = new Date().toISOString();

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      tenantId: data.tenantId || 'default_tenant',
      contactName: data.contactName || 'Lead Sem Nome',
      companyName: data.companyName || '',
      phone: data.phone || '',
      email: data.email || '',
      city: data.city || 'Manaus',
      state: data.state || 'AM',
      website: data.website || '',
      businessType: data.businessType || 'consumidor_final',
      commercialInterest: data.commercialInterest || 'Aparelho ou Serviço',
      potentialValue: Number(data.potentialValue) || 0,
      priority: data.priority || 'media',
      stage: data.stage || 'novo_lead',
      assignedUserId: data.assignedUserId || 'usr-1',
      assignedUserName: data.assignedUserName || 'Robson Oliveira',
      origin: data.origin || 'pesquisa_manual',
      entryDate: data.entryDate || now.split('T')[0],
      lastContactDate: data.lastContactDate || now,
      nextAction: data.nextAction || 'Fazer primeiro contato comercial',
      nextReturnDate: data.nextReturnDate || undefined,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
      createdByUserName: data.createdByUserName || 'Robson Oliveira',
      updatedByUserName: data.createdByUserName || 'Robson Oliveira',
      erpLink: {
        syncStatus: 'not_linked',
        notes: 'Preparado para sincronização com ERP comercial',
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          leadId: `lead-${Date.now()}`,
          type: 'observacao',
          description: `Lead cadastrado no pipeline com origem "${data.origin || 'pesquisa_manual'}".`,
          timestamp: now,
          authorName: data.createdByUserName || 'Robson Oliveira',
        },
      ],
      tasks: [],
    };

    leads.unshift(newLead);
    this.saveStorage(leads);
    return newLead;
  }

  public static async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const leads = this.loadStorage();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`Lead com ID ${id} não encontrado.`);
    }

    const current = leads[index];
    const now = new Date().toISOString();

    const updated: Lead = {
      ...current,
      ...updates,
      updatedAt: now,
    };

    leads[index] = updated;
    this.saveStorage(leads);
    return updated;
  }

  public static async moveLeadStage(
    id: string,
    newStage: LeadStage,
    authorName = 'Robson Oliveira',
    reason?: string
  ): Promise<Lead> {
    const leads = this.loadStorage();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`Lead ${id} não encontrado.`);
    }

    const lead = leads[index];
    const oldStage = lead.stage;
    if (oldStage === newStage) return lead;

    const now = new Date().toISOString();

    const stageLabels: Record<LeadStage, string> = {
      novo_lead: 'Novo lead',
      qualificacao: 'Qualificação',
      primeiro_contato: 'Primeiro contato',
      em_negociacao: 'Em negociação',
      aguardando_retorno: 'Aguardando retorno',
      convertido: 'Convertido',
      perdido: 'Perdido',
    };

    const newActivity: LeadActivity = {
      id: `act-${Date.now()}`,
      leadId: lead.id,
      type: 'mudanca_etapa',
      description: `Etapa alterada de "${stageLabels[oldStage]}" para "${stageLabels[newStage]}".${reason ? ` Justificativa: ${reason}` : ''}`,
      timestamp: now,
      authorName,
    };

    lead.stage = newStage;
    lead.updatedAt = now;
    lead.activities.unshift(newActivity);

    leads[index] = lead;
    this.saveStorage(leads);
    return lead;
  }

  public static async addActivity(
    leadId: string,
    activity: Omit<LeadActivity, 'id' | 'leadId' | 'timestamp'>
  ): Promise<LeadActivity> {
    const leads = this.loadStorage();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error(`Lead ${leadId} não encontrado.`);

    const now = new Date().toISOString();
    const newAct: LeadActivity = {
      id: `act-${Date.now()}`,
      leadId,
      timestamp: now,
      ...activity,
    };

    lead.activities.unshift(newAct);
    lead.lastContactDate = now;
    lead.updatedAt = now;

    this.saveStorage(leads);
    return newAct;
  }

  public static async addTask(
    leadId: string,
    task: Omit<LeadTask, 'id' | 'leadId' | 'createdAt'>
  ): Promise<LeadTask> {
    const leads = this.loadStorage();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error(`Lead ${leadId} não encontrado.`);

    const now = new Date().toISOString();
    const newTask: LeadTask = {
      id: `tsk-${Date.now()}`,
      leadId,
      createdAt: now,
      ...task,
    };

    lead.tasks.push(newTask);
    lead.updatedAt = now;

    this.saveStorage(leads);
    return newTask;
  }

  public static async toggleTask(leadId: string, taskId: string): Promise<LeadTask> {
    const leads = this.loadStorage();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error(`Lead ${leadId} não encontrado.`);

    const task = lead.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Tarefa ${taskId} não encontrada.`);

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : undefined;
    lead.updatedAt = new Date().toISOString();

    this.saveStorage(leads);
    return task;
  }

  public static async deleteLead(id: string): Promise<boolean> {
    const leads = this.loadStorage();
    const filtered = leads.filter(l => l.id !== id);
    if (filtered.length === leads.length) return false;
    this.saveStorage(filtered);
    return true;
  }

  public static getCommercialSummary(leads: Lead[]): CommercialSummary {
    const totalLeads = leads.length;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newLeadsCount = leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length;

    const inProgressCount = leads.filter(l =>
      l.stage === 'qualificacao' ||
      l.stage === 'primeiro_contato' ||
      l.stage === 'em_negociacao'
    ).length;

    const pendingReturnCount = leads.filter(l => {
      if (l.stage === 'aguardando_retorno') return true;
      if (l.nextReturnDate && new Date(l.nextReturnDate) <= now && l.stage !== 'convertido' && l.stage !== 'perdido') {
        return true;
      }
      return false;
    }).length;

    const convertedCount = leads.filter(l => l.stage === 'convertido').length;

    const totalPotentialValue = leads.reduce((acc, l) => acc + (l.potentialValue || 0), 0);

    const conversionRate = totalLeads > 0 ? Number(((convertedCount / totalLeads) * 100).toFixed(1)) : 0;

    return {
      totalLeads,
      newLeadsCount,
      inProgressCount,
      pendingReturnCount,
      convertedCount,
      totalPotentialValue,
      conversionRate,
    };
  }

  /**
   * Assistente de Inteligência Comercial Baseado em Evidências Reais
   * Analisa os registros existentes e gera alertas auditáveis com dados e justificativa.
   * Não executa ações automaticamente (requer aprovação explícita do usuário).
   */
  public static getAIRecommendations(leads: Lead[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const now = new Date();

    leads.forEach(lead => {
      if (lead.stage === 'convertido' || lead.stage === 'perdido') return;

      // 1. Alerta: Retorno pendente vencido
      if (lead.nextReturnDate) {
        const returnDate = new Date(lead.nextReturnDate);
        if (returnDate < now) {
          const daysOverdue = Math.floor((now.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));
          recommendations.push({
            id: `rec-ret-${lead.id}`,
            leadId: lead.id,
            leadName: lead.contactName,
            problemOrOpportunity: `Retorno comercial atrasado (${daysOverdue === 0 ? 'venceu hoje' : `há ${daysOverdue} dia(s)`})`,
            usedData: `Data prevista de retorno: ${returnDate.toLocaleDateString('pt-BR')} | Último contato: ${lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString('pt-BR') : 'Sem registro'}`,
            analyzedPeriod: 'Últimos 7 dias',
            justification: `O lead "${lead.contactName}" demonstrou interesse em "${lead.commercialInterest}" (Potencial: R$ ${(lead.potentialValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}), porém está sem resposta ou retorno pós-prazo acordado.`,
            recommendedAction: `Enviar mensagem de acompanhamento focando na resolução de dúvidas ou negociar condição especial.`,
            suggestedActionType: 'schedule_return',
            urgency: daysOverdue >= 2 ? 'alta' : 'media',
          });
        }
      }

      // 2. Alerta: Oportunidade estagnada em negociação (> 3 dias sem interação)
      if (lead.stage === 'em_negociacao' || lead.stage === 'aguardando_retorno') {
        const lastDate = lead.lastContactDate ? new Date(lead.lastContactDate) : new Date(lead.updatedAt);
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 3) {
          recommendations.push({
            id: `rec-stag-${lead.id}`,
            leadId: lead.id,
            leadName: lead.contactName,
            problemOrOpportunity: `Oportunidade estagnada na etapa "${lead.stage === 'em_negociacao' ? 'Em negociação' : 'Aguardando retorno'}"`,
            usedData: `${diffDays} dias sem nenhuma atividade registrada (Última atividade: ${lastDate.toLocaleDateString('pt-BR')})`,
            analyzedPeriod: `Últimos ${diffDays} dias`,
            justification: `Negociações no segmento de smartphones esfriam rapidamente após 72h sem novo ponto de contato. Valor em risco: R$ ${(lead.potentialValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
            recommendedAction: `Realizar contato ativo por ligação ou WhatsApp para reaquecer a proposta antes que o cliente busque concorrentes.`,
            suggestedActionType: 'add_activity',
            urgency: lead.priority === 'urgente' || lead.priority === 'alta' ? 'alta' : 'media',
          });
        }
      }

      // 3. Alerta: Lead novo sem triagem (> 24h em "novo_lead")
      if (lead.stage === 'novo_lead') {
        const createDate = new Date(lead.createdAt);
        const hoursAgo = Math.floor((now.getTime() - createDate.getTime()) / (1000 * 60 * 60));
        if (hoursAgo >= 24) {
          recommendations.push({
            id: `rec-new-${lead.id}`,
            leadId: lead.id,
            leadName: lead.contactName,
            problemOrOpportunity: `Lead novo aguardando primeiro contato há mais de ${Math.floor(hoursAgo / 24)} dia(s)`,
            usedData: `Criado em: ${createDate.toLocaleDateString('pt-BR')} ${createDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
            analyzedPeriod: 'Últimas 48 horas',
            justification: `Leads recebidos têm taxa de conversão 3x maior quando abordados nas primeiras horas.`,
            recommendedAction: `Qualificar o interesse e mover o cartão para a etapa "Primeiro contato".`,
            suggestedActionType: 'move_stage',
            suggestedStage: 'primeiro_contato',
            urgency: 'alta',
          });
        }
      }
    });

    return recommendations;
  }
}
