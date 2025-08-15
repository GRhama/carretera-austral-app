// src/utils/postos.test.ts - Testes da Lógica de Postos
import { describe, it, expect } from 'vitest';

// 🎯 FUNÇÃO PURA PARA TESTAR
export const processarPostos = (postosRaw: any[]) => {
  const postosOrdenados = postosRaw
    .map(record => ({
      nome: String(record.fields.Posto || 'Posto'),
      local: String(record.fields.Localização || 'Local não definido'),
      km: Number(record.fields['KM Trecho'] || 0),
      kmAcumulado: Number(record.fields['KM Acumulado'] || 0),
      status: String(record.fields.Status || '📋 Planejado'),
      observacoes: record.fields.Observações ? String(record.fields.Observações) : undefined,
      isUltimo: false
    }))
    .sort((a, b) => a.kmAcumulado - b.kmAcumulado);

  return postosOrdenados.map((posto, index) => ({
    ...posto,
    isUltimo: index === postosOrdenados.length - 1
  }));
};

// 🧪 DADOS DE TESTE - DIA 1 REAL
const DADOS_DIA_1 = [
  {
    fields: {
      Posto: 'Shell Ponta Grossa',
      Localização: 'Ponta Grossa PR',
      'KM Trecho': 220,
      'KM Acumulado': 480,
      Status: '📋 Planejado',
      Observações: '12h00 - Almoço + combustível'
    }
  },
  {
    fields: {
      Posto: 'Posto Saída SP',
      Localização: 'Rua Carlos Weber 499 São Paulo',
      'KM Trecho': 0,
      'KM Acumulado': 0,
      Status: '📋 Planejado',
      Observações: '5h00 - Tanque cheio saída'
    }
  },
  {
    fields: {
      Posto: 'Petrobras Guarapuava',
      Localização: 'Guarapuava PR',
      'KM Trecho': 190,
      'KM Acumulado': 670,
      Status: '📋 Planejado',
      Observações: '15h30 - Chegada hotel'
    }
  },
  {
    fields: {
      Posto: 'BR Itapeva',
      Localização: 'Itapeva SP',
      'KM Trecho': 120,
      'KM Acumulado': 260,
      Status: '📋 Planejado',
      Observações: '8h30 - Completar tanque serra'
    }
  },
  {
    fields: {
      Posto: 'Petrobras Itapetininga',
      Localização: 'Itapetininga SP',
      'KM Trecho': 140,
      'KM Acumulado': 140,
      Status: '📋 Planejado',
      Observações: '7h00 - Café manhã + descanso'
    }
  }
];

// 🧪 DADOS DE TESTE - DIA 9 (1 POSTO)
const DADOS_DIA_9 = [
  {
    fields: {
      Posto: 'Posto Chaitén',
      Localização: 'Chaitén Chile',
      'KM Trecho': 67,
      'KM Acumulado': 4214,
      Status: '📋 Planejado',
      Observações: 'Pós-balsa - reabastecer'
    }
  }
];

describe('Lógica de Postos Estratégicos', () => {

  describe('🔧 Ordenação Geográfica', () => {
    it('deve ordenar postos por KM Acumulado (sequência geográfica)', () => {
      const resultado = processarPostos(DADOS_DIA_1);
      
      const sequenciaKM = resultado.map(p => p.kmAcumulado);
      expect(sequenciaKM).toEqual([0, 140, 260, 480, 670]);
    });

    it('deve manter nomes corretos após ordenação', () => {
      const resultado = processarPostos(DADOS_DIA_1);
      
      expect(resultado[0].nome).toBe('Posto Saída SP');
      expect(resultado[1].nome).toBe('Petrobras Itapetininga');
      expect(resultado[2].nome).toBe('BR Itapeva');
      expect(resultado[3].nome).toBe('Shell Ponta Grossa');
      expect(resultado[4].nome).toBe('Petrobras Guarapuava');
    });
  });

  describe('🎯 Detecção Último Posto', () => {
    it('deve marcar apenas o último posto como destino final', () => {
      const resultado = processarPostos(DADOS_DIA_1);
      
      // Apenas o último deve ser marcado
      expect(resultado[0].isUltimo).toBe(false); // São Paulo
      expect(resultado[1].isUltimo).toBe(false); // Itapetininga
      expect(resultado[2].isUltimo).toBe(false); // Itapeva
      expect(resultado[3].isUltimo).toBe(false); // Ponta Grossa
      expect(resultado[4].isUltimo).toBe(true);  // Guarapuava ← DESTINO
    });

    it('deve funcionar com 1 posto apenas (Dia 9)', () => {
      const resultado = processarPostos(DADOS_DIA_9);
      
      expect(resultado).toHaveLength(1);
      expect(resultado[0].isUltimo).toBe(true);
      expect(resultado[0].nome).toBe('Posto Chaitén');
    });
  });

  describe('📊 Dados Processados', () => {
    it('deve converter campos corretamente', () => {
      const resultado = processarPostos(DADOS_DIA_1);
      const primeiro = resultado[0];
      
      expect(primeiro.nome).toBe('Posto Saída SP');
      expect(primeiro.local).toBe('Rua Carlos Weber 499 São Paulo');
      expect(primeiro.km).toBe(0);
      expect(primeiro.kmAcumulado).toBe(0);
      expect(primeiro.status).toBe('📋 Planejado');
      expect(primeiro.observacoes).toBe('5h00 - Tanque cheio saída');
    });

    it('deve lidar com campos vazios', () => {
      const dadosIncompletos = [{
        fields: {
          Posto: undefined,
          Localização: '',
          'KM Trecho': null,
          'KM Acumulado': 100
        }
      }];
      
      const resultado = processarPostos(dadosIncompletos);
      
      expect(resultado[0].nome).toBe('Posto');
      expect(resultado[0].local).toBe('Local não definido');
      expect(resultado[0].km).toBe(0);
    });
  });

  describe('🔍 Cenários Críticos Validados', () => {
    it('Dia 1: deve ter 5 postos na sequência correta', () => {
      const resultado = processarPostos(DADOS_DIA_1);
      
      expect(resultado).toHaveLength(5);
      expect(resultado[0].nome).toContain('São Paulo');
      expect(resultado[4].nome).toContain('Guarapuava');
      expect(resultado[4].isUltimo).toBe(true);
    });

    it('Dia 9: deve ter 1 posto como destino final', () => {
      const resultado = processarPostos(DADOS_DIA_9);
      
      expect(resultado).toHaveLength(1);
      expect(resultado[0].isUltimo).toBe(true);
      expect(resultado[0].observacoes).toContain('balsa');
    });
  });

  describe('⚡ Performance e Edge Cases', () => {
    it('deve lidar com array vazio', () => {
      const resultado = processarPostos([]);
      expect(resultado).toEqual([]);
    });

    it('deve ser performático com muitos postos', () => {
      const muitosPostos = Array.from({ length: 100 }, (_, i) => ({
        fields: {
          Posto: `Posto ${i}`,
          Localização: `Local ${i}`,
          'KM Trecho': i * 10,
          'KM Acumulado': i * 50
        }
      }));
      
      const start = performance.now();
      const resultado = processarPostos(muitosPostos);
      const end = performance.now();
      
      expect(resultado).toHaveLength(100);
      expect(end - start).toBeLessThan(10); // < 10ms
      expect(resultado[99].isUltimo).toBe(true);
    });
  });
});

// 🎯 TESTES DE INTEGRAÇÃO - VALORES ESPERADOS
describe('Integração com Dados Reais', () => {
  it('deve produzir output esperado para motociclistas', () => {
    const resultado = processarPostos(DADOS_DIA_1);
    
    // Output para primeiro posto
    const primeiro = resultado[0];
    expect(primeiro.nome).toBe('Posto Saída SP');
    expect(primeiro.km).toBe(0); // Ponto de partida
    expect(primeiro.isUltimo).toBe(false);
    
    // Output para último posto
    const ultimo = resultado[4];
    expect(ultimo.nome).toBe('Petrobras Guarapuava');
    expect(ultimo.isUltimo).toBe(true); // Destino final
    expect(ultimo.observacoes).toContain('hotel');
  });
});