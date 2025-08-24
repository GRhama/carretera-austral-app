import React, { useState } from 'react';
import { RefreshCw, Plus, Download, Calendar, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useGastos } from '../hooks/useGastos';
import AddGastoForm from './AddGastoForm';

const Dashboard: React.FC = () => {
  const { gastos, loading, error, totalGasto, refreshGastos } = useGastos();
  const [showAddForm, setShowAddForm] = useState(false);

  // 📊 FUNÇÃO CSV EXPORT
  const exportarCSV = () => {
    if (gastos.length === 0) {
      alert('Nenhum gasto para exportar!');
      return;
    }

    // Headers em português para Excel Brasil
    const headers = [
      'Data',
      'Categoria', 
      'Valor (R$)',
      'Responsável',
      'Local',
      'Descrição'
    ];

    // Converter dados para CSV
    const dadosCSV = gastos.map(gasto => {
      const data = gasto.fields.Data || '';
      const categoria = gasto.fields.Categoria || '';
      const valor = gasto.fields.Valor || 0;
      const responsavel = gasto.fields.Responsável || '';
      const local = gasto.fields.Local || '';
      const descricao = gasto.fields.Descrição || '';

      return [
        data,
        categoria,
        valor.toFixed(2).replace('.', ','), // Formato brasileiro: 250,00
        responsavel,
        local,
        descricao
      ];
    });

    // Criar conteúdo CSV com BOM para UTF-8 (acentos corretos no Excel)
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(';'), // Separador ; para Excel Brasil
      ...dadosCSV.map(linha => linha.map(campo => 
        // Escapar campos com vírgula/ponto-e-vírgula
        campo.toString().includes(';') || campo.toString().includes(',') 
          ? `"${campo}"` 
          : campo
      ).join(';'))
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Nome do arquivo com data atual
    const dataHoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    link.download = `carretera-austral-gastos-${dataHoje}.csv`;
    link.href = url;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    console.log(`📊 CSV exportado com ${gastos.length} gastos - Total: R$ ${totalGasto.toFixed(2)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-carretera-600 mb-4"></div>
          <p className="text-gray-600">Carregando dados da viagem...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  // 🧮 CÁLCULOS DINÂMICOS DE ORÇAMENTO
  const KM_TOTAL = 10385;
  const VALOR_POR_KM = 1.0;
  const PESSOAS = 3;
  const DIAS_TOTAIS = 20;
  
  // Orçamento total baseado em R$ 1,00/KM para 3 pessoas
  const orcamentoTotal = KM_TOTAL * VALOR_POR_KM * PESSOAS; // R$ 31.155
  const metaDiaria = orcamentoTotal / DIAS_TOTAIS; // R$ 1.558/dia
  
  const percentualGasto = (totalGasto / orcamentoTotal) * 100;

  // 📅 CÁLCULO DOS DIAS DE VIAGEM
  const dataInicio = new Date('2025-10-17');
  const hoje = new Date();
  const diasPassados = Math.max(0, Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)));
  const diaAtualViagem = diasPassados + 1;
  const diasRestantes = Math.max(0, DIAS_TOTAIS - diasPassados);
  const emViagem = diasPassados >= 0 && diasPassados < DIAS_TOTAIS;

  // 🎯 ANÁLISE DE TENDÊNCIA DIÁRIA
  const diasEsperados = Math.max(1, emViagem ? diaAtualViagem : diasPassados);
  const gastoEsperado = metaDiaria * diasEsperados;
  const diferenca = totalGasto - gastoEsperado;
  const percentualTendencia = (diferenca / gastoEsperado) * 100;

  // 📊 STATUS DE ALERTA
  let statusTendencia: 'excelente' | 'bom' | 'atencao' | 'critico';
  if (percentualTendencia <= -10) statusTendencia = 'excelente';
  else if (percentualTendencia <= 0) statusTendencia = 'bom';
  else if (percentualTendencia <= 15) statusTendencia = 'atencao';
  else statusTendencia = 'critico';

  // 🔮 PROJEÇÃO FINAL
  const mediaDiaria = emViagem && diasPassados > 0 ? totalGasto / diasPassados : totalGasto / Math.max(1, diasEsperados);
  const projecaoFinal = mediaDiaria * DIAS_TOTAIS;

  // 📈 GASTOS DE HOJE (se em viagem)
  const hoje_str = hoje.toISOString().split('T')[0]; // YYYY-MM-DD
  const gastosHoje = gastos.filter(g => g.fields.Data === hoje_str);
  const totalHoje = gastosHoje.reduce((sum, g) => sum + (g.fields.Valor || 0), 0);
  const percentualHoje = emViagem ? (totalHoje / metaDiaria) * 100 : 0;

  // Separar gastos por mês
  const gastosPorMes = gastos.reduce((acc, gasto) => {
    const data = gasto.fields.Data;
    if (!data) {
      const semDataKey = 'Sem data';
      if (!acc[semDataKey]) acc[semDataKey] = [];
      acc[semDataKey].push(gasto);
      return acc;
    }
    
    const [ano, mes] = data.split('-');
    const mesAno = `${ano}-${mes}`;
    
    if (!acc[mesAno]) acc[mesAno] = [];
    acc[mesAno].push(gasto);
    return acc;
  }, {} as Record<string, typeof gastos>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏍️ Carretera Austral
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {KM_TOTAL.toLocaleString()} km • {PESSOAS} motociclistas • Meta: R$ {VALOR_POR_KM}/km
              </p>
            </div>
            
            {/* 🎯 BOTÕES DE AÇÃO PRINCIPAIS */}
            <div className="flex gap-3">
              <button
                onClick={() => refreshGastos()}
                className="bg-carretera-600 hover:bg-carretera-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>

              {/* 📊 BOTÃO CSV EXPORT */}
              <button
                onClick={exportarCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                disabled={gastos.length === 0}
                title={gastos.length === 0 ? 'Nenhum gasto para exportar' : `Exportar ${gastos.length} gastos`}
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 🚨 ALERTA DE TENDÊNCIA (se necessário) */}
        {emViagem && (statusTendencia === 'atencao' || statusTendencia === 'critico') && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            statusTendencia === 'critico' 
              ? 'bg-red-50 border-red-400' 
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-start">
              <AlertTriangle className={`h-5 w-5 mt-0.5 mr-3 ${
                statusTendencia === 'critico' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div>
                <h3 className={`font-semibold ${
                  statusTendencia === 'critico' ? 'text-red-900' : 'text-yellow-900'
                }`}>
                  {statusTendencia === 'critico' ? '🚨 ATENÇÃO: Gastos Acima da Meta!' : '⚠️ Cuidado: Aproximando da Meta'}
                </h3>
                <p className={`text-sm mt-1 ${
                  statusTendencia === 'critico' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  Vocês gastaram R$ {totalGasto.toFixed(2)} em {diasPassados} dias. 
                  Meta era R$ {gastoEsperado.toFixed(2)}. 
                  {diferenca > 0 ? `Estão R$ ${diferenca.toFixed(2)} acima da meta` : `Estão R$ ${Math.abs(diferenca).toFixed(2)} abaixo da meta`}.
                </p>
                <p className={`text-xs mt-2 ${
                  statusTendencia === 'critico' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  💡 Sugestão: Mantenham gastos abaixo de R$ {metaDiaria.toFixed(2)}/dia para cumprir orçamento.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 📊 RESUMO FINANCEIRO INTELIGENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* TOTAL GASTO */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    statusTendencia === 'excelente' ? 'bg-green-500' :
                    statusTendencia === 'bom' ? 'bg-blue-500' :
                    statusTendencia === 'atencao' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    <span className="text-white font-bold text-sm">R$</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Gasto
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {percentualGasto.toFixed(1)}% do orçamento
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* ORÇAMENTO DINÂMICO */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Orçamento Total
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {orcamentoTotal.toLocaleString('pt-BR')}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      R$ {VALOR_POR_KM}/km × {KM_TOTAL.toLocaleString()}km × {PESSOAS}p
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* META DIÁRIA */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Meta Diária
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      R$ {metaDiaria.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </dd>
                    <dd className="text-xs text-gray-400">
                      Para {PESSOAS} pessoas/dia
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* PROJEÇÃO / DIAS RESTANTES */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    projecaoFinal <= orcamentoTotal ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {projecaoFinal <= orcamentoTotal ? 
                      <TrendingDown className="h-4 w-4 text-white" /> :
                      <TrendingUp className="h-4 w-4 text-white" />
                    }
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {emViagem ? 'Projeção Final' : 'Dias até Viagem'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {emViagem ? 
                        `R$ ${projecaoFinal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` :
                        diasRestantes > 0 ? diasRestantes : 'EM VIAGEM!'
                      }
                    </dd>
                    <dd className="text-xs text-gray-400">
                      {emViagem ? 
                        `Média R$ ${mediaDiaria.toFixed(0)}/dia` :
                        diasRestantes > 0 ? 'até 17/10/2025' : 'Boa viagem!'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📈 GASTOS DE HOJE (se em viagem) */}
        {emViagem && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📊 Gastos de Hoje (Dia {diaAtualViagem}/20)
                {percentualHoje > 80 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    percentualHoje > 100 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {percentualHoje.toFixed(0)}% da meta
                  </span>
                )}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    R$ {totalHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-500">
                    de R$ {metaDiaria.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} meta diária
                  </div>
                </div>
                <div className={`text-right ${
                  percentualHoje > 100 ? 'text-red-600' :
                  percentualHoje > 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  <div className="text-lg font-semibold">
                    {percentualHoje.toFixed(0)}%
                  </div>
                  <div className="text-xs">
                    {percentualHoje > 100 ? 'Acima da meta' :
                     percentualHoje > 80 ? 'Próximo da meta' : 'Dentro da meta'}
                  </div>
                </div>
              </div>
              
              {/* Barra de progresso diária */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    percentualHoje > 100 ? 'bg-red-500' :
                    percentualHoje > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, percentualHoje)}%` }}
                ></div>
              </div>

              {/* Gastos de hoje detalhados */}
              {gastosHoje.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Gastos registrados hoje:</h4>
                  <div className="space-y-2">
                    {gastosHoje.map(gasto => (
                      <div key={gasto.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{gasto.fields.Categoria?.split(' ')[0] || '💰'}</span>
                          <span>{gasto.fields.Categoria}</span>
                          <span className="text-gray-500">• {gasto.fields.Responsável}</span>
                        </div>
                        <span className="font-medium">
                          R$ {(gasto.fields.Valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💰 GASTOS POR MÊS (resto do código igual) */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              💰 Histórico de Gastos
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-carretera-600 hover:bg-carretera-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar Gasto
            </button>
          </div>

          <div className="p-6">
            {Object.keys(gastosPorMes).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">📊 Nenhum gasto registrado ainda</p>
                <p className="text-gray-400 text-sm mt-2">
                  Adicione o primeiro gasto da viagem usando o botão acima
                </p>
              </div>
            ) : (
              Object.entries(gastosPorMes)
                .sort(([a], [b]) => b.localeCompare(a)) // Mês mais recente primeiro
                .map(([mesAno, gastosDoMes]) => {
                  const totalMes = gastosDoMes.reduce((sum, gasto) => sum + (gasto.fields.Valor || 0), 0);
                  
                  // Formatação do mês
                  const [ano, mes] = mesAno.split('-');
                  const nomesMeses = [
                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                  ];
                  const nomeMes = mesAno === 'Sem data' ? 'Sem data' : 
                    `${nomesMeses[parseInt(mes) - 1]} ${ano}`;

                  return (
                    <div key={mesAno} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          📅 {nomeMes}
                          <span className="text-sm font-normal text-gray-500">
                            ({gastosDoMes.length} {gastosDoMes.length === 1 ? 'gasto' : 'gastos'})
                          </span>
                        </h3>
                        <div className="text-lg font-bold text-carretera-600">
                          R$ {totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {gastosDoMes
                          .sort((a, b) => (b.fields.Data || '').localeCompare(a.fields.Data || '')) // Data mais recente primeiro
                          .map((gasto) => (
                          <div key={gasto.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">
                                {gasto.fields.Categoria?.split(' ')[0] || '💰'}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {gasto.fields.Categoria || 'Categoria não informada'}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-3">
                                  <span>📅 {gasto.fields.Data || 'Data não informada'}</span>
                                  <span>👤 {gasto.fields.Responsável || 'Não informado'}</span>
                                  {gasto.fields.Local && <span>📍 {gasto.fields.Local}</span>}
                                </div>
                                {gasto.fields.Descrição && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    💬 {gasto.fields.Descrição}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              R$ {(gasto.fields.Valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* 📊 INFORMAÇÕES DO SISTEMA */}
        {gastos.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">📊 Sistema de Orçamento Dinâmico</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Meta: R$ {VALOR_POR_KM}/KM × {KM_TOTAL.toLocaleString()}KM = R$ {orcamentoTotal.toLocaleString()} para {PESSOAS} pessoas em {DIAS_TOTAIS} dias.
                  {emViagem && ` Atualmente no dia ${diaAtualViagem} da viagem.`}
                </p>
                <p className="text-blue-600 text-xs mt-2">
                  💡 CSV disponível para acerto de contas e análise detalhada dos gastos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📝 MODAL ADICIONAR GASTO */}
      {showAddForm && (
        <AddGastoForm onClose={() => setShowAddForm(false)} />
      )}
    </div>
  );
};

export default Dashboard;