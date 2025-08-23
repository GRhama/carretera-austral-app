// src/components/ConsultaMatinal.tsx - LÓGICA COMPLETA VALIDADA + HOTEL INTEGRATION
import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface PostoData {
  nome: string;
  local: string;
  km: number;          // KM do trecho individual  
  kmAcumulado: number; // Para ordenação geográfica
  status: string;
  observacoes?: string;
  isUltimo: boolean;   // Flag para identificar destino final
}

// 🏨 NOVA INTERFACE HOTEL
interface HotelData {
  nome: string;
  cidade: string;
  endereco?: string;
  checkin: string;
  checkout: string;
  status: string;
  codigoReserva?: string;
  observacoes?: string;
}

// ✅ DADOS HARDCODED - NAVEGAÇÃO PRÉ-DETERMINADA
const NAVEGACAO_PREDETERMINADA = {
  6: {
    titulo: "Mendoza → Curicó",
    subtitulo: "Via Caracoles - Cordilheira dos Andes",
    critico: true,
    distancia: "555km",
    tempo_estimado: "8h",
    
    aviso_principal: "Google Maps pode sugerir rota rápida via Buenos Aires. Use os waypoints para garantir experiência cinematográfica dos Andes.",
    
    rota_correta: [
      {
        passo: 1,
        descricao: "Mendoza → Potrerillos (dique azul turquesa)",
        emoji: "📍"
      },
      {
        passo: 2, 
        descricao: "Potrerillos → Uspallata (vista Aconcagua)",
        emoji: "🏔️"
      },
      {
        passo: 3,
        descricao: "Uspallata → Caracoles (cenário cinematográfico)",
        emoji: "🛣️"
      },
      {
        passo: 4,
        descricao: "Chile → Curicó (vinícolas)",
        emoji: "🇨🇱"
      }
    ],
    
    waypoints_url: "https://www.google.com/maps/dir/-32.889,-68.845/-32.594687,-69.371063/-32.907688,-70.293688/-34.986,-71.233",
    
    instrucoes_manuais: [
      "1. Sair de Mendoza pela RP82",
      "2. Parar em Potrerillos (dique azul) - foto obrigatória!",
      "3. Continuar para Uspallata - vista do Aconcagua", 
      "4. Seguir RN7 pelos Caracoles (cenário cinematográfico)",
      "5. Cruzar fronteira Los Libertadores",
      "6. Parar COPEC Rio Blanco (primeiro posto Chile)",
      "7. Seguir R60 + R57 até Curicó",
      "",
      "⚠️ NUNCA seguir sugestão 'via Buenos Aires'",
      "🕐 Tempo estimado: 8h (se menos de 7h = rota errada!)"
    ],
    
    evitar_rotas: [
      "Rota via Buenos Aires (400km, 6h) - rápida mas SEM cenário cinematográfico",
      "Desvio por outros pasos - perde vista do Aconcagua", 
      "Tempo < 7h - significa que não está passando pelos Caracoles"
    ],
    
    coordenadas_backup: {
      "YPF Potrerillos (último posto Argentina)": "-32.594687,-69.371063",
      "COPEC Rio Blanco (primeiro posto Chile)": "-32.907688,-70.293688"
    }
  },

  7: {
    titulo: "Puerto Montt → Hornopirén",
    subtitulo: "Início Carretera Austral + Balsas",
    critico: true,
    distancia: "120km",
    tempo_estimado: "4h",
    
    aviso_principal: "Google Maps pode sugerir rota direta. É obrigatório usar as balsas para chegar ao KM 0 da Carretera Austral.",
    
    rota_correta: [
      {
        passo: 1,
        descricao: "Puerto Montt → Puelche (balsa)",
        emoji: "🚢"
      },
      {
        passo: 2, 
        descricao: "Balsa Puelche → Caleta La Arena (30min)",
        emoji: "⛴️"
      },
      {
        passo: 3,
        descricao: "Caleta La Arena → KM 0 Carretera Austral",
        emoji: "🛣️"
      },
      {
        passo: 4,
        descricao: "KM 0 → Hornopirén (fim do dia)",
        emoji: "🏨"
      }
    ],
    
    waypoints_url: "https://www.google.com/maps/dir/Puerto+Montt+Chile/Puelche+Ferry+Terminal/Caleta+La+Arena/Hornopiren+Chile",
    
    instrucoes_manuais: [
      "1. Sair de Puerto Montt sentido Puelche",
      "2. Terminal Ferry Puelche - balsa 30min para Caleta La Arena", 
      "3. IMPORTANTE: Verificar horários das balsas!",
      "4. Caleta La Arena → KM 0 Carretera Austral (placa oficial)",
      "5. KM 0 → Hornopirén (50km pela RN 7)",
      "",
      "⚠️ Horários balsas: Verificar na chegada",
      "🕐 Última balsa: Geralmente 18:00h"
    ],
    
    evitar_rotas: [
      "Rota terrestre direta - NÃO EXISTE conexão direta",
      "Pular as balsas - IMPOSSÍVEL chegar sem elas",
      "Não verificar horários - risco de perder última balsa"
    ],
    
    coordenadas_backup: {
      "Terminal Ferry Puelche": "-41.628611,-72.968333",
      "Caleta La Arena": "-41.875833,-72.683333",
      "KM 0 Carretera Austral": "-41.926111,-72.645833"
    }
  },

  8: {
    titulo: "Hornopirén → Chaitén", 
    subtitulo: "Balsas obrigatórias - horários críticos",
    critico: true,
    distancia: "58km + 2 balsas",
    tempo_estimado: "6h",
    
    aviso_principal: "DIA MAIS CRÍTICO DA VIAGEM! São 2 balsas obrigatórias com horários fixos. Perder horário = perder o dia inteiro.",
    
    rota_correta: [
      {
        passo: 1,
        descricao: "Hornopirén → Leptepu (balsa 1 - 2.5h)",
        emoji: "🚢"
      },
      {
        passo: 2, 
        descricao: "Leptepu → Fiordo Largo (30km terra)",
        emoji: "🛣️"
      },
      {
        passo: 3,
        descricao: "Fiordo Largo → Caleta Gonzalo (balsa 2 - 1h)",
        emoji: "⛴️"
      },
      {
        passo: 4,
        descricao: "Caleta Gonzalo → Chaitén (28km)",
        emoji: "🏨"
      }
    ],
    
    waypoints_url: "https://www.google.com/maps/dir/Hornopiren+Chile/Leptepu+Chile/Fiordo+Largo+Chile/Caleta+Gonzalo+Chile/Chaiten+Chile",
    
    instrucoes_manuais: [
      "1. ACORDAR CEDO! Primeira balsa saindo 10:00h",
      "2. Hornopirén → Terminal Leptepu (embarque 09:30h)",
      "3. Balsa Leptepu → Fiordo Largo (2h30 navegação)", 
      "4. Fiordo Largo → Terminal Caleta Gonzalo (30km)",
      "5. Segunda balsa → Caleta Gonzalo (1h)",
      "6. Caleta Gonzalo → Chaitén (28km finais)",
      "",
      "🚨 CRÍTICO: Primeira balsa 10:00h - NÃO ATRASAR!",
      "🕐 Se perder = esperar dia seguinte"
    ],
    
    evitar_rotas: [
      "Tentar ir sem as balsas - IMPOSSÍVEL, não há estrada",
      "Chegar atrasado no terminal - balsas são pontuais",
      "Não confirmar horários - podem variar por clima/maré"
    ],
    
    coordenadas_backup: {
      "Terminal Leptepu": "-42.383333,-72.633333",
      "Terminal Fiordo Largo": "-42.450000,-72.766667",
      "Terminal Caleta Gonzalo": "-42.516667,-72.716667"
    }
  },

  13: {
    titulo: "Villa La Angostura → Neuquén",
    subtitulo: "Ruta de los 7 Lagos",
    critico: true,
    distancia: "385km",
    tempo_estimado: "6h",
    
    aviso_principal: "Google Maps pode sugerir rota direta pela RN40. Use a rota dos 7 Lagos para experiência panorâmica única.",
    
    rota_correta: [
      {
        passo: 1,
        descricao: "Villa La Angostura → Lago Espejo",
        emoji: "🏔️"
      },
      {
        passo: 2, 
        descricao: "Lagos Correntoso → Escondido → Villarino",
        emoji: "💧"
      },
      {
        passo: 3,
        descricao: "Lagos Falkner → Machonico → Lácar",
        emoji: "🌊"
      },
      {
        passo: 4,
        descricao: "San Martín de los Andes → Neuquén",
        emoji: "🏙️"
      }
    ],
    
    waypoints_url: "https://www.google.com/maps/dir/Villa+La+Angostura+Argentina/Lago+Espejo+Argentina/San+Martin+de+los+Andes+Argentina/Neuquen+Argentina",
    
    instrucoes_manuais: [
      "1. Villa La Angostura → RP 65 sentido Lago Espejo",
      "2. Parar em cada mirador dos 7 lagos - fotos obrigatórias!", 
      "3. Lagos: Espejo, Correntoso, Escondido, Villarino, Falkner, Machonico, Lácar",
      "4. San Martín de los Andes - parada para almoço",
      "5. San Martín → RN 40 → Neuquén capital",
      "",
      "📸 DICA: Cada lago tem visual único - não pular miradores",
      "🕐 Tempo estimado: 6h com paradas"
    ],
    
    evitar_rotas: [
      "Rota direta RN40 - perde os lagos panorâmicos",
      "Pular miradores - desperdiça cenário único da região", 
      "Pressa excessiva - paisagem merece contemplação"
    ],
    
    coordenadas_backup: {
      "Mirador Lago Espejo": "-40.772222,-71.622222",
      "San Martín de los Andes": "-40.157778,-71.353333",
      "Entrada Neuquén": "-38.951111,-68.059167"
    }
  }
  
  // Outros dias = null (não aparecem)
};

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
  const [postos, setPostos] = useState<PostoData[]>([]);
  const [progresso, setProgresso] = useState<ProgressoData>({
    diaAtual: 1,
    totalDias: 20,
    percentualConcluido: 0,
    kmPercorridos: 0,
    kmTotal: 10385
  });
  const [hotel, setHotel] = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FUNÇÃO DE RENDERIZAÇÃO - NAVEGAÇÃO PRÉ-DETERMINADA
  const renderNavegacaoPredeterminada = (dia: number): React.ReactNode => {
    const dados = NAVEGACAO_PREDETERMINADA[dia as keyof typeof NAVEGACAO_PREDETERMINADA];
    
    if (!dados) return null; // Não aparece em dias não críticos
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8" style={{borderLeft: '4px solid #ea580c'}}>
        
        {/* HEADER */}
        <div className="flex items-center mb-4">
          <MapPin className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            🗺️ Navegação Pré-determinada - Dia {dia}
          </h2>
          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
            Rota obrigatória
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{dados.titulo}</h3>
          <p className="text-gray-600">{dados.subtitulo}</p>
        </div>

        {/* AVISO CRÍTICO */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">⚠️ ATENÇÃO: Rota Cinematográfica</h3>
              <p className="text-amber-700 text-sm mt-1">{dados.aviso_principal}</p>
            </div>
          </div>
        </div>

        {/* ROTA CORRETA */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
            ✅ Rota Cinematográfica Correta ({dados.distancia}, ~{dados.tempo_estimado})
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            {dados.rota_correta.map(passo => (
              <div key={passo.passo} className="flex items-center">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full text-xs flex items-center justify-center mr-2">
                  {passo.passo}
                </span>
                {passo.emoji} {passo.descricao}
              </div>
            ))}
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button 
            onClick={() => window.open(dados.waypoints_url, '_blank')}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
          >
            🗺️ Rota Waypoints
          </button>
          <button 
            onClick={() => mostrarInstrucoes(dados.instrucoes_manuais)}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
          >
            📋 Instruções GPS
          </button>
          <button 
            onClick={() => copiarCoordenadas(dados.coordenadas_backup)}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
          >
            📍 Copiar Coords
          </button>
        </div>

        {/* AVISO ROTAS ERRADAS */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-900 mb-2">❌ NÃO usar se Google sugerir:</h4>
          <div className="text-sm text-red-800 space-y-1">
            {dados.evitar_rotas.map((rota, index) => (
              <div key={index}>• {rota}</div>
            ))}
          </div>
        </div>

        {/* BACKUP COORDENADAS */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🔄 Backup - Coordenadas Emergência</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {Object.entries(dados.coordenadas_backup).map(([nome, coord]) => (
              <div key={nome}>
                {nome}: <code className="bg-gray-200 px-2 py-1 rounded font-mono text-xs">{coord}</code>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    );
  };

  // Funções auxiliares para navegação
  const mostrarInstrucoes = (instrucoes: string[]) => {
    alert(instrucoes.join('\n'));
  };

  const copiarCoordenadas = (coordenadas: Record<string, string>) => {
    const texto = Object.entries(coordenadas)
      .map(([nome, coord]) => `${nome}: ${coord}`)
      .join('\n');
      
    navigator.clipboard.writeText(texto).then(() => {
      // Toast notification simples
      alert('Coordenadas copiadas para clipboard!');
    });
  };

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

  const carregarDados = useCallback(async (dia?: number) => {
  const diaParaCarregar = dia || diaAtual;
  
  if (!validateConfig()) {
    setError('Configuração do Airtable inválida');
    setLoading(false);
    return;
  }

    try {
      setLoading(true);
      setError(null);

      const dataCalculada = calcularDataViagem(diaParaCarregar);
      
      // Buscar roteiro
      const resultadoRoteiro = await tables.roteiro().select({
        filterByFormula: `{Dia} = ${diaParaCarregar}`,
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

      // 🎯 BUSCAR POSTOS COM LÓGICA COMPLETA
      const resultadoPostos = await tables.gasolina().select({
        filterByFormula: `{Dia} = ${dia}`,
        maxRecords: 10
      }).firstPage().catch(() => []);

      // Processar e ordenar postos
      const postosOrdenados = resultadoPostos.map(record => ({
        nome: String(record.fields.Posto || 'Posto'),
        local: String(record.fields.Localização || 'Local não definido'),
        km: Number(record.fields['KM Trecho'] || 0),
        kmAcumulado: Number(record.fields['KM Acumulado'] || 0),
        status: String(record.fields.Status || '📋 Planejado'),
        observacoes: record.fields.Observações ? String(record.fields.Observações) : undefined,
        isUltimo: false // Será definido depois da ordenação
      }))
      .sort((a, b) => a.kmAcumulado - b.kmAcumulado);

      // 🔧 IDENTIFICAR ÚLTIMO POSTO (DESTINO FINAL)
      const postosProcessados = postosOrdenados.map((posto, index) => ({
        ...posto,
        isUltimo: index === postosOrdenados.length - 1 // Último da lista = destino final
      }));

      setPostos(postosProcessados);

      // 🏨 BUSCAR HOTEL DO DIA
      const resultadoHotel = await tables.hoteis().select({
        filterByFormula: `{Dia} = ${dia}`,
        maxRecords: 1
      }).firstPage().catch(() => []);

      if (resultadoHotel.length > 0) {
        const hotelEncontrado = resultadoHotel[0];
        const dadosHotel: HotelData = {
          nome: String(hotelEncontrado.fields.Hotel || `Hotel em ${hotelEncontrado.fields.Cidade}`),
          cidade: String(hotelEncontrado.fields.Cidade || ''),
          endereco: hotelEncontrado.fields.Endereco ? String(hotelEncontrado.fields.Endereco) : undefined,
          checkin: String(hotelEncontrado.fields['Check-in'] || dataCalculada),
          checkout: String(hotelEncontrado.fields['Check-out'] || dataCalculada),
          status: String(hotelEncontrado.fields.Status || '🔍 Pesquisando'),
          codigoReserva: hotelEncontrado.fields.Codigo_Reserva ? String(hotelEncontrado.fields.Codigo_Reserva) : undefined,
          observacoes: hotelEncontrado.fields.Observações ? String(hotelEncontrado.fields.Observações) : undefined
        };
        setHotel(dadosHotel);
      } else {
        setHotel(null);
      }

      const kmPercorridosCalculado = diaParaCarregar > 1 ? (diaParaCarregar - 1) * 520 : 0;
      const percentualCalculado = (kmPercorridosCalculado / 10385) * 100;

      setProgresso(prev => ({
        ...prev,
        diaAtual: diaParaCarregar,
        percentualConcluido: percentualCalculado,
        kmPercorridos: kmPercorridosCalculado
      }));

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [diaAtual]);

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

  // 🗺️ FUNÇÕES DE NAVEGAÇÃO
  const generateGoogleMapsLink = (hotel: HotelData): string => {
    if (hotel.endereco) {
      return `https://www.google.com/maps/search/${encodeURIComponent(hotel.endereco + ', ' + hotel.cidade)}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(hotel.nome + ' ' + hotel.cidade)}`;
  };

  const generateWazeLink = (hotel: HotelData): string => {
    if (hotel.endereco) {
      return `https://waze.com/ul?q=${encodeURIComponent(hotel.endereco + ', ' + hotel.cidade)}`;
    }
    return `https://waze.com/ul?q=${encodeURIComponent(hotel.nome + ' ' + hotel.cidade)}`;
  };

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

        {/* ✅ NAVEGAÇÃO PRÉ-DETERMINADA - INSERIDA AQUI */}
        {renderNavegacaoPredeterminada(diaAtual)}

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
              <h2 className="text-xl font-bold text-gray-900">Hotel do Dia {diaAtual}</h2>
            </div>

            {hotel ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{hotel.nome}</h3>
                  <p className="text-gray-600">🏙️ {hotel.cidade}</p>
                </div>

                {hotel.endereco && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Endereço</div>
                    <div className="font-medium">📍 {hotel.endereco}</div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Check-in</div>
                    <div className="font-medium">📅 {formatarDataBrasil(hotel.checkin)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Status</div>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      hotel.status.includes('Confirmado') 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {hotel.status}
                    </span>
                  </div>
                </div>

                {hotel.codigoReserva && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600">Código da Reserva</div>
                    <div className="font-mono font-medium">🎫 {hotel.codigoReserva}</div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button 
                    onClick={() => window.open(generateGoogleMapsLink(hotel), '_blank')}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    🗺️ Google Maps
                  </button>
                  <button 
                    onClick={() => window.open(generateWazeLink(hotel), '_blank')}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    📍 Waze
                  </button>
                </div>

                {hotel.observacoes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800">💬 {hotel.observacoes}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Hotel className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Hotel não definido para o dia {diaAtual}</p>
                <button 
                  onClick={() => carregarDados(diaAtual)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Tentar recarregar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🎯 POSTOS COM LÓGICA COMPLETA VALIDADA */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Fuel className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Postos Estratégicos Dia {diaAtual}
            </h2>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {postos.length} postos
            </span>
          </div>

          {postos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {postos.map((posto, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-3 sm:p-4 transition-shadow bg-white ${
                    posto.isUltimo 
                      ? 'border-green-300 bg-green-50 hover:shadow-lg' 
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  {/* Header com status */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                      {posto.nome}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium self-start shrink-0 ${
                      posto.isUltimo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {posto.status}
                    </span>
                  </div>
                  
                  {/* Localização */}
                  <p className="text-sm text-gray-600 mb-3">
                    📍 {posto.local}
                  </p>
                  
                  {/* 🎯 LÓGICA DIFERENCIADA - ÚLTIMO vs INTERMEDIÁRIOS */}
                  <div className="space-y-2">
                    {posto.isUltimo ? (
                      // ÚLTIMO POSTO = DESTINO FINAL
                      <div className="flex items-center text-sm">
                        <span className="text-green-600 font-medium">
                          🏁 Destino final do dia
                        </span>
                      </div>
                    ) : posto.km > 0 ? (
                      // POSTOS INTERMEDIÁRIOS = DISTÂNCIA ATÉ PRÓXIMO
                      <div className="flex items-center text-sm">
                        <span className="text-blue-600 font-medium">
                          → {posto.km}km até próximo posto
                        </span>
                      </div>
                    ) : (
                      // PRIMEIRO POSTO = PONTO DE PARTIDA
                      <div className="flex items-center text-sm">
                        <span className="text-purple-600 font-medium">
                          🏁 Ponto de partida
                        </span>
                      </div>
                    )}
                    
                    {/* Observações importantes */}
                    {posto.observacoes && (
                      <div className={`p-2 rounded text-xs border-l-2 ${
                        posto.isUltimo 
                          ? 'bg-green-50 text-green-800 border-green-300'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-300'
                      }`}>
                        💡 {posto.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 🔧 TRATAMENTO ESPECIAL DIA 5 (SEM POSTOS)
            <div className="text-center py-8">
              {diaAtual === 5 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <Hotel className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                  <h3 className="font-semibold text-blue-900 mb-2">Dia de Descanso em Mendoza</h3>
                  <p className="text-blue-700 text-sm mb-2">
                    ☕ Dia livre para turismo e descanso
                  </p>
                  <p className="text-blue-600 text-xs">
                    ⛽ Abastecimento feito no dia anterior
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Fuel className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum posto definido para o dia {diaAtual}</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Verifique dados no Airtable
                  </p>
                </div>
              )}
            </div>
          )}
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