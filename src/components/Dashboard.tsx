import React from 'react';
import { MapPin, DollarSign, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { useGastos } from '../hooks/useGastos';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className = '' 
}) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm mt-1 ${trend ? trendColors[trend] : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-carretera-100 rounded-md flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// Função para formatar mês/ano - VERSÃO SEGURA
const formatarMesAno = (mesAno: string): string => {
  console.log('🗓️ [formatarMesAno] Input:', mesAno);
  
  if (mesAno === 'Sem data') {
    console.log('🗓️ [formatarMesAno] Output: Sem data');
    return 'Sem data';
  }
  
  try {
    const [ano, mes] = mesAno.split('-');
    console.log('🗓️ [formatarMesAno] Parsed - Ano:', ano, 'Mês:', mes);
    
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const numeroMes = parseInt(mes) - 1;
    
    if (isNaN(numeroMes) || numeroMes < 0 || numeroMes > 11) {
      console.warn('⚠️ [formatarMesAno] Mês inválido:', mes, 'numeroMes:', numeroMes);
      return mesAno;
    }
    
    const resultado = `${meses[numeroMes]} de ${ano}`;
    console.log('🗓️ [formatarMesAno] Output:', resultado);
    return resultado;
    
  } catch (error) {
    console.error('❌ [formatarMesAno] Erro:', error, 'Input:', mesAno);
    return mesAno;
  }
};

const Dashboard: React.FC = () => {
  console.log('🚀 [Dashboard] Renderizando componente...');
  
  const { gastos, loading, error, totalGasto, refreshGastos } = useGastos();
  
  console.log('📊 [Dashboard] Estado atual:', { 
    gastosLength: gastos?.length || 0, 
    loading, 
    error, 
    totalGasto 
  });

  // Early returns para estados de loading/error
  if (loading) {
    console.log('⏳ [Dashboard] Estado: Loading');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carretera-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados da viagem...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [Dashboard] Estado: Error -', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erro de conexão</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ [Dashboard] Estado: Success - Processando dados...');

  // Calcular estatísticas básicas
  const orcamentoTotal = 14824;
  const kmTotal = 10385;
  const percentualGasto = totalGasto > 0 ? (totalGasto / orcamentoTotal) * 100 : 0;
  
  console.log('💰 [Dashboard] Cálculos financeiros:', {
    totalGasto,
    orcamentoTotal,
    percentualGasto: percentualGasto.toFixed(2) + '%'
  });
  
  const dataViagem = new Date('2025-10-17');
  const hoje = new Date();
  const diasRestantes = Math.ceil((dataViagem.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  console.log('📅 [Dashboard] Cálculo de tempo:', {
    dataViagem: dataViagem.toISOString().split('T')[0],
    hoje: hoje.toISOString().split('T')[0],
    diasRestantes
  });

  // Processar gastos por mês - DECLARAÇÃO SEGURA E COM LOGS
  console.log('📊 [Dashboard] Iniciando processamento de gastos por mês...');
  
  const gastosValidos = gastos || [];
  console.log('📊 [Dashboard] Gastos válidos:', gastosValidos.length);
  
  // Inicializar gastosPorMes como objeto vazio
  const gastosPorMes: Record<string, typeof gastos> = {};
  
  gastosValidos.forEach((gasto, index) => {
    console.log(`📊 [Dashboard] Processando gasto ${index + 1}:`, {
      id: gasto.id,
      data: gasto.fields.Data,
      categoria: gasto.fields.Categoria,
      valor: gasto.fields.Valor
    });
    
    const data = gasto.fields.Data;
    
    if (!data) {
      console.log(`📊 [Dashboard] Gasto ${index + 1}: Sem data - adicionando a 'Sem data'`);
      const semDataKey = 'Sem data';
      if (!gastosPorMes[semDataKey]) {
        gastosPorMes[semDataKey] = [];
        console.log('📊 [Dashboard] Criando grupo "Sem data"');
      }
      gastosPorMes[semDataKey].push(gasto);
      return;
    }
    
    try {
      const partesData = data.split('-');
      console.log(`📊 [Dashboard] Gasto ${index + 1}: Partes da data:`, partesData);
      
      if (partesData.length >= 2) {
        const [ano, mes] = partesData;
        const mesAno = `${ano}-${mes}`;
        
        console.log(`📊 [Dashboard] Gasto ${index + 1}: Grupo ${mesAno}`);
        
        if (!gastosPorMes[mesAno]) {
          gastosPorMes[mesAno] = [];
          console.log(`📊 [Dashboard] Criando novo grupo: ${mesAno}`);
        }
        gastosPorMes[mesAno].push(gasto);
      } else {
        console.warn(`⚠️ [Dashboard] Gasto ${index + 1}: Data mal formatada:`, data);
        const semDataKey = 'Sem data';
        if (!gastosPorMes[semDataKey]) gastosPorMes[semDataKey] = [];
        gastosPorMes[semDataKey].push(gasto);
      }
    } catch (error) {
      console.error(`❌ [Dashboard] Erro processando gasto ${index + 1}:`, error, 'Data:', data);
      const semDataKey = 'Sem data';
      if (!gastosPorMes[semDataKey]) gastosPorMes[semDataKey] = [];
      gastosPorMes[semDataKey].push(gasto);
    }
  });

  const mesesEncontrados = Object.keys(gastosPorMes);
  console.log('📅 [Dashboard] Meses encontrados:', mesesEncontrados);
  console.log('📊 [Dashboard] Distribuição por mês:', 
    Object.entries(gastosPorMes).map(([mes, gastos]) => ({
      mes,
      quantidade: gastos.length,
      total: gastos.reduce((sum, g) => sum + (g.fields.Valor || 0), 0)
    }))
  );

  console.log('🎨 [Dashboard] Iniciando renderização da interface...');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏍️ Carretera Austral
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Chile • Argentina • 20 dias • 4 motociclistas
              </p>
            </div>
            <button
              onClick={() => {
                console.log('🔄 [Dashboard] Botão refresh clicado');
                refreshGastos();
              }}
              className="bg-carretera-600 hover:bg-carretera-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Distância Total"
            value={`${kmTotal.toLocaleString()} km`}
            subtitle="Chile + Argentina"
            icon={<MapPin className="h-5 w-5 text-carretera-600" />}
          />
          
          <StatCard
            title="Orçamento"
            value={`R$ ${totalGasto.toLocaleString('pt-BR')}`}
            subtitle={`${percentualGasto.toFixed(1)}% de R$ ${orcamentoTotal.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="h-5 w-5 text-carretera-600" />}
            trend={percentualGasto > 80 ? 'up' : percentualGasto > 50 ? 'neutral' : 'down'}
          />
          
          <StatCard
            title="Dias Restantes"
            value={diasRestantes > 0 ? diasRestantes : 'EM VIAGEM!'}
            subtitle={diasRestantes > 0 ? 'até 17/10/2025' : 'Boa viagem!'}
            icon={<Calendar className="h-5 w-5 text-carretera-600" />}
          />
          
          <StatCard
            title="Gastos Registrados"
            value={gastosValidos.length}
            subtitle="Últimas transações"
            icon={<TrendingUp className="h-5 w-5 text-carretera-600" />}
          />
        </div>

        {/* Gastos por Mês */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Gastos por Período
            </h3>
            <span className="text-sm text-gray-500">
              {gastosValidos.length} gastos carregados
            </span>
          </div>
          
          <div className="px-6 py-4">
            {gastosValidos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum gasto registrado ainda. 
                <br />
                Use o botão + para adicionar o primeiro!
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(gastosPorMes)
                  .sort(([a], [b]) => {
                    console.log('🔄 [Dashboard] Ordenando mês:', a, 'vs', b);
                    if (a === 'Sem data') return 1;
                    if (b === 'Sem data') return -1;
                    return a.localeCompare(b); // MUDEI B POR A para agosto vir primeiro
                  })
                  .slice(0, 3)
                  .map(([mes, gastosDoMes]) => {
                    const totalMes = gastosDoMes.reduce((sum, g) => sum + (g.fields.Valor || 0), 0);
                    console.log(`📅 [Dashboard] Renderizando mês ${mes}:`, {
                      gastos: gastosDoMes.length,
                      total: totalMes
                    });
                    
                    return (
                      <div key={mes}>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
                          📅 {formatarMesAno(mes)}
                          <span className="ml-2 text-xs text-gray-500">
                            ({gastosDoMes.length} gastos - R$ {totalMes.toLocaleString('pt-BR')})
                          </span>
                        </h4>
                        <div className="space-y-2">
                          {gastosDoMes.slice(0, 8).map((gasto, index) => {
                            console.log(`📝 [Dashboard] Renderizando gasto ${index + 1} do mês ${mes}:`, gasto.id);
                            return (
                              <div key={gasto.id} className="flex justify-between items-center py-1 pl-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {gasto.fields.Categoria || '❓ Sem categoria'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {gasto.fields.Responsável || 'Sem responsável'} • 📅 {gasto.fields.Data}
                                    {gasto.fields.Local && ` • 📍 ${gasto.fields.Local}`}
                                  </p>
                                  {gasto.fields.Descrição && (
                                    <p className="text-xs text-gray-400">
                                      💬 {gasto.fields.Descrição}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    R$ {gasto.fields.Valor?.toLocaleString('pt-BR') || '0'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {gastosDoMes.length > 8 && (
                            <p className="text-xs text-gray-400 pl-4">
                              ... e mais {gastosDoMes.length - 8} gastos
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
