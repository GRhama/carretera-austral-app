// src/components/DebugDataForcada.tsx - FORÇA DATA 17/10/2025
import React, { useState, useEffect } from 'react';
import { tables, validateConfig } from '../config/airtable';

const DebugDataForcada: React.FC = () => {
  const [resultados, setResultados] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // FUNÇÃO FORÇADA - GARANTIR 17/10/2025
  const getDataForcada = (dia: number): string => {
    // Data base: 17 de outubro de 2025
    const dataBase = new Date(2025, 9, 17); // Outubro = 9 (zero-indexed)
    
    // Adicionar dias
    const dataFinal = new Date(dataBase.getTime());
    dataFinal.setDate(dataBase.getDate() + (dia - 1));
    
    const resultado = dataFinal.toISOString().split('T')[0];
    
    console.log(`🔥 FORÇA DATA - Dia ${dia}:`);
    console.log(`🔥 Data base: 2025-10-17`);
    console.log(`🔥 Resultado: ${resultado}`);
    
    return resultado;
  };

  const testarBuscas = async () => {
    setLoading(true);
    
    try {
      const dia1 = getDataForcada(1);
      const dia2 = getDataForcada(2);
      
      console.log('🔥 TESTANDO COM DATAS FORÇADAS');
      console.log(`🔥 Dia 1: ${dia1}`);
      console.log(`🔥 Dia 2: ${dia2}`);
      
      // Teste todas as tabelas com data forçada
      const [roteiro, hotel, gastos] = await Promise.all([
        // Roteiro por DIA
        tables.roteiro().select({
          filterByFormula: `{Dia} = 1`,
          maxRecords: 1
        }).firstPage(),
        
        // Hotel por DATA FORÇADA
        tables.hoteis().select({
          filterByFormula: `{Data} = "${dia1}"`,
          maxRecords: 1
        }).firstPage(),
        
        // Gastos por DATA FORÇADA
        tables.gastos().select({
          filterByFormula: `{Data} = "${dia1}"`,
          maxRecords: 5
        }).firstPage()
      ]);

      setResultados({
        dia1Forcado: dia1,
        dia2Forcado: dia2,
        roteiro: roteiro[0]?.fields || null,
        hotel: hotel[0]?.fields || null,
        gastos: gastos.map(g => g.fields),
        roteiroCount: roteiro.length,
        hotelCount: hotel.length,
        gastosCount: gastos.length
      });

      console.log('🔥 RESULTADOS COM DATA FORÇADA:');
      console.log('- Roteiro:', roteiro.length > 0 ? '✅' : '❌');
      console.log('- Hotel:', hotel.length > 0 ? '✅' : '❌');
      console.log('- Gastos:', gastos.length);

    } catch (err) {
      console.error('🔥 ERRO:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testarBuscas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">
            🔥 DEBUG DATA FORÇADA - 17/10/2025
          </h1>
          <p>Este componente força a data para 17/10/2025 independente de qualquer cálculo</p>
        </div>

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
              Testando com data forçada...
            </div>
          </div>
        )}

        {Object.keys(resultados).length > 0 && (
          <div className="space-y-6">
            
            {/* Verificação de Data */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📅 DATAS FORÇADAS
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-100 p-4 rounded">
                  <p><strong>Dia 1 FORÇADO:</strong> {resultados.dia1Forcado}</p>
                  <p className="text-sm">Deve ser: 2025-10-17</p>
                  <p className={`font-bold ${resultados.dia1Forcado === '2025-10-17' ? 'text-green-600' : 'text-red-600'}`}>
                    {resultados.dia1Forcado === '2025-10-17' ? '✅ CORRETO!' : '❌ AINDA ERRADO!'}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded">
                  <p><strong>Dia 2 FORÇADO:</strong> {resultados.dia2Forcado}</p>
                  <p className="text-sm">Deve ser: 2025-10-18</p>
                  <p className={`font-bold ${resultados.dia2Forcado === '2025-10-18' ? 'text-green-600' : 'text-red-600'}`}>
                    {resultados.dia2Forcado === '2025-10-18' ? '✅ CORRETO!' : '❌ AINDA ERRADO!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Resultados das Buscas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔍 RESULTADOS COM DATA FORÇADA
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded ${resultados.roteiroCount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <h3 className="font-semibold">Roteiro</h3>
                  <p>{resultados.roteiroCount > 0 ? '✅' : '❌'} {resultados.roteiroCount} encontrado</p>
                </div>
                <div className={`p-4 rounded ${resultados.hotelCount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <h3 className="font-semibold">Hotel</h3>
                  <p>{resultados.hotelCount > 0 ? '✅' : '❌'} {resultados.hotelCount} encontrado</p>
                </div>
                <div className={`p-4 rounded ${resultados.gastosCount > 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <h3 className="font-semibold">Gastos</h3>
                  <p>{resultados.gastosCount > 0 ? '✅' : '⚠️'} {resultados.gastosCount} encontrados</p>
                </div>
              </div>

              {/* Dados do Roteiro */}
              {resultados.roteiro && (
                <div className="mb-6">
                  <h3 className="font-semibold text-green-600 mb-2">✅ ROTEIRO ENCONTRADO:</h3>
                  <div className="bg-green-50 p-4 rounded">
                    <p><strong>Trecho:</strong> {resultados.roteiro.Trecho}</p>
                    <p><strong>Data:</strong> {resultados.roteiro.Data}</p>
                    <p><strong>Status:</strong> {resultados.roteiro.Status}</p>
                    <p><strong>Dificuldade:</strong> {resultados.roteiro.Dificuldade}</p>
                  </div>
                </div>
              )}

              {/* Dados do Hotel */}
              {resultados.hotel ? (
                <div className="mb-6">
                  <h3 className="font-semibold text-green-600 mb-2">🎉 HOTEL ENCONTRADO!</h3>
                  <div className="bg-green-50 p-4 rounded">
                    <p><strong>Hotel:</strong> {resultados.hotel.Hotel}</p>
                    <p><strong>Cidade:</strong> {resultados.hotel.Cidade}</p>
                    <p><strong>Data:</strong> {resultados.hotel.Data}</p>
                    <p><strong>Status:</strong> {resultados.hotel.Status}</p>
                    <p><strong>Preço:</strong> R$ {resultados.hotel.Preço}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="font-semibold text-red-600 mb-2">❌ HOTEL NÃO ENCONTRADO</h3>
                  <div className="bg-red-50 p-4 rounded">
                    <p>Nenhum hotel encontrado para a data: {resultados.dia1Forcado}</p>
                    <p className="text-sm text-red-600 mt-2">
                      Possíveis causas: Hotel não cadastrado para Guarapuava em 17/10/2025
                    </p>
                  </div>
                </div>
              )}

              {/* Dados dos Gastos */}
              {resultados.gastos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-600 mb-2">💰 GASTOS ENCONTRADOS:</h3>
                  <div className="bg-blue-50 p-4 rounded">
                    {resultados.gastos.map((gasto: any, index: number) => (
                      <div key={index} className="mb-2 pb-2 border-b border-blue-200 last:border-b-0">
                        <p><strong>{gasto.Categoria}:</strong> R$ {gasto.Valor}</p>
                        <p className="text-sm">Por: {gasto.Responsável} • {gasto.Data}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-6">
          <strong>🎯 ANÁLISE:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Se as datas mostram ✅ CORRETO: A função de data está funcionando</li>
            <li>Se hotel mostra 🎉 ENCONTRADO: Hotel existe e problema estava na data</li>
            <li>Se hotel mostra ❌ NÃO ENCONTRADO: Hotel não está cadastrado para Guarapuava</li>
            <li>Abra Console (F12) para ver logs detalhados</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default DebugDataForcada;