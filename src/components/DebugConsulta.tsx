// DEBUG INTERFACE - src/components/DebugConsulta.tsx
import React from 'react';
import { useDiaCompleto } from '../hooks/useDiaCompleto';

const DebugConsulta: React.FC = () => {
  const { loading, error, debugInfo } = useDiaCompleto(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-medium">Testando conexões Airtable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🧪 DEBUG AIRTABLE - TESTE DE CONEXÕES
          </h1>
          <p className="text-gray-600">
            Testando cada tabela individualmente para identificar problemas
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <h3 className="font-bold">Erro Geral:</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Debug Results */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Roteiro Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📍 TABELA ROTEIRO
            </h2>
            <div className="space-y-2">
              <p><strong>Table ID:</strong> tblI0dlh1t1ak2B1O</p>
              <p><strong>Query:</strong> {`{Dia} = 1`}</p>
              <p><strong>Resultado:</strong> {debugInfo.roteiro || 'Testando...'}</p>
            </div>
          </div>

          {/* Postos Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ⛽ TABELA POSTOS
            </h2>
            <div className="space-y-2">
              <p><strong>Table ID:</strong> tblzUwaN7SBSA7M0b</p>
              <p><strong>Query:</strong> {`{Dia} = 1`}</p>
              <p><strong>Resultado:</strong> {debugInfo.postos || 'Testando...'}</p>
            </div>
          </div>

          {/* Hotéis Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🏨 TABELA HOTÉIS
            </h2>
            <div className="space-y-2">
              <p><strong>Table ID:</strong> tbl0mpLKNXOK8VaoB</p>
              <p><strong>Query:</strong> {`{Data} = "2025-10-17"`}</p>
              <p><strong>Resultado:</strong> {debugInfo.hoteis || 'Testando...'}</p>
            </div>
          </div>

          {/* Gastos Test */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💰 TABELA GASTOS
            </h2>
            <div className="space-y-2">
              <p><strong>Table ID:</strong> tblITcCCTJK9uFwUC</p>
              <p><strong>Query:</strong> {`{Data} = "2025-10-17"`}</p>
              <p><strong>Resultado:</strong> {debugInfo.gastos || 'Testando...'}</p>
            </div>
          </div>

        </div>

        {/* Instructions */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg mt-6">
          <h3 className="font-bold mb-2">📋 INSTRUÇÕES:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra o Console (F12) para ver logs detalhados</li>
            <li>Verifique quais tabelas retornam ✅ e quais retornam ❌</li>
            <li>Para tabelas com ❌, verifique se os nomes dos campos estão corretos</li>
            <li>Me informe quais tabelas falharam e as mensagens de erro específicas</li>
          </ol>
        </div>

        {/* Field Verification */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 VERIFICAÇÃO DE CAMPOS
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Campos Esperados:</h3>
              <ul className="text-sm space-y-1">
                <li><strong>Roteiro:</strong> Dia, Data, Trecho, Status, Dificuldade</li>
                <li><strong>Postos:</strong> Dia, Posto, Localização, KM Trecho</li>
                <li><strong>Hotéis:</strong> Hotel, Data, Preço, Status</li>
                <li><strong>Gastos:</strong> Data, Categoria, Valor, Responsável</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Ação se der erro:</h3>
              <ul className="text-sm space-y-1">
                <li>1. Verificar nome exato do campo no Airtable</li>
                <li>2. Verificar se campo existe na tabela</li>
                <li>3. Verificar tipo do campo (text, number, date)</li>
                <li>4. Me informar diferenças encontradas</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DebugConsulta;