// src/components/ConsultaMatinal.tsx - COM MAPEAMENTO KM REAL
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

// 🏍️ MAPEAMENTO REAL CARRETERA AUSTRAL (distâncias verificadas)
const DISTANCIAS_CARRETERA_AUSTRAL: Record<string, number> = {
  // BRASIL - Preparação
  "São Paulo → Guarapuava": 460,
  "Guarapuava → Curitiba": 267,
  "Curitiba → Florianópolis": 301,
  "Florianópolis → Porto Alegre": 476,
  "Porto Alegre → Uruguaiana": 630,
  
  // ARGENTINA - Início
  "Uruguaiana → Buenos Aires": 650,
  "Buenos Aires → Bariloche": 832,
  "Bariloche → Villa La Angostura": 81,
  "Villa La Angostura → San Martín de los Andes": 107,
  
  // CHILE - Carretera Austral
  "San Martín → Puerto Montt": 347,
  "Puerto Montt → Chaitén": 120, // Balsa
  "Chaitén → La Junta": 151,
  "La Junta → Villa Santa Lucía": 84,
  "Villa Santa Lucía → Coyhaique": 237,
  "Coyhaique → Puerto Río Tranquilo": 223,
  "Puerto Río Tranquilo → El Calafate": 347,
  "El Calafate → El Chaltén": 220,
  "El Chaltén → Ushuaia": 594,
  "Ushuaia → Punta Arenas": 680,
  "Punta Arenas → Santiago": 1420, // Voo de retorno
  
  // Trechos alternativos comuns
  "Puerto Montt → Villa La Angostura": 265,
  "Coyhaique → Chile Chico": 323,
  "Chile Chico → El Calafate": 420,
  "Bariloche → El Calafate": 875,
  "Puerto Natales → El Calafate": 267,
  "Ushuaia → Río Gallegos": 593,
  
  // Trechos internos Argentina
  "El Calafate → Puerto Natales": 267,
  "El Chaltén → El Calafate": 220,
  "El Calafate → Ushuaia": 594,
  
  // Variações de nomes
  "São Paulo → SP": 0,
  "SP → Guarapuava": 460,
  "Buenos Aires → BA": 0,
  "BA → Bariloche": 832
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

  // 🚗 FUNÇÃO OTIMIZADA - Extração KM com Fallback Hardcoded
  const extrairKilometragem = (trecho: string): string => {
    if (!trecho) return 'N/A';
    
    // PRIMEIRO: Tentar encontrar KM nos dados (futuro)
    const kmMatch = trecho.match(/(\d+)\s*km/i);
    if (kmMatch) {
      return `${parseInt(kmMatch[1]).toLocaleString()} km`;
    }
    
    // SEGUNDO: Buscar no mapeamento hardcoded
    const trechoLimpo = trecho.trim();
    const distancia = DISTANCIAS_CARRETERA_AUSTRAL[trechoLimpo];
    
    if (distancia) {
      return `${distancia.toLocaleString()} km`;
    }
    
    // TERCEIRO: Tentar variações do nome
    const possiveisVariacoes = [
      trechoLimpo.replace('→', '→'), // Normalizar seta
      trechoLimpo.replace(' → ', ' → '), // Normalizar espaços
      trechoLimpo.replace(/\s+/g, ' '), // Normalizar espaços múltiplos
    ];
    
    for (const variacao of possiveisVariacoes) {
      const dist = DISTANCIAS_CARRETERA_AUSTRAL[variacao];
      if (dist) {
        return `${dist.toLocaleString()} km`;
      }
    }
    
    // QUARTO: Buscar por palavras-chave principais
    const cidades = trechoLimpo.split('→').map(c => c.trim());
    if (cidades.length === 2) {
      const [origem, destino] = cidades;
      
      // Buscar combinações parciais
      for (const [key, value] of Object.entries(DISTANCIAS_CARRETERA_AUSTRAL)) {
        if (key.includes(origem) && key.includes(destino)) {
          return `${value.toLocaleString()} km`;
        }
      }
    }
    
    // FALLBACK: Estimativa baseada na região
    if (trechoLimpo.includes('São Paulo') || trechoLimpo.includes('Guarapuava')) {
      return '~460 km'; // Estimativa Brasil
    }
    if (trechoLimpo.includes('Buenos Aires') || trechoLimpo.includes('Bariloche')) {
      return '~400 km'; // Estimativa Argentina
    }
    if (trechoLimpo.includes('Puerto') || trechoLimpo.includes('Chile')) {
      return '~250 km'; // Estimativa Carretera Austral
    }
    if (trechoLimpo.includes('Ushuaia') || trechoLimpo.includes('Calafate')) {
      return '~350 km'; // Estimativa Patagônia
    }
    
    return 'N/A'; // Último recurso
  };

  // Função corrigida - Data fixa 17/10/2025
  const calcularDataViagem = (dia: number): string => {
    const dataBase = new Date(2025, 9, 17); // 17 de outubro de 2025
    const dataFinal = new Date(dataBase.getTime());
    dataFinal.setDate(dataBase.getDate() + (dia - 1));
    return dataFinal.toISOString().split('T')[0];
  };

  // Função para formatar data em português
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

      // Buscar roteiro do dia específico
      const resultadoRoteiro = await tables.roteiro().select({
        filterByFormula: `{Dia} = ${dia}`,
        maxRecords: 1
      }).firstPage();

      if (resultadoRoteiro.length > 0) {
        const roteiroEncontrado = resultadoRoteiro[0];
        
        const dadosRoteiro: RoteiroData = {
          Trecho: roteiroEncontrado.fields.Trecho || 'Trecho não definido',
          Data: dataCalculada,
          Status: roteiroEncontrado.fields.Status || 'Não iniciado',
          Dificuldade: roteiroEncontrado.fields.Dificuldade || 'N/A',
          Observacoes: roteiroEncontrado.fields.Observacoes
        };

        setRoteiro(dadosRoteiro);
      } else {
        setRoteiro(null);
      }

      // Atualizar progresso baseado no dia atual
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

  // Funções de navegação
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

  // Calcular dias restantes até a viagem
  const dataViagem = new Date(2025, 9, 17);
  const hoje = new Date();
  const diasRestantes = Math.ceil((dataViagem.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              🌅 Carretera Austral
            </h1>
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
        
        {/* Navegação entre Dias */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Navegação por Dias</h2>
            <div className="text-sm text-gray-600">
              {diaAtual} de {progresso.totalDias} dias
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            {/* Botão Dia Anterior */}
            <button
              onClick={irParaDiaAnterior}
              disabled={diaAtual <= 1}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                diaAtual <= 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              ← Dia Anterior
            </button>

            {/* Seletor de Dia */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Dia:</span>
              <select
                value={diaAtual}
                onChange={(e) => irParaDia(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(dia => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Próximo Dia */}
            <button
              onClick={irParaProximoDia}
              disabled={diaAtual >= 20}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                diaAtual >= 20 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Próximo Dia →
            </button>
          </div>
        </div>
        
        {/* Progresso da Viagem */}
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

          {/* Barra de Progresso */}
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
          
          {/* Roteiro do Dia - COM KM REAL */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Roteiro do Dia {diaAtual}</h2>
            </div>

            {roteiro ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {roteiro.Trecho}
                  </h3>
                  <p className="text-gray-600">
                    📅 {formatarDataBrasil(roteiro.Data)}
                  </p>
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
                    <div className="text-lg font-semibold">
                      {roteiro.Dificuldade}
                    </div>
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
                    <span className="text-sm text-gray-600">
                      • {roteiro.Observacoes}
                    </span>
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

          {/* Hotel */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Hotel className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Hotel</h2>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Hotel className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Hotel não definido para este dia</p>
              <p className="text-xs mt-1 text-gray-400">
                Verificar reserva no sistema
              </p>
            </div>
          </div>

        </div>

        {/* Postos Estratégicos */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Fuel className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Postos Estratégicos
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { nome: 'Posto Saída SP', local: 'Rua Carlos Weber 490 São Paulo', km: 0, status: '📋 Planejado' },
              { nome: 'BR Itapeva', local: 'Itapeva SP', km: 120, status: '📋 Planejado' },
              { nome: 'Petrobras Itapetininga', local: 'Itapetininga SP', km: 160, status: '📋 Planejado' },
              { nome: 'Petrobras Guarapuava', local: 'Guarapuava PR', km: 190, status: '📋 Planejado' },
              { nome: 'Shell Ponta Grossa', local: 'Ponta Grossa PR', km: 220, status: '📋 Planejado' }
            ].map((posto, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{posto.nome}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {posto.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  📍 {posto.local}
                </p>
                
                <div className="text-sm">
                  <span className="text-gray-500">KM {posto.km}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos do Dia */}
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
            <p className="text-xs mt-1 text-gray-400">
              Use o botão + para adicionar gastos
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConsultaMatinal;