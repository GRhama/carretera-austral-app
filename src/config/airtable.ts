import Airtable from 'airtable';
import { AirtableConfig } from '../types/airtable';

export const AIRTABLE_CONFIG: AirtableConfig = {
  baseId: 'appvCzoqxIIAEQU67', // SUBSTITUA pelo seu Base ID
  apiKey: 'patY7x277ab2fKKyD.5f2853a50d753530fa7e71dab9f6e83a7b35ce53643a7c0850b1b16c71ba5b65', // SUBSTITUA pelo seu token NOVO
  tables: {
    gastos: 'tblITcCCTJK9uFwUC',      // SUBSTITUA
    roteiro: 'tblI0dlh1t1ak2B1O',    // SUBSTITUA
    hoteis: 'tbl0mpLKNXOK8VaoB',      // SUBSTITUA
    gasolina: 'tblzUwaN7SBSA7M0b',  // SUBSTITUA
    visitas: 'tblkGu9H0xdFpOWeo',    // SUBSTITUA
    documentos: 'tbl7LwBwAkvxWsHY7' // SUBSTITUA
  }
};

Airtable.configure({
  apiKey: AIRTABLE_CONFIG.apiKey
});

export const base = Airtable.base(AIRTABLE_CONFIG.baseId);

export const validateConfig = (): boolean => {
  const { baseId, apiKey, tables } = AIRTABLE_CONFIG;
  
  if (baseId === 'YOUR_BASE_ID' || apiKey === 'YOUR_NEW_TOKEN') {
    console.error('⚠️ Airtable config não configurado! Atualize src/config/airtable.ts');
    return false;
  }
  
  const missingTables = Object.entries(tables)
    .filter(([_, id]) => id.startsWith('YOUR_'))
    .map(([name]) => name);
    
  if (missingTables.length > 0) {
    console.error(`⚠️ Table IDs não configurados: ${missingTables.join(', ')}`);
    return false;
  }
  
  return true;
};

export const tables = {
  gastos: () => base(AIRTABLE_CONFIG.tables.gastos),
  roteiro: () => base(AIRTABLE_CONFIG.tables.roteiro),
  hoteis: () => base(AIRTABLE_CONFIG.tables.hoteis),
  gasolina: () => base(AIRTABLE_CONFIG.tables.gasolina),
  visitas: () => base(AIRTABLE_CONFIG.tables.visitas),
  documentos: () => base(AIRTABLE_CONFIG.tables.documentos)
};
