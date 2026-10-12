import type { FastifyPluginAsync } from 'fastify';
import { getDatabaseStatus } from '../../db/client.js';

// In-memory fallback store if database connection is in fallback mode
let memoryDevices = [
  {
    id: 'dev-1',
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128GB',
    color: 'Meia-noite',
    condition: 'certified_pre_owned',
    batteryHealth: 88,
    imei: '356984112094832',
    purchasePrice: 2100,
    sellPrice: 2890,
    supplier: 'Distribuidor SP Import',
    status: 'available',
    isShowcasePublic: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'dev-2',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    storage: '256GB',
    color: 'Roxo Profundo',
    condition: 'certified_pre_owned',
    batteryHealth: 92,
    imei: '354891102948201',
    purchasePrice: 3800,
    sellPrice: 4890,
    supplier: 'Lote Trade-in',
    status: 'available',
    isShowcasePublic: true,
    createdAt: '2026-10-04',
  },
  {
    id: 'dev-3',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    storage: '256GB',
    color: 'Titânio Natural',
    condition: 'new_sealed',
    imei: '359182390192843',
    purchasePrice: 6100,
    sellPrice: 7290,
    supplier: 'Miami Tech Eletrônicos',
    status: 'available',
    isShowcasePublic: true,
    createdAt: '2026-10-08',
  },
  {
    id: 'dev-4',
    brand: 'Apple',
    model: 'iPhone 12',
    storage: '64GB',
    color: 'Azul',
    condition: 'certified_pre_owned',
    batteryHealth: 84,
    imei: '358201938472910',
    purchasePrice: 1400,
    sellPrice: 1990,
    supplier: 'Troca Balcão',
    status: 'available',
    isShowcasePublic: false,
    createdAt: '2026-10-02',
  },
  {
    id: 'dev-5',
    brand: 'Apple',
    model: 'iPhone 11',
    storage: '128GB',
    color: 'Branco',
    condition: 'certified_pre_owned',
    batteryHealth: 81,
    imei: '351982739182374',
    purchasePrice: 1100,
    sellPrice: 1650,
    supplier: 'Distribuidor SP Import',
    status: 'sold',
    isShowcasePublic: false,
    createdAt: '2026-09-28',
  },
];

let memorySales = [
  {
    id: 'sale-1',
    saleNumber: 'VD-2091',
    customerName: 'Renato Silva',
    customerPhone: '77 98844-2211',
    sellerName: 'Hiago (Responsável)',
    date: '12/10/2026',
    items: [
      { id: 'dev-5', type: 'device', name: 'iPhone 11 128GB Branco', price: 1650, quantity: 1, imei: '351982739182374' },
      { id: 'acc-1', type: 'accessory', name: 'Capa Anti-Impacto iPhone 11', price: 60, quantity: 1 },
      { id: 'acc-2', type: 'accessory', name: 'Película 3D Cerâmica', price: 40, quantity: 1 },
    ],
    tradeIn: {
      model: 'iPhone 8 Plus 64GB',
      evaluatedValue: 500,
      batteryHealth: 79,
    },
    subtotal: 1750,
    discount: 50,
    total: 1200,
    paymentMethod: 'Cartão de Crédito 12x',
    installments: 12,
  },
];

let memoryServiceOrders = [
  {
    id: 'os-101',
    osNumber: 'OS-0492',
    customerName: 'Marcos Oliveira',
    customerPhone: '77 99988-1122',
    deviceModel: 'iPhone 12 Pro',
    imei: '352938192837482',
    reportedDefect: 'Aparelho não carrega e conector esquenta ao plugar',
    entryChecklist: [
      { item: 'Face ID / Biometria', status: 'ok' },
      { item: 'Tela Touch / Display', status: 'ok' },
      { item: 'Carcaça / Vidro Traseiro', status: 'scratched' },
      { item: 'Conector de Carga', status: 'broken' },
      { item: 'Câmera Traseira', status: 'ok' },
      { item: 'Câmera Frontal', status: 'ok' },
      { item: 'Alto-falante / Auricular', status: 'ok' },
      { item: 'Microfone', status: 'ok' },
      { item: 'Botões Físicos', status: 'ok' },
      { item: 'Sinal de Operadora (SIM)', status: 'ok' },
      { item: 'Wi-Fi / Bluetooth', status: 'ok' },
      { item: 'Bateria / Saúde', status: 'ok' },
      { item: 'Sensor de Proximidade', status: 'ok' },
    ],
    technicalDiagnosis: 'Flex do conector Dock Lightning danificado com oxidação leve. Substituição recomendada.',
    status: 'in_progress',
    estimatedPrice: 280,
    createdAt: '12/10/2026 10:15',
    technicianName: 'Rafael Técnico',
  },
  {
    id: 'os-102',
    osNumber: 'OS-0493',
    customerName: 'Ana Beatriz Souza',
    customerPhone: '77 98122-3344',
    deviceModel: 'iPhone 13',
    imei: '357283918273645',
    reportedDefect: 'Display quebrado após queda e sem imagem (tela preta com som)',
    entryChecklist: [
      { item: 'Face ID / Biometria', status: 'untested' },
      { item: 'Tela Touch / Display', status: 'broken' },
      { item: 'Carcaça / Vidro Traseiro', status: 'ok' },
      { item: 'Conector de Carga', status: 'ok' },
      { item: 'Câmera Traseira', status: 'ok' },
      { item: 'Câmera Frontal', status: 'ok' },
      { item: 'Alto-falante / Auricular', status: 'ok' },
      { item: 'Microfone', status: 'ok' },
      { item: 'Botões Físicos', status: 'ok' },
      { item: 'Sinal de Operadora (SIM)', status: 'ok' },
      { item: 'Wi-Fi / Bluetooth', status: 'ok' },
      { item: 'Bateria / Saúde', status: 'ok' },
      { item: 'Sensor de Proximidade', status: 'untested' },
    ],
    technicalDiagnosis: 'Display OLED com linhas e sem emissão de luz. Placa mãe e componentes internos íntegros.',
    status: 'ready',
    estimatedPrice: 650,
    createdAt: '11/10/2026 16:40',
    technicianName: 'Rafael Técnico',
  },
];

let memoryCashRegister = {
  isOpen: true,
  openedAt: '08:30',
  initialFloat: 300,
  totalSales: 2150,
  breakdown: {
    money: 450,
    pix: 800,
    creditCard: 900,
    debitCard: 0,
    tradeIn: 500,
    other: 0,
  },
};

export const erpRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. DISPOSITIVOS / ESTOQUE POR IMEI
  fastify.get('/devices', async () => {
    return { success: true, data: memoryDevices };
  });

  fastify.post('/devices', async (req) => {
    const body = req.body as any;
    const newDevice = {
      id: body.id || `dev-${Date.now()}`,
      brand: body.brand || 'Apple',
      model: body.model || 'iPhone',
      storage: body.storage || '128GB',
      color: body.color || 'Preto',
      condition: body.condition || 'certified_pre_owned',
      batteryHealth: body.batteryHealth,
      imei: body.imei || '',
      purchasePrice: Number(body.purchasePrice) || 0,
      sellPrice: Number(body.sellPrice) || 0,
      supplier: body.supplier || 'Balcão',
      status: body.status || 'available',
      isShowcasePublic: body.isShowcasePublic !== undefined ? body.isShowcasePublic : true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    memoryDevices = [newDevice, ...memoryDevices];
    return { success: true, data: newDevice };
  });

  // 2. VENDAS (PDV) COM TRADE-IN
  fastify.get('/sales', async () => {
    return { success: true, data: memorySales };
  });

  fastify.post('/sales', async (req) => {
    const body = req.body as any;
    const newSale = {
      id: body.id || `sale-${Date.now()}`,
      saleNumber: body.saleNumber || `VD-${2092 + memorySales.length}`,
      customerName: body.customerName || 'Consumidor Final',
      customerPhone: body.customerPhone || '',
      sellerName: body.sellerName || 'Hiago',
      date: body.date || new Date().toLocaleDateString('pt-BR'),
      items: body.items || [],
      tradeIn: body.tradeIn,
      subtotal: Number(body.subtotal) || 0,
      discount: Number(body.discount) || 0,
      total: Number(body.total) || 0,
      paymentMethod: body.paymentMethod || 'Pix',
      installments: body.installments,
    };

    memorySales = [newSale, ...memorySales];

    // Atualiza status do aparelho vendido
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        if (item.type === 'device' && item.imei) {
          memoryDevices = memoryDevices.map(d => d.imei === item.imei ? { ...d, status: 'sold' } : d);
        }
      });
    }

    // Se houve Trade-In, adiciona o aparelho usado ao estoque
    if (body.tradeIn && body.tradeIn.model) {
      const tradeInDev = {
        id: `dev-tradein-${Date.now()}`,
        brand: 'Apple',
        model: body.tradeIn.model,
        storage: 'Entrada',
        color: 'Usado',
        condition: 'certified_pre_owned' as const,
        batteryHealth: body.tradeIn.batteryHealth || 80,
        imei: body.tradeIn.imei || '',
        purchasePrice: body.tradeIn.evaluatedValue || 0,
        sellPrice: Math.round((body.tradeIn.evaluatedValue || 0) * 1.3),
        supplier: `Trade-in (${body.customerName || 'Cliente'})`,
        status: 'available',
        isShowcasePublic: false,
        createdAt: new Date().toISOString().split('T')[0],
      };
      memoryDevices = [tradeInDev, ...memoryDevices];
    }

    // Incrementa caixa
    memoryCashRegister.totalSales += newSale.total;

    return { success: true, data: newSale };
  });

  // 3. ORDENS DE SERVIÇO (ASSISTÊNCIA TÉCNICA)
  fastify.get('/service-orders', async () => {
    return { success: true, data: memoryServiceOrders };
  });

  fastify.post('/service-orders', async (req) => {
    const body = req.body as any;
    const newOS = {
      id: body.id || `os-${Date.now()}`,
      osNumber: body.osNumber || `OS-${String(494 + memoryServiceOrders.length).padStart(4, '0')}`,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      deviceModel: body.deviceModel,
      imei: body.imei || '',
      reportedDefect: body.reportedDefect,
      entryChecklist: body.entryChecklist || [],
      technicalDiagnosis: body.technicalDiagnosis || '',
      status: body.status || 'in_progress',
      estimatedPrice: Number(body.estimatedPrice) || 0,
      createdAt: body.createdAt || new Date().toLocaleString('pt-BR'),
      technicianName: body.technicianName || 'Técnico Responsável',
    };
    memoryServiceOrders = [newOS, ...memoryServiceOrders];
    return { success: true, data: newOS };
  });

  // 4. CAIXA
  fastify.get('/cash', async () => {
    return { success: true, data: memoryCashRegister };
  });

  fastify.post('/cash/toggle', async () => {
    memoryCashRegister.isOpen = !memoryCashRegister.isOpen;
    if (memoryCashRegister.isOpen) {
      memoryCashRegister.openedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return { success: true, data: memoryCashRegister };
  });
};
