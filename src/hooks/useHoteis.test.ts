import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHoteis } from './useHoteis';

// Mock Airtable simples
const mockSelect = vi.fn();
const mockFirstPage = vi.fn();

vi.mock('../config/airtable', () => ({
  tables: {
    hoteis: () => ({
      select: mockSelect
    })
  }
}));

describe('useHoteis Hook - TESTES BÁSICOS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      firstPage: mockFirstPage
    });
    mockFirstPage.mockResolvedValue([]);
  });

  describe('🏗️ ESTADO INICIAL', () => {
    it('deve retornar estado inicial correto', () => {
      // Act
      const { result } = renderHook(() => useHoteis());
      
      // Assert - Apenas o que realmente existe
      expect(result.current.hoteis).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('deve carregar hotéis com sucesso', async () => {
      // Arrange
      const mockHoteis = [
        {
          id: 'rec1',
          fields: {
            Dia: 1,
            Hotel: 'Hotel Teste',
            Cidade: 'Cidade Teste'
          }
        }
      ];
      
      mockFirstPage.mockResolvedValue(mockHoteis);
      
      // Act
      const { result } = renderHook(() => useHoteis());
      
      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.hoteis).toHaveLength(1);
      expect(result.current.error).toBe(null);
    });

    it('deve lidar com erro ao carregar hotéis', async () => {
      // Arrange
      mockFirstPage.mockRejectedValue(new Error('Erro de teste'));
      
      // Act
      const { result } = renderHook(() => useHoteis());
      
      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.hoteis).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('📊 DADOS E FILTROS', () => {
    it('deve buscar hotéis com configuração correta', async () => {
      // Act
      renderHook(() => useHoteis());
      
      // Assert
      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalledWith({
          sort: [{ field: 'Dia', direction: 'asc' }],
          maxRecords: 100
        });
      });
    });

    it('deve processar dados de hotel corretamente', async () => {
      // Arrange
      const hotelCompleto = {
        id: 'rec1',
        fields: {
          Dia: 5,
          Hotel: 'Hotel Plaza',
          Cidade: 'Mendoza',
          Endereco: 'Rua Test 123',
          Status: '✅ Confirmado',
          'Check-in': '2025-10-20',
          'Check-out': '2025-10-21'
        }
      };
      
      mockFirstPage.mockResolvedValue([hotelCompleto]);
      
      // Act
      const { result } = renderHook(() => useHoteis());
      
      // Assert
      await waitFor(() => {
        expect(result.current.hoteis[0].fields.Hotel).toBe('Hotel Plaza');
        expect(result.current.hoteis[0].fields.Cidade).toBe('Mendoza');
        expect(result.current.hoteis[0].fields.Endereco).toBe('Rua Test 123');
      });
    });
  });

  describe('⚡ EDGE CASES', () => {
    it('deve lidar com dados malformados graciosamente', async () => {
      // Arrange
      const dadosMalformados = [
        { id: 'rec1' }, // Sem fields
        { fields: null }, // fields null
        { id: 'rec2', fields: { Hotel: 'Hotel Válido', Cidade: 'Test' } }
      ];
      
      mockFirstPage.mockResolvedValue(dadosMalformados);
      
      // Act
      const { result } = renderHook(() => useHoteis());
      
      // Assert - Não deve quebrar
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe(null);
    });

    it('deve lidar com resposta vazia', async () => {
      // Arrange
      mockFirstPage.mockResolvedValue([]);
      
      // Act
      const { result } = renderHook(() => useHoteis());
      
      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.hoteis).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });
});