import { supabase } from '../services/supabaseClient.js';
import type {
  TimecardRecord,
  TimecardType,
  TimecardAdjustment,
  StoreLocationConfig,
} from '../types.js';

const STORAGE_KEY_TIMECARD = 'hiago_timecard_records';
const STORAGE_KEY_ADJUSTMENTS = 'hiago_timecard_adjustments';
const STORAGE_KEY_LOCATION = 'hiago_store_location_config';

const DEFAULT_LOCATION: StoreLocationConfig = {
  latitude: -3.1190275,
  longitude: -60.0217314,
  radiusMeters: 150,
  requireGps: true,
};

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export class TimecardRepository {
  static async getLocationConfig(): Promise<StoreLocationConfig> {
    const saved = localStorage.getItem(STORAGE_KEY_LOCATION);
    if (saved) return JSON.parse(saved);
    return DEFAULT_LOCATION;
  }

  static async saveLocationConfig(config: StoreLocationConfig): Promise<StoreLocationConfig> {
    localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(config));
    return config;
  }

  static async getRecords(userId?: string, monthYear?: string): Promise<TimecardRecord[]> {
    try {
      let query = supabase.from('timecard_records').select('*').order('timestamp', { ascending: true });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error || !data || data.length === 0) throw new Error();
      return data.map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        userId: r.user_id,
        userName: r.user_name,
        timestamp: r.timestamp,
        type: r.type,
        origin: r.origin,
        latitude: r.latitude,
        longitude: r.longitude,
        isWithinRadius: r.is_within_radius,
        locationStatus: r.location_status,
        serverTime: r.server_time || r.timestamp,
        hash: r.hash,
        createdAt: r.created_at,
      }));
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY_TIMECARD);
      let list: TimecardRecord[] = saved ? JSON.parse(saved) : [];
      if (userId) list = list.filter(r => r.userId === userId);
      if (monthYear) {
        list = list.filter(r => r.timestamp.startsWith(monthYear));
      }
      return list;
    }
  }

  static async getNextAllowedPunch(userId: string): Promise<{
    nextType: TimecardType;
    label: string;
    currentStatus: string;
  }> {
    const todayStr = new Date().toISOString().split('T')[0];
    const records = await this.getRecords(userId);
    const todayRecords = records.filter(r => r.timestamp.startsWith(todayStr));

    if (todayRecords.length === 0) {
      return {
        nextType: 'entry',
        label: 'Entrada',
        currentStatus: 'Fora da jornada',
      };
    }

    const last = todayRecords[todayRecords.length - 1];
    switch (last.type) {
      case 'entry':
        return {
          nextType: 'lunch_start',
          label: 'Início do intervalo',
          currentStatus: 'Em jornada de trabalho',
        };
      case 'lunch_start':
        return {
          nextType: 'lunch_end',
          label: 'Fim do intervalo',
          currentStatus: 'Em intervalo de almoço',
        };
      case 'lunch_end':
        return {
          nextType: 'exit',
          label: 'Saída',
          currentStatus: 'Em jornada de trabalho',
        };
      case 'exit':
      default:
        return {
          nextType: 'entry',
          label: 'Nova Entrada',
          currentStatus: 'Jornada encerrada',
        };
    }
  }

  static async punchTimecard(
    userId: string,
    userName: string,
    type: TimecardType,
    coords?: { latitude: number; longitude: number }
  ): Promise<TimecardRecord> {
    const locConfig = await this.getLocationConfig();
    let isWithinRadius = true;
    let locationStatus: TimecardRecord['locationStatus'] = 'gps_unavailable';

    if (coords && coords.latitude && coords.longitude) {
      const dist = calculateDistanceMeters(
        coords.latitude,
        coords.longitude,
        locConfig.latitude,
        locConfig.longitude
      );
      isWithinRadius = dist <= locConfig.radiusMeters;
      locationStatus = isWithinRadius ? 'validated' : 'outside_radius';
    }

    const now = new Date().toISOString();
    const hash = `hash-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const newRecord: TimecardRecord = {
      id: `tc-${Date.now()}`,
      userId,
      userName,
      timestamp: now,
      type,
      origin: 'web',
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      isWithinRadius,
      locationStatus,
      serverTime: now,
      hash,
      createdAt: now,
    };

    try {
      await supabase.from('timecard_records').insert([{
        id: newRecord.id,
        user_id: newRecord.userId,
        user_name: newRecord.userName,
        timestamp: newRecord.timestamp,
        type: newRecord.type,
        origin: newRecord.origin,
        latitude: newRecord.latitude,
        longitude: newRecord.longitude,
        is_within_radius: newRecord.isWithinRadius,
        location_status: newRecord.locationStatus,
        hash: newRecord.hash,
      }]);
    } catch {
      // offline fallback
    }

    const saved = localStorage.getItem(STORAGE_KEY_TIMECARD);
    const list: TimecardRecord[] = saved ? JSON.parse(saved) : [];
    list.push(newRecord);
    localStorage.setItem(STORAGE_KEY_TIMECARD, JSON.stringify(list));

    return newRecord;
  }

  static async getMonthlyMirror(
    userId: string,
    yearMonth: string // '2026-10'
  ): Promise<{
    days: Array<{
      date: string;
      entry?: string;
      lunchStart?: string;
      lunchEnd?: string;
      exit?: string;
      totalHours: string;
      status: string;
    }>;
    totalMinutes: number;
    formattedTotal: string;
  }> {
    const records = await this.getRecords(userId, yearMonth);

    // Agrupa por dia (YYYY-MM-DD)
    const byDay: Record<string, TimecardRecord[]> = {};
    records.forEach(r => {
      const day = r.timestamp.split('T')[0];
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(r);
    });

    let grandTotalMinutes = 0;
    const days = Object.keys(byDay).sort().map(day => {
      const dayRecords = byDay[day];
      const entryRec = dayRecords.find(r => r.type === 'entry');
      const lunchStartRec = dayRecords.find(r => r.type === 'lunch_start');
      const lunchEndRec = dayRecords.find(r => r.type === 'lunch_end');
      const exitRec = dayRecords.find(r => r.type === 'exit');

      let minutesWorked = 0;
      if (entryRec && lunchStartRec) {
        const diff = (new Date(lunchStartRec.timestamp).getTime() - new Date(entryRec.timestamp).getTime()) / 60000;
        if (diff > 0) minutesWorked += diff;
      }
      if (lunchEndRec && exitRec) {
        const diff = (new Date(exitRec.timestamp).getTime() - new Date(lunchEndRec.timestamp).getTime()) / 60000;
        if (diff > 0) minutesWorked += diff;
      } else if (entryRec && exitRec && !lunchStartRec) {
        const diff = (new Date(exitRec.timestamp).getTime() - new Date(entryRec.timestamp).getTime()) / 60000;
        if (diff > 0) minutesWorked += diff;
      }

      grandTotalMinutes += minutesWorked;

      const formatTime = (ts?: string) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

      const hours = Math.floor(minutesWorked / 60);
      const mins = Math.floor(minutesWorked % 60);

      return {
        date: day,
        entry: formatTime(entryRec?.timestamp),
        lunchStart: formatTime(lunchStartRec?.timestamp),
        lunchEnd: formatTime(lunchEndRec?.timestamp),
        exit: formatTime(exitRec?.timestamp),
        totalHours: `${hours}h ${mins}min`,
        status: exitRec ? 'Completo' : 'Em andamento',
      };
    });

    const totalHours = Math.floor(grandTotalMinutes / 60);
    const totalRemainingMins = Math.floor(grandTotalMinutes % 60);

    return {
      days,
      totalMinutes: grandTotalMinutes,
      formattedTotal: `${totalHours}h ${totalRemainingMins}min`,
    };
  }

  static async createAdjustment(adj: Omit<TimecardAdjustment, 'id' | 'createdAt'>): Promise<TimecardAdjustment> {
    const newAdj: TimecardAdjustment = {
      ...adj,
      id: `adj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const saved = localStorage.getItem(STORAGE_KEY_ADJUSTMENTS);
    const list: TimecardAdjustment[] = saved ? JSON.parse(saved) : [];
    list.push(newAdj);
    localStorage.setItem(STORAGE_KEY_ADJUSTMENTS, JSON.stringify(list));

    // Também cria marcação correspondente sinalizada como manual
    await this.punchTimecard(adj.userId, adj.userName, adj.adjustedType);

    return newAdj;
  }
}
