// src/hooks/useDiaCompleto.ts - VERSÃO CORRIGIDA COM DATA FIXA
import { useState, useEffect, useCallback, useMemo } from 'react';
import { tables, validateConfig } from '../config/airtable';
import { RoteiroRecord, HotelRecord, GastoRecord } from '../types/airtable';

interface PostoRecord {
  id: string;
  fields: {
    'Posto': string;
    'Localização': string;
    'Dia': number;
    'KM Trecho': number;
    'KM Acumulado': number;
    'Status': '📋 Planejado' | '✅ Concluído' | '🔴 Fechado';
    'Valor total': string;
    'Observações'?: string;
    'Coordenadas'?: string;
    'Bandeira'?: string;
    'Litros estimado'?: number;
  };
}

interface ProgressoViagem {
  diaAtual: number;
  totalDias: 20;
  kmPercorridos: number;
  kmTotal: 10385;
  percentualConcluido: number;
  diasRestantes: number;
  proximoMarco: {
    tipo: 'fronteira' | 'balsa' | 'cidade' | 'critico';
    nome: string;
    dia: number;
    descricao: string;
  } | null;
}

interface AlertaItem {
  tipo: 'fronteira' | 'posto' | 'hotel' | 'balsa' | 'critico';
  prioridade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  icone: string;
  quando: 'hoje' | 'amanha' | 'proximo';
}

interface DiaCompletoData {
  roteiro: RoteiroRecord | null;
  hotel: HotelRecord | null;
  postos: PostoRecord[];
  gastos: GastoRecord[];
  progresso: ProgressoViagem;
  alertas: AlertaItem[];
  loading: boolean;
  error: string | null;
}

// Marcos importantes da viagem
const MARCOS_VIAGEM = [
  { dia: 2, tipo: 'fronteira', nome: 'Brasil → Argentina', descricao: 'Primeira fronteira - documentos obrigatórios' },
  { dia: 6, tipo: 'fronteira', nome: 'Argentina → Chile', descricao: 'Entrada no Chile - Carretera Austral' },
  { dia: 8, tipo: 'balsa', nome: 'Balsa La Arena', descricao: 'Primeira balsa - chegar 8h para embarque 10h' },
  { dia: 9, tipo: 'balsa', nome: 'Balsa Chaitén', descricao: 'Início oficial Carretera Austral' },
  { dia: 12, tipo: 'critico', nome: 'Chile Chico', descricao: 'Trecho deserto - postos escassos' },
  { dia: 14, tipo: 'fronteira', nome: 'Chile → Argentina', descricao: 'Volta para Argentina - Ruta 40' },
  { dia: 17, tipo: 'critico', nome: 'Trecho Patagônico', descricao: 'Último trecho difícil antes das cidades' }
];

export const useDiaCompleto = (diaAtual: number): DiaCompletoData => {
  const [roteiro, setRoteiro] = useState<RoteiroRecord | null>(null);
  const [hotel, setHotel] = useState<HotelRecord | null>(null);
  const [postos, setPostos] = useState<PostoRecord[]>([]);
  const [gastos, setGastos] = useState<GastoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todosRoteiros, setTodosRoteiros] = useState<RoteiroRecord[]>([]);

  // FUNÇÃO CORRIGIDA - DATA FIXA 17/10/2025
  const getDataViagem = (dia: number): string => {
    // FORÇA A DATA BASE: 17 de outubro de 2025
    const anoBase = 2025;
    const mesBase = 10; // Outubro 
    const diaBase = 17;
    
    // Criar data base
    const dataBase = new Date(anoBase, mesBase - 1, diaBase); // mesBase-1 pois Date é zero-indexed
    
    // Adicionar dias
    const dataFinal = new Date(dataBase);
    dataFinal.setDate(dataBase.getDate() + (dia - 1));
    
    const resultado = dataFinal.toISOString().split('T')[0];
    
    // Log para debug
    console.log(`📅 CORRIGIDO - Dia ${dia} = ${resultado}`);
    
    return resultado;
  };

  // Função para extrair KM do campo Trecho
  const extrairKMDoTrecho = (trecho: string): number => {
    if (!trecho) return 0;
    
    // Procurar padrões como "450km", "450 km", "450 Km"
    const kmMatch = trecho.match(/(\d+)\s*km/i);
    return kmMatch ? parseInt(kmMatch[1]) : 0;
  };

  // Fetch dados do dia específico
  const fetchDadosDia = useCallback(async (dia: number) => {
    if (!validateConfig()) {
      setError('Configuração do Airtable inválida');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataCalculada = getDataViagem(dia);
      
      console.log(`📡 Buscando dados completos do dia ${dia}...`);
      console.log(`📅 Data calculada CORRIGIDA: ${dataCalculada}`);

      // Fetch paralelo de todas as APIs
      const [roteiroData, hotelData, postosData, gastosData, todosRoteirosData] = await Promise.all([
        // Roteiro do dia específico
        tables.roteiro().select({
          filterByFormula: `{Dia} = ${dia}`,
          maxRecords: 1
        }).firstPage(),

        // Hotel do dia específico - COM DATA CORRIGIDA
        tables.hoteis().select({
          filterByFormula: `{Data} = "${dataCalculada}"`,
          maxRecords: 1
        }).firstPage(),

        // Postos do dia específico
        tables.gasolina().select({
          filterByFormula: `{Dia} = ${dia}`,
          sort: [{ field: 'KM Trecho', direction: 'asc' }]
        }).firstPage(),

        // Gastos do dia específico - COM DATA CORRIGIDA
        tables.gastos().select({
          filterByFormula: `{Data} = "${dataCalculada}"`,
          sort: [{ field: 'Data', direction: 'desc' }]
        }).firstPage(),

        // Todos os roteiros para cálculo de progresso
        tables.roteiro().select({
          sort: [{ field: 'Dia', direction: 'asc' }]
        }).firstPage()
      ]);

      // Processar dados
      setRoteiro(roteiroData[0] as RoteiroRecord || null);
      setHotel(hotelData[0] as HotelRecord || null);
      setPostos(postosData as PostoRecord[]);
      setGastos(gastosData as GastoRecord[]);
      setTodosRoteiros(todosRoteirosData as RoteiroRecord[]);

      console.log(`✅ Dados dia ${dia} carregados:`);
      console.log(`- Roteiro: ${roteiroData.length ? '✅' : '❌'}`);
      console.log(`- Hotel: ${hotelData.length ? '✅' : '❌'}`);
      console.log(`- Postos: ${postosData.length} encontrados`);
      console.log(`- Gastos: ${gastosData.length} encontrados`);

      // Debug adicional para hotel
      if (hotelData.length === 0) {
        console.log(`🚨 HOTEL NÃO ENCONTRADO para data: ${dataCalculada}`);
        console.log('🔍 Tentando busca alternativa...');
        
        // Busca alternativa por cidade
        const hotelAlternativo = await tables.hoteis().select({
          filterByFormula: `SEARCH("Guarap", {Cidade}) > 0`,
          maxRecords: 3
        }).firstPage();
        
        console.log(`🏨 Busca por cidade encontrou: ${hotelAlternativo.length} hotéis`);
        if (hotelAlternativo.length > 0) {
          console.log('🏨 Hotéis encontrados por cidade:', hotelAlternativo.map(h => h.fields));
        }
      }

    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular progresso da viagem
  const progresso = useMemo((): ProgressoViagem => {
    if (!todosRoteiros.length) {
      return {
        diaAtual,
        totalDias: 20,
        kmPercorridos: 0,
        kmTotal: 10385,
        percentualConcluido: 0,
        diasRestantes: 20 - diaAtual,
        proximoMarco: null
      };
    }

    // Calcular KM percorridos até dia anterior
    const kmPercorridos = todosRoteiros
      .filter(r => r.fields.Dia < diaAtual)
      .reduce((total, r) => {
        const kmTrecho = extrairKMDoTrecho(r.fields.Trecho || '');
        return total + kmTrecho;
      }, 0);

    const percentualConcluido = (kmPercorridos / 10385) * 100;

    // Encontrar próximo marco
    const proximoMarco = MARCOS_VIAGEM.find(m => m.dia >= diaAtual) || null;

    return {
      diaAtual,
      totalDias: 20,
      kmPercorridos,
      kmTotal: 10385,
      percentualConcluido,
      diasRestantes: 20 - diaAtual,
      proximoMarco
    };
  }, [diaAtual, todosRoteiros]);

  // Gerar alertas contextuais
  const alertas = useMemo((): AlertaItem[] => {
    const alertasGerados: AlertaItem[] = [];

    // Alertas de marcos importantes
    const marcoHoje = MARCOS_VIAGEM.find(m => m.dia === diaAtual);
    if (marcoHoje) {
      alertasGerados.push({
        tipo: marcoHoje.tipo as AlertaItem['tipo'],
        prioridade: 'alta',
        titulo: `${marcoHoje.nome} HOJE`,
        descricao: marcoHoje.descricao,
        icone: marcoHoje.tipo === 'fronteira' ? '🛂' : marcoHoje.tipo === 'balsa' ? '⛴️' : '🚨',
        quando: 'hoje'
      });
    }

    // Alertas de postos críticos
    postos.forEach(posto => {
      if (posto.fields.Observações?.includes('CRÍTICO') || posto.fields.Observações?.includes('crítico')) {
        alertasGerados.push({
          tipo: 'posto',
          prioridade: 'alta',
          titulo: `Posto CRÍTICO: ${posto.fields.Posto}`,
          descricao: `KM ${posto.fields['KM Trecho']} - ${posto.fields.Observações}`,
          icone: '⛽',
          quando: 'hoje'
        });
      }
    });

    // Alerta hotel não confirmado
    if (hotel && hotel.fields.Status === '🟡 Pesquisando') {
      alertasGerados.push({
        tipo: 'hotel',
        prioridade: 'media',
        titulo: `Hotel não confirmado: ${hotel.fields.Hotel}`,
        descricao: 'Reserva ainda pendente - confirmar urgente',
        icone: '🏨',
        quando: 'hoje'
      });
    }

    // Alerta se hotel não encontrado
    if (!hotel) {
      alertasGerados.push({
        tipo: 'hotel',
        prioridade: 'alta',
        titulo: 'Hotel não definido para este dia',
        descricao: 'Verificar reserva ou cadastrar hotel no sistema',
        icone: '🏨',
        quando: 'hoje'
      });
    }

    // Alertas próximos dias
    const proximoMarco = MARCOS_VIAGEM.find(m => m.dia === diaAtual + 1);
    if (proximoMarco) {
      alertasGerados.push({
        tipo: proximoMarco.tipo as AlertaItem['tipo'],
        prioridade: 'media',
        titulo: `Amanhã: ${proximoMarco.nome}`,
        descricao: `Preparar: ${proximoMarco.descricao}`,
        icone: '📅',
        quando: 'amanha'
      });
    }

    return alertasGerados.sort((a, b) => {
      const prioridades = { alta: 3, media: 2, baixa: 1 };
      return prioridades[b.prioridade] - prioridades[a.prioridade];
    });
  }, [diaAtual, postos, hotel]);

  // Effect para carregar dados quando dia muda
  useEffect(() => {
    fetchDadosDia(diaAtual);
  }, [diaAtual, fetchDadosDia]);

  return {
    roteiro,
    hotel,
    postos,
    gastos,
    progresso,
    alertas,
    loading,
    error
  };
};