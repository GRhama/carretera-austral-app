import { useState, useEffect, useCallback } from 'react';
import { tables, validateConfig } from '../config/airtable';
import { HotelRecord, HotelFields } from '../types/airtable';

interface UseHoteisReturn {
  hoteis: HotelRecord[];
  loading: boolean;
  error: string | null;
  totalGastoHoteis: number;
  hoteisReservados: HotelRecord[];
  hoteisPesquisando: HotelRecord[];
  addHotel: (hotel: any) => Promise<boolean>;
  refreshHoteis: () => Promise<void>;
}

export const useHoteis = (): UseHoteisReturn => {
  const [hoteis, setHoteis] = useState<HotelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calcular total gasto em hotéis - CAMPO CORRIGIDO
  const totalGastoHoteis = hoteis.reduce((sum, hotel) => sum + (hotel.fields.Preço || 0), 0);

  // Filtrar hotéis por status - STATUS CORRIGIDO
  const hoteisReservados = hoteis.filter(hotel => hotel.fields.Status === '✅ Confirmado');
  const hoteisPesquisando = hoteis.filter(hotel => hotel.fields.Status === '🔍 Pesquisando');

  const fetchHoteis = useCallback(async () => {
  if (!validateConfig()) {
    setError('Configuração do Airtable inválida');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    const records: HotelRecord[] = [];
    
    await tables.hoteis().select({
      sort: [{ field: 'Check-in', direction: 'asc' }],
      maxRecords: 200
    }).eachPage((pageRecords, fetchNextPage) => {
      records.push(...(pageRecords as unknown as HotelRecord[]));
      fetchNextPage();
    });

    setHoteis(records);
    
    console.log('🏨 HOTÉIS CARREGADOS:', records.length);
    console.log('✅ Confirmados:', records.filter(h => h.fields.Status === '✅ Confirmado').length);
    console.log('🔍 Pesquisando:', records.filter(h => h.fields.Status === '🔍 Pesquisando').length);

    const hoteisComPreco = records.filter(h => h.fields.Preço);
console.log('💰 HOTÉIS COM PREÇO:', hoteisComPreco.length);
console.log('💰 EXEMPLO DE PREÇOS:', records.slice(0, 5).map(h => ({
  hotel: h.fields.Hotel || h.fields.Cidade,
  preco: h.fields.Preço,
  tipo: typeof h.fields.Preço
})));
    
  } catch (err) {
    console.error('Erro ao buscar hotéis:', err);
    setError(err instanceof Error ? err.message : 'Erro desconhecido');
  } finally {
    setLoading(false);
  }
}, []);

  const addHotel = useCallback(async (hotelData: any): Promise<boolean> => {
    if (!validateConfig()) {
      setError('Configuração do Airtable inválida');
      return false;
    }

    try {
      setError(null);
      
      const novoHotel = {
        'Dia': hotelData.Dia || 1,
        'Hotel': hotelData.hotel,
        'Cidade': hotelData.cidade,
        'Check-in': hotelData['Check-in'],
        'Check-out': hotelData['Check-out'],
        'Preço': hotelData.preço,
        'Status': '✅ Confirmado', // Novo hotel = confirmado
        'Endereco': hotelData.Endereço || '',
        'Observações': hotelData.Observação || '',
        'Link': hotelData.Link || '',
        'Codigo_Reserva': hotelData.Codigo_Reserva || ''
      };

      console.log('Enviando hotel para Airtable:', novoHotel);
      
      const newRecord = await tables.hoteis().create([
        { fields: novoHotel }
      ]);

      // Adicionar à lista local
      setHoteis(prev => {
        const newList = [...prev, newRecord[0] as unknown as HotelRecord];
        console.log('🏨 NOVO HOTEL ADICIONADO:', newRecord[0]);
        return newList;
      });

      return true;
    } catch (err) {
      console.error('Erro ao adicionar hotel:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar hotel');
      return false;
    }
  }, []);

  const refreshHoteis = useCallback(async () => {
    await fetchHoteis();
  }, [fetchHoteis]);

  useEffect(() => {
    fetchHoteis();
  }, [fetchHoteis]);

  return {
    hoteis,
    loading,
    error,
    totalGastoHoteis,
    hoteisReservados,
    hoteisPesquisando,
    addHotel,
    refreshHoteis
  };
};