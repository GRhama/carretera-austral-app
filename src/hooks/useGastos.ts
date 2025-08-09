import { useState, useEffect, useCallback } from 'react';
import { tables, validateConfig } from '../config/airtable';
import { GastoRecord, GastoFields } from '../types/airtable';

interface UseGastosReturn {
  gastos: GastoRecord[];
  loading: boolean;
  error: string | null;
  totalGasto: number;
  addGasto: (gasto: any) => Promise<boolean>;
  refreshGastos: () => Promise<void>;
}

export const useGastos = (): UseGastosReturn => {
  const [gastos, setGastos] = useState<GastoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalGasto = gastos.reduce((sum, gasto) => sum + (gasto.fields.Valor || 0), 0);

  const fetchGastos = useCallback(async () => {
    if (!validateConfig()) {
      setError('Configuração do Airtable inválida');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const records: GastoRecord[] = [];
      
      await tables.gastos().select({
        sort: [{ field: 'Data', direction: 'desc' }], // MAIS RECENTES PRIMEIRO
        maxRecords: 200 // AUMENTAR LIMITE PARA PEGAR TODOS OS DADOS
        // SEM FILTRO DE DATA - PEGA TODOS OS REGISTROS
      }).eachPage((pageRecords, fetchNextPage) => {
        records.push(...(pageRecords as unknown as GastoRecord[]));
        fetchNextPage();
      });

      setGastos(records);
      
      // DEBUG: Ver todos os dados que chegaram
      console.log('📊 DADOS CARREGADOS:', records.length, 'gastos');
      console.log('📅 DATAS DOS GASTOS:', records.map(g => ({
        data: g.fields.Data,
        categoria: g.fields.Categoria,
        valor: g.fields.Valor
      })));
      
    } catch (err) {
      console.error('Erro ao buscar gastos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // USANDO A CATEGORIA EXATA COM EMOJI
  const addGasto = useCallback(async (gastoData: any): Promise<boolean> => {
    if (!validateConfig()) {
      setError('Configuração do Airtable inválida');
      return false;
    }

    try {
      setError(null);
      
      // USANDO A CATEGORIA EXATA COM EMOJI
      const novoGasto = {
        'Categoria': gastoData.Categoria, // AGORA VAI FUNCIONAR
        'Valor': gastoData.Valor,
        'Responsável': gastoData.Responsável,
        'Data': new Date().toISOString().split('T')[0],
        'Local': gastoData.Local || '',
        'Descrição': gastoData.Descrição || ''
      };

      console.log('Enviando para Airtable:', novoGasto);

      const newRecord = await tables.gastos().create([
        { fields: novoGasto }
      ]);

      // Adicionar no INÍCIO da lista (mais recente primeiro)
      setGastos(prev => {
        const newList = [newRecord[0] as unknown as GastoRecord, ...prev];
        console.log('📝 NOVO GASTO ADICIONADO À LISTA LOCAL:', newRecord[0]);
        console.log('📋 TOTAL DE GASTOS AGORA:', newList.length);
        return newList;
      });
      return true;
    } catch (err) {
      console.error('Erro ao adicionar gasto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar gasto');
      return false;
    }
  }, []);

  const refreshGastos = useCallback(async () => {
    await fetchGastos();
  }, [fetchGastos]);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  return {
    gastos,
    loading,
    error,
    totalGasto,
    addGasto,
    refreshGastos
  };
};
