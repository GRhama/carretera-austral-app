// src/components/ConsultaMatinal.tsx - VERSÃO FINAL PARA DEPLOY
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Hotel, Fuel, DollarSign, AlertTriangle } from 'lucide-react';
import { tables, validateConfig } from '../config/airtable';

interface RoteiroData {
  Trecho: string;
  Data: string;
  Status: string;
  Dificuldade: string;
  Observacoes?: string;
}

interface ProgressoData {
  diaAtual: number;
  totalDias: 20;
  percentualConcluido: number;
  kmPercorridos: number;
  kmTotal: 10385;
}

// Mapeamento de distâncias
const DISTANCIAS: Record<string, number> = {
  "São Paulo → Guarapuava": 460,
  "Guarapuava → Curitiba": 267,
  "Buenos Aires → Bariloche": 832,
  "Puerto Montt → Chaitén": 120,
  "El Calafate → Ushuaia": 594
};

const ConsultaMatinal: React.FC = () => {
  const [diaAtual, setDiaAtual] = useState(1);
  const [roteiro, setRoteiro] = useState<RoteiroData | null>(null);
  const [progresso, setProgresso] = useState<ProgressoData>({
    diaAtual: 1,
    totalDias: 20,
    percentualConcluido: 0,
    kmPercorridos: 0,
    kmTotal: 10385
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extrairKilometragem = (trecho: string): string => {
    if (!trecho) return 'N/A';
    const distancia = DISTANCIAS[trecho.trim()];
    return distancia ? `${distancia.toLocaleString()} km` : 'N/A';
  };

  const calcularDataViagem = (dia: number): string => {
    const dataBase = new Date(2025, 9, 17);
    const dataFinal = new Date(dataBase.getTime());
    dataFinal.setDate(dataBase.getDate() + (dia - 1));
    return dataFinal.toISOString().split('T')[0];
  };

  const formatarDataBrasil = (dataISO: string): string => {
    try {
      const data = new Date(dataISO + 'T00:00:00');
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dataISO;
    }
  };

  const carregarDados = async (dia: number = diaAtual) => {
    if (!validateConfig()) {
      setError('Configuração do Airtable inválida');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataCalculada = calcularDataViagem(dia);
      const resultadoRoteiro = await tables.roteiro().select({
        filterByFormula: `{Dia} = ${dia}`,
        maxRecords: 1
      }).firstPage();

      if (resultadoRoteiro.length > 0) {
        const roteiroEncontrado = resultadoRoteiro[0];
        const dadosRoteiro: RoteiroData = {
          Trecho: String(roteiroEncontrado.fields.Trecho || 'Trecho não definido'),
          Data: dataCalculada,
          Status: String(roteiroEncontrado.fields.Status || 'Não iniciado'),
          Dificuldade: String(roteiroEncontrado.fields.Dificuldade || 'N/A'),
          Observacoes: roteiroEncontrado.fields.Observacoes ? String(roteiroEncontrado.fields.Observacoes) : undefined
        };
        setRoteiro(dadosRoteiro);
      } else {
        setRoteiro(null);
      }

      const kmPercorridosCalculado = dia > 1 ? (dia - 1) * 520 : 0;
      const percentualCalculado = (kmPercorridosCalculado / 10385) * 100;

      setProgresso(prev => ({
        ...prev,
        diaAtual: dia,
        percentualConcluido: percentualCalculado,
        kmPercorridos: kmPercorridosCalculado
      }));

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const irParaDiaAnterior = () => {
    if (diaAtual > 1) {
      const novoDia = diaAtual - 1;
      setDiaAtual(novoDia);
      carregarDados(novoDia);
    }
  };

  const irParaProximoDia = () => {
    if (diaAtual < 20) {
      const novoDia = diaAtual + 1;
      setDiaAtual(novoDia);
      carregarDados(novoDia);
    }
  };

  const irParaDia = (dia: number) => {
    if (dia >= 1 && dia <= 20) {
      setDiaAtual(dia);
      carregarDados(dia);
    }
  };

  useEffect(() => {
    carregarDados(diaAtual);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-800 font-medium">Carregando plano de viagem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-bold">Erro ao carregar dados</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={() => carregarDados(diaAtual)}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataViagem = new Date(2025, 9, 17);
  const hoje = new Date();
  const diasRestantes = Math.ceil((dataViagem.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🌅 Carretera Austral</h1>
            <p className="text-blue-100 text-lg">
              Plano de Viagem - Dia {progresso.diaAtual} de {progresso.totalDias}
            </p>
            <div className="mt-4 text-blue-100">
              {diasRestantes > 0 ? (
                <span>⏰ {diasRestantes} dias restantes até a viagem</span>
              ) : (
                <span>🎉 A viagem começou!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Navegação por Dias</h2>
            <div className="text-sm text-gray-600">{diaAtual} de {progresso.totalDias} dias</div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={irParaDiaAnterior}
              disabled={diaAtual <= 1}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                diaAtual <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              ← Dia Anterior
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Dia:</span>
              <select
                value={diaAtual}
                onChange={(e) => irParaDia(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(dia => (
                  <option key={dia} value={dia}>Dia {dia}</option>
                ))}
              </select>
            </div>

            <button
              onClick={irParaProximoDia}
              disabled={diaAtual >= 20}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                diaAtual >= 20 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Próximo Dia →
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Progresso da Viagem</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{progresso.diaAtual}</div>
              <div className="text-sm text-gray-600">Dia Atual</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{progresso.percentualConcluido.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Concluído</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{progresso.kmPercorridos.toLocaleString()}</div>
              <div className="text-sm text-gray-600">KM Percorridos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{progresso.kmTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600">KM Total</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 rounded-full h-3 transition-all duration-500"
                style={{ width: `${progresso.percentualConcluido}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Roteiro do Dia {diaAtual}</h2>
            </div>

            {roteiro ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{roteiro.Trecho}</h3>
                  <p className="text-gray-600">📅 {formatarDataBrasil(roteiro.Data)}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Distância</div>
                    <div className="text-xl font-bold text-blue-600">
                      🏍️ {extrairKilometragem(roteiro.Trecho)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Dificuldade</div>
                    <div className="text-lg font-semibold">{roteiro.Dificuldade}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    roteiro.Status === '✅ Concluído' 
                      ? 'bg-green-100 text-green-800'
                      : roteiro.Status === '🔄 Em andamento'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {roteiro.Status}
                  </span>
                  {roteiro.Observacoes && (
                    <span className="text-sm text-gray-600">• {roteiro.Observacoes}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Roteiro não encontrado para o dia {diaAtual}</p>
                <button 
                  onClick={() => carregarDados(diaAtual)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Tentar recarregar
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Hotel className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Hotel</h2>
            </div>
            <div className="text-center py-8 text-gray-500">
              <Hotel className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Hotel não definido para este dia</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Fuel className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Postos Estratégicos</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { nome: 'Posto Saída SP', local: 'São Paulo', km: 0 },
              { nome: 'BR Itapeva', local: 'Itapeva SP', km: 120 },
              { nome: 'Petrobras Guarapuava', local: 'Guarapuava PR', km: 190 }
            ].map((posto, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{posto.nome}</h3>
                <p className="text-sm text-gray-600">📍 {posto.local}</p>
                <div className="text-sm text-gray-500">KM {posto.km}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Gastos do Dia {diaAtual}</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">R$ 0</div>
              <div className="text-sm text-gray-600">Total gasto no dia</div>
            </div>
          </div>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhum gasto registrado no dia {diaAtual}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultaMatinal;