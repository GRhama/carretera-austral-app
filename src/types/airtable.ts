// src/types/airtable.ts - TIPOS FINAIS CARRETERA AUSTRAL
export interface AirtableRecord<T = any> {
  id: string;
  createdTime: string;
  fields: T;
}

// Gastos Table - CAMPOS CORRETOS
export interface GastoFields {
  Categoria: string; // Aceita qualquer string (incluindo emojis)
  Valor: number;
  Responsável: string;
  Descrição?: string;
  Local?: string;
  Método?: string;
  Data: string;
  Dia?: number; // Para link com roteiro
}

export type GastoRecord = AirtableRecord<GastoFields>;

// Roteiro Table  
export interface RoteiroFields {
  Dia: number;
  Data: string;
  Trecho: string; // "São Paulo → Guarapuva" formato
  Status: '📋 Planejado' | '🚗 Em Andamento' | '✅ Concluído';
  Combustivel: boolean; // TRUE/FALSE
  Dificuldade: '🟢 Fácil' | '🟡 Médio' | '🟠 Difícil' | '🔴 Crítico';
}

export type RoteiroRecord = AirtableRecord<RoteiroFields>;

// Hotéis Table
export interface HotelFields {
  Hotel: string; // Nome do hotel
  Data: string; // Data de check-in 
  'Check-out': string; // Data de check-out
  Preço: number;
  Status: '✅ Reservado' | '🟡 Pesquisando';
  Confirmação?: string;
  Link?: string;
  Endereço?: string;
  Observação?: string;
}

export type HotelRecord = AirtableRecord<HotelFields>;

// Gasolina/Postos Table
export interface PostoFields {
  Posto: string; // Nome do posto
  Dia: number; // Dia da viagem (1-20)
  Localização: string; // Cidade/endereço
  Coordenadas?: string;
  'KM Acumulado': number;
  'KM Trecho': number;
  Bandeira?: string;
  'Litros estimado': number;
  'Valor total': string; // "R$ 110,50" formato
  Observações?: string; // Informações cruciais
  Status: '📋 Planejado' | '✅ Concluído' | '🔴 Fechado';
}

export type PostoRecord = AirtableRecord<PostoFields>;

// Visitas Table (POIs)
export interface VisitaFields {
  Nome_Local: string;
  Cidade: string;
  Tipo: 'Atração' | 'Restaurante' | 'Viewpoint' | 'Parada Técnica' | 'Outros';
  Status: 'Planejado' | 'Visitado';
  Rating?: 1 | 2 | 3 | 4 | 5;
  Comentarios?: string;
  Fotos?: {
    id: string;
    url: string;
    filename: string;
  }[];
  Coordenadas?: string;
  Dia?: number; // Para link com roteiro
}

export type VisitaRecord = AirtableRecord<VisitaFields>;

// Documentos Table
export interface DocumentoFields {
  Documento: string;
  Responsavel: string;
  Status: 'Pendente' | 'Em andamento' | 'Concluído';
  Data_Vencimento?: string;
  Observacoes?: string;
  Arquivo?: {
    id: string;
    url: string;
    filename: string;
  }[];
}

export type DocumentoRecord = AirtableRecord<DocumentoFields>;

// API Configuration
export interface AirtableConfig {
  baseId: string;
  apiKey: string;
  tables: {
    gastos: string;
    roteiro: string;
    hoteis: string;
    gasolina: string;
    visitas: string;
    documentos: string;
  };
}

// API Response Types
export interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

export interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

// Tipos específicos para a aplicação
export interface ProgressoViagem {
  diaAtual: number;
  totalDias: number;
  kmPercorridos: number;
  kmTotal: number;
  percentualConcluido: number;
  diasRestantes: number;
  proximoMarco: {
    tipo: 'fronteira' | 'balsa' | 'cidade' | 'critico';
    nome: string;
    dia: number;
    descricao: string;
  } | null;
}

export interface AlertaItem {
  tipo: 'fronteira' | 'posto' | 'hotel' | 'balsa' | 'critico';
  prioridade: 'alta' | 'media' | 'baixa';
  titulo: string;
  descricao: string;
  icone: string;
  quando: 'hoje' | 'amanha' | 'proximo';
}

export interface DiaCompletoData {
  roteiro: RoteiroRecord | null;
  hotel: HotelRecord | null;
  postos: PostoRecord[];
  gastos: GastoRecord[];
  progresso: ProgressoViagem;
  alertas: AlertaItem[];
  loading: boolean;
  error: string | null;
}

// Estatísticas da viagem
export interface EstatisticasViagem {
  totalGastos: number;
  orcamentoUsado: number;
  projecaoFinal: number;
  mediaGastosDia: number;
  hoteisConfirmados: number;
  hoteisTotal: number;
  postosDisponiveis: number;
  diasConcluidos: number;
  kmPercorridos: number;
  percentualViagem: number;
}

// Status da aplicação
export interface StatusApp {
  versao: string;
  ultimaAtualizacao: string;
  conectividadeAirtable: boolean;
  dadosCarregados: boolean;
  erros: string[];
}