// ARQUIVO TEMPORÁRIO: src/components/DebugHotelFields.tsx
// CRIAR ESTE ARQUIVO PARA DESCOBRIR OS NOMES REAIS DOS CAMPOS

import React, { useState, useEffect } from 'react';
import { tables, validateConfig } from '../config/airtable';

const DebugHotelFields: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstRecord, setFirstRecord] = useState<any>(null);

  useEffect(() => {
    const fetchFirstRecord = async () => {
      if (!validateConfig()) {
        setError('Configuração do Airtable inválida');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 [DEBUG] Tentando buscar primeiro registro de hotéis...');
        
        // Buscar sem ordenação para evitar erros de campo
        const records = await tables.hoteis().select({
          maxRecords: 1
        }).firstPage();

        if (records.length > 0) {
          const firstRecord = records[0];
          setFirstRecord(firstRecord);
          
          console.log('🎯 [DEBUG] PRIMEIRO REGISTRO COMPLETO:', firstRecord);
          console.log('🏷️ [DEBUG] CAMPOS DISPONÍVEIS:', Object.keys(firstRecord.fields));
          console.log('📋 [DEBUG] ESTRUTURA DETALHADA:', firstRecord.fields);
        } else {
          setError('Nenhum registro encontrado na tabela hotéis');
        }
        
      } catch (err) {
        console.error('❌ [DEBUG] Erro ao buscar hotéis:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchFirstRecord();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analisando campos da tabela hotéis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p className="font-bold">Erro de conexão</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔍 Debug: Campos da Tabela Hotéis</h1>
        
        {firstRecord && (
          <div className="space-y-6">
            {/* Campos disponíveis */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">📋 Campos Disponíveis:</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(firstRecord.fields).map((fieldName) => (
                  <div key={fieldName} className="bg-blue-100 px-3 py-2 rounded text-sm font-mono">
                    "{fieldName}"
                  </div>
                ))}
              </div>
            </div>

            {/* Valores do primeiro registro */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">🎯 Valores do Primeiro Registro:</h2>
              <div className="space-y-2">
                {Object.entries(firstRecord.fields).map(([fieldName, value]) => (
                  <div key={fieldName} className="flex items-center space-x-3">
                    <div className="bg-gray-100 px-3 py-1 rounded font-mono text-sm min-w-[150px]">
                      "{fieldName}"
                    </div>
                    <div className="text-gray-600">→</div>
                    <div className="font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ID do registro */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">🆔 Informações do Registro:</h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">ID:</div>
                  <div className="font-medium">{firstRecord.id}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">Created:</div>
                  <div className="font-medium">{firstRecord.createdTime}</div>
                </div>
              </div>
            </div>

            {/* Instruções para correção */}
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-yellow-800">⚡ Próximos Passos:</h2>
              <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                <li>Copie os nomes exatos dos campos acima</li>
                <li>Use esses nomes no arquivo useHoteis.ts</li>
                <li>Atualize a interface HotelFields no types/airtable.ts</li>
                <li>Remova este componente de debug após a correção</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugHotelFields;