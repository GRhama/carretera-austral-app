// Airtable Base Types
export interface AirtableRecord<T = any> {
  id: string;
  createdTime: string;
  fields: T;
}

// Gastos Table - CAMPOS EXATOS DA SUA TABELA
export interface GastoFields {
  Categoria: string; // Simplificado - aceita qualquer string (incluindo emojis)
  Valor: number;
  Responsável: string;
  Descrição?: string;
  Local?: string;
  Método?: string;
  Data: string;
}

export type GastoRecord = AirtableRecord<GastoFields>;

// Roteiro Table  
export interface RoteiroFields {
  Dia: number;
  Data: string;
  Origem: string;
  Destino: string;
  Distancia_KM: number;
  Status: 'Não iniciado' | 'Em andamento' | 'Concluído';
  Dificuldade: 'Fácil' | 'Médio' | 'Difícil' | 'Extremo';
  Observacoes?: string;
}

export type RoteiroRecord = AirtableRecord<RoteiroFields>;

// Hotéis Table
export interface HotelFields {
  Nome: string;
  Cidade: string;
  Preco_Diaria: number;
  Status: 'Pesquisando' | 'Cotando' | 'Reservado' | 'Confirmado';
  Dia?: string;
  Contato?: string;
  Observacoes?: string;
  Link_Booking?: string;
}

export type HotelRecord = AirtableRecord<HotelFields>;

// Gasolina Table
export interface GasolinaFields {
  Nome_Posto: string;
  Cidade: string;
  Coordenadas?: string;
  Status: 'Identificado' | 'Abastecido';
  Preco_Litro?: number;
  Litros_Abastecidos?: number;
  Total_Gasto?: number;
  Observacoes?: string;
}

export type GasolinaRecord = AirtableRecord<GasolinaFields>;

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
