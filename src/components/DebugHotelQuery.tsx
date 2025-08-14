// src/components/DebugHotelQuery.tsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { tables, validateConfig } from '../config/airtable';

const DebugHotelQuery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // Função CORRIGIDA para calcular data da viagem baseada no dia
  const getDataViagem = (dia: number): string => {
    // FORÇA A DATA BASE: 17 de outubro de 2025
    const anoBase = 2025;
    const mesBase = 10; // Outubro (não zero-indexed)
    const diaBase = 17;
    
    // Criar data base
    const dataBase = new Date(anoBase, mesBase - 1, diaBase); // mesBase-1 pois Date é zero-indexed
    
    // Adicionar dias
    const dataFinal = new Date(dataBase);
    dataFinal.setDate(dataBase.getDate() + (dia - 1));
    
    // Log para debug
    console.log(`📅 Calculando data para dia ${dia}:`);
    console.log(`📅 Data base: ${dataBase.toISOString().split('T')[0]}`);
    console.log(`📅 Data final: ${dataFinal.toISOString().split('T')[0]}`);
    
    return dataFinal.toISOString().split('T')[0];
  };

  const debugHotelQueries = async () => {
    if (!validateConfig()) {
      setError('Configuração do Airtable inválida');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const dia1Data = getDataViagem(1);
      const dia2Data = getDataViagem(2);
      const dia3Data = getDataViagem(3);
      
      console.log('🧪 DEBUGGING HOTEL QUERIES - VERSÃO CORRIGIDA');
      console.log(`📅 Dia 1 = ${dia1Data} (deve ser 2025-10-17)`);
      console.log(`📅 Dia 2 = ${dia2Data} (deve ser 2025-10-18)`);
      console.log(`📅 Dia 3 = ${dia3Data} (deve ser 2025-10-19)`);
      
      // TESTE 1: Buscar TODOS os hotéis para ver estrutura
      console.log('📋 Teste 1: Buscar todos os hotéis...');
      const todosHoteis = await tables.hoteis().select({
        maxRecords: 15,
        sort: [{ field: 'Data', direction: 'asc' }]
      }).firstPage();
      
      console.log(`✅ Total hotéis encontrados: ${todosHoteis.length}`);
      todosHoteis.forEach((hotel, index) => {
        console.log(`Hotel ${index + 1}:`, {
          id: hotel.id,
          fields: hotel.fields
        });
      });

      // TESTE 2: Tentar filtros diferentes com datas corrigidas
      const filtros = [
        `{Data} = "${dia1Data}"`,
        `{Data} = "2025-10-17"`,
        `DATESTR({Data}) = "${dia1Data}"`,
        `{Dia} = 1`,
        `{Status} = "🟢 Confirmado"`,
        `{Hotel} != ""`,
        `{Cidade} = "Guarapuva"`,
        `{Cidade} = "Guarapuava"`,
        `SEARCH("Guarap", {Cidade}) > 0`,
        `AND({Data} = "${dia1Data}", {Hotel} != "")`,
        `OR({Data} = "${dia1Data}", {Data} = "${dia2Data}", {Data} = "${dia3Data}")`,
        `{Data} >= "${dia1Data}"`
      ];

      const resultadosFiltros: any = {};

      for (const filtro of filtros) {
        try {
          console.log(`🔍 Testando filtro: ${filtro}`);
          const resultado = await tables.hoteis().select({
            filterByFormula: filtro,
            maxRecords: 5
          }).firstPage();
          
          resultadosFiltros[filtro] = {
            status: 'success',
            count: resultado.length,
            data: resultado.map(r => ({
              id: r.id,
              fields: r.fields
            }))
          };
          console.log(`✅ Filtro "${filtro}": ${resultado.length} resultados`);
        } catch (err) {
          resultadosFiltros[filtro] = {
            status: 'error',
            error: err instanceof Error ? err.message : String(err)
          };
          console.log(`❌ Filtro "${filtro}": ERRO - ${err}`);
        }
      }

      // TESTE 3: Análise dos campos disponíveis
      let camposUnicos = new Set<string>();
      todosHoteis.forEach(hotel => {
        Object.keys(hotel.fields).forEach(campo => camposUnicos.add(campo));
      });
      
      console.log('📊 Campos disponíveis na tabela Hotéis:', Array.from(camposUnicos));

      setResults({
        diaCalculado: dia1Data,
        dia2Calculado: dia2Data,
        dia3Calculado: dia3Data,
        todosHoteis: todosHoteis.map(h => ({
          id: h.id,
          fields: h.fields
        })),
        filtros: resultadosFiltros,
        camposDisponiveis: Array.from(camposUnicos)
      });

    } catch (err) {
      console.error('❌ Erro geral:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const testeManualRapido = async () => {
    console.log('🧪 TESTE MANUAL RÁPIDO...');
    
    try {
      // Teste básico - primeiro hotel
      const primeiroHotel = await tables.hoteis().select({ maxRecords: 1 }).firstPage();
      console.log('🏨 Primeiro hotel da tabela:', primeiroHotel[0]?.fields);
      
      // Teste de contagem total
      const totalHoteis = await tables.hoteis().select().firstPage();
      console.log(`📊 Total de hotéis na tabela: ${totalHoteis.length}`);
      
      // Teste de busca por período outubro
      const oututobroHoteis = await tables.hoteis().select({
        filterByFormula: `MONTH({Data}) = 10`,
        maxRecords: 10
      }).firstPage();
      console.log(`🗓️ Hotéis em outubro: ${oututobroHoteis.length}`);
      
    } catch (err) {
      console.error('❌ Teste manual falhou:', err);
    }
  };

  useEffect(() => {
    debugHotelQueries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏨 DEBUG HOTEL - CARRETERA AUSTRAL (CORRIGIDO)
          </h1>
          <p className="text-gray-600">
            Investigando por que hotel não aparece - DATA CORRIGIDA
          </p>
          <button 
            onClick={testeManualRapido}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            🧪 Teste Manual Rápido
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
              Executando testes com datas corrigidas...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Results */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            
            {/* Verificação de Data */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📅 VERIFICAÇÃO DE DATAS CORRIGIDAS
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded">
                  <p><strong>Dia 1:</strong> {results.diaCalculado}</p>
                  <p className="text-sm">Esperado: 2025-10-17</p>
                  <p className={`text-sm font-semibold ${results.diaCalculado === '2025-10-17' ? 'text-green-600' : 'text-red-600'}`}>
                    {results.diaCalculado === '2025-10-17' ? '✅ CORRETO!' : '❌ AINDA ERRADO'}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <p><strong>Dia 2:</strong> {results.dia2Calculado}</p>
                  <p className="text-sm">Esperado: 2025-10-18</p>
                  <p className={`text-sm font-semibold ${results.dia2Calculado === '2025-10-18' ? 'text-green-600' : 'text-red-600'}`}>
                    {results.dia2Calculado === '2025-10-18' ? '✅ CORRETO!' : '❌ AINDA ERRADO'}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <p><strong>Dia 3:</strong> {results.dia3Calculado}</p>
                  <p className="text-sm">Esperado: 2025-10-19</p>
                  <p className={`text-sm font-semibold ${results.dia3Calculado === '2025-10-19' ? 'text-green-600' : 'text-red-600'}`}>
                    {results.dia3Calculado === '2025-10-19' ? '✅ CORRETO!' : '❌ AINDA ERRADO'}
                  </p>
                </div>
              </div>
            </div>

            {/* Campos Disponíveis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 CAMPOS DISPONÍVEIS NA TABELA HOTÉIS
              </h2>
              <div className="bg-gray-100 p-4 rounded">
                <div className="flex flex-wrap gap-2">
                  {results.camposDisponiveis?.map((campo: string) => (
                    <span key={campo} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                      {campo}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotéis Encontrados */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏨 HOTÉIS ENCONTRADOS ({results.todosHoteis?.length || 0})
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {results.todosHoteis?.length > 0 ? (
                  results.todosHoteis.map((hotel: any, index: number) => (
                    <div key={hotel.id} className="border border-gray-200 rounded p-4">
                      <h3 className="font-semibold text-blue-600">Hotel {index + 1}</h3>
                      <p className="text-xs text-gray-500 mb-2">ID: {hotel.id}</p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(hotel.fields).map(([key, value]) => (
                          <div key={key} className="flex">
                            <span className="font-mono text-blue-600 w-24 flex-shrink-0">{key}:</span>
                            <span className="text-gray-800 break-words">{JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <p className="text-lg">❌ Nenhum hotel encontrado na tabela</p>
                    <p>Verifique se a tabela Hotéis tem dados ou se o Table ID está correto</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resultados dos Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔍 RESULTADO DOS FILTROS (DATAS CORRIGIDAS)
              </h2>
              <div className="space-y-3">
                {Object.entries(results.filtros || {}).map(([filtro, resultado]: [string, any]) => (
                  <div key={filtro} className={`border rounded p-3 ${
                    resultado.status === 'success' && resultado.count > 0 
                      ? 'border-green-300 bg-green-50' 
                      : resultado.status === 'error' 
                        ? 'border-red-300 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <code className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-mono flex-1 mr-3">
                        {filtro}
                      </code>
                      <span className={`px-3 py-1 rounded text-sm font-medium flex-shrink-0 ${
                        resultado.status === 'success' && resultado.count > 0
                          ? 'bg-green-100 text-green-800' 
                          : resultado.status === 'success'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {resultado.status === 'success' 
                          ? resultado.count > 0 
                            ? `🎉 ${resultado.count} ENCONTRADOS!`
                            : '⚠️ 0 resultados'
                          : '❌ Erro'
                        }
                      </span>
                    </div>
                    
                    {resultado.status === 'error' && (
                      <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
                        <strong>Erro:</strong> {resultado.error}
                      </div>
                    )}
                    
                    {resultado.status === 'success' && resultado.count > 0 && (
                      <div className="mt-3">
                        <strong className="text-green-700">🎯 DADOS ENCONTRADOS:</strong>
                        <div className="bg-white p-3 rounded border mt-2 text-xs overflow-x-auto">
                          {resultado.data.map((item: any, idx: number) => (
                            <div key={idx} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                              <strong className="text-green-600">✅ Resultado {idx + 1}:</strong>
                              <div className="ml-4 mt-1 grid gap-1">
                                {Object.entries(item.fields).map(([key, value]) => (
                                  <div key={key} className="flex">
                                    <span className="font-mono text-blue-600 w-20 flex-shrink-0">{key}:</span>
                                    <span className="break-words">{JSON.stringify(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded mt-6">
          <strong>📋 INSTRUÇÕES DE ANÁLISE:</strong>
          <ol className="list-decimal list-inside mt-3 space-y-2 text-sm">
            <li>Verifique se as datas agora mostram ✅ CORRETO (2025-10-17, 2025-10-18, 2025-10-19)</li>
            <li>Abra Console (F12) para ver logs detalhados dos cálculos de data</li>
            <li>Procure filtros com 🎉 ENCONTRADOS (fundo verde)</li>
            <li>Anote quais filtros funcionaram e trouxeram dados</li>
            <li>Verifique se existe hotel para Guarapuava nos resultados</li>
            <li>Me informe qual filtro trouxe os dados corretos</li>
          </ol>
        </div>

        {/* Next Steps */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded mt-4">
          <strong>🎯 PRÓXIMOS PASSOS APÓS DEBUG:</strong>
          <div className="mt-2 text-sm space-y-1">
            <p><strong>✅ Se encontrar hotéis:</strong> Aplicarei a correção no código principal</p>
            <p><strong>⚠️ Se não encontrar:</strong> Verificaremos se hotel está cadastrado para Guarapuava</p>
            <p><strong>🔧 Se dar erro:</strong> Ajustaremos o nome dos campos na query</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DebugHotelQuery;