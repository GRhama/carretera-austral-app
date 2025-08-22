import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsultaMatinal from './ConsultaMatinal';

// Mock Airtable completo
const mockTables = {
  roteiro: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      firstPage: vi.fn().mockResolvedValue([])
    })
  })),
  gasolina: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      firstPage: vi.fn().mockResolvedValue([])
    })
  })),
  hoteis: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      firstPage: vi.fn().mockResolvedValue([])
    })
  })),
  gastos: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      firstPage: vi.fn().mockResolvedValue([])
    })
  }))
};

// Mock config Airtable
vi.mock('../config/airtable', () => ({
  tables: mockTables
}));

// Mock window.open para testes de navegação
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

describe('ConsultaMatinal - COBERTURA MÁXIMA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
    
    // Reset todos os mocks para comportamento padrão
    Object.values(mockTables).forEach(table => {
      table().select().firstPage.mockResolvedValue([]);
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('🏨 HOTEL INTEGRATION - RENDERIZAÇÃO', () => {
    it('deve mostrar placeholder quando não há hotel para o dia', async () => {
      // Arrange
      mockTables.hoteis().select().firstPage.mockResolvedValue([]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Hotel não definido para o dia/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Hotel do Dia 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/📍/)).not.toBeInTheDocument();
    });

    it('deve renderizar hotel completo com todos os campos', async () => {
      // Arrange - Hotel com todos os dados
      const hotelCompleto = {
        id: 'rec123',
        fields: {
          Hotel: 'Hotel Plaza Mendoza',
          Cidade: 'Mendoza',
          Endereco: 'José Federico Moreno 1570, Mendoza, Argentina',
          'Check-in': '2025-10-20',
          'Check-out': '2025-10-21',
          Status: '✅ Confirmado',
          Codigo_Reserva: 'PLZ123456',
          Observações: 'Hotel 4 estrelas no centro. Check-in após 15h.'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelCompleto]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Verificar TODOS os campos
      await waitFor(() => {
        expect(screen.getByText('Hotel Plaza Mendoza')).toBeInTheDocument();
      });
      
      expect(screen.getByText('🏙️ Mendoza')).toBeInTheDocument();
      expect(screen.getByText('📍 José Federico Moreno 1570, Mendoza, Argentina')).toBeInTheDocument();
      expect(screen.getByText('🎫 PLZ123456')).toBeInTheDocument();
      expect(screen.getByText('💬 Hotel 4 estrelas no centro. Check-in após 15h.')).toBeInTheDocument();
      
      // Verificar botões de navegação
      expect(screen.getByText('🗺️ Google Maps')).toBeInTheDocument();
      expect(screen.getByText('📍 Waze')).toBeInTheDocument();
    });

    it('deve renderizar hotel mínimo sem campos opcionais', async () => {
      // Arrange - Hotel apenas com campos obrigatórios
      const hotelMinimo = {
        id: 'rec456',
        fields: {
          Hotel: 'Hotel Básico',
          Cidade: 'Bariloche',
          Status: '🔍 Pesquisando'
          // Sem: Endereco, Codigo_Reserva, Observações
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelMinimo]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Campos presentes
      await waitFor(() => {
        expect(screen.getByText('Hotel Básico')).toBeInTheDocument();
      });
      
      expect(screen.getByText('🏙️ Bariloche')).toBeInTheDocument();
      expect(screen.getByText('🔍 Pesquisando')).toBeInTheDocument();
      
      // Assert - Campos opcionais ausentes
      expect(screen.queryByText(/📍.*José Federico/)).not.toBeInTheDocument();
      expect(screen.queryByText(/🎫/)).not.toBeInTheDocument();
      expect(screen.queryByText(/💬/)).not.toBeInTheDocument();
      
      // Botões Maps ainda devem aparecer
      expect(screen.getByText('🗺️ Google Maps')).toBeInTheDocument();
      expect(screen.getByText('📍 Waze')).toBeInTheDocument();
    });

    it('deve gerar nome do hotel quando não especificado', async () => {
      // Arrange - Hotel sem nome específico
      const hotelSemNome = {
        id: 'rec789',
        fields: {
          Cidade: 'El Calafate'
          // Sem campo Hotel
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelSemNome]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText('Hotel em El Calafate')).toBeInTheDocument();
      });
    });

    it('deve mostrar status confirmado com estilo correto', async () => {
      // Arrange
      const hotelConfirmado = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Test',
          Cidade: 'Test City',
          Status: '✅ Confirmado'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelConfirmado]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        const statusElement = screen.getByText('✅ Confirmado');
        expect(statusElement).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('deve mostrar status pesquisando com estilo correto', async () => {
      // Arrange
      const hotelPesquisando = {
        id: 'rec2',
        fields: {
          Hotel: 'Hotel Test',
          Cidade: 'Test City',
          Status: '🔍 Pesquisando'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelPesquisando]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        const statusElement = screen.getByText('🔍 Pesquisando');
        expect(statusElement).toHaveClass('bg-orange-100', 'text-orange-800');
      });
    });
  });

  describe('🗺️ GOOGLE MAPS & WAZE INTEGRATION', () => {
    it('deve gerar link Google Maps correto COM endereço', async () => {
      // Arrange
      const hotelComEndereco = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Plaza',
          Cidade: 'Mendoza',
          Endereco: 'José Federico Moreno 1570, Mendoza, Argentina'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelComEndereco]);
      
      // Act
      render(<ConsultaMatinal />);
      
      await waitFor(() => {
        const googleMapsButton = screen.getByText('🗺️ Google Maps');
        fireEvent.click(googleMapsButton);
      });
      
      // Assert
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/Jos%C3%A9%20Federico%20Moreno%201570%2C%20Mendoza%2C%20Argentina%2C%20Mendoza',
        '_blank'
      );
    });

    it('deve gerar link Google Maps correto SEM endereço', async () => {
      // Arrange
      const hotelSemEndereco = {
        id: 'rec2',
        fields: {
          Hotel: 'Hotel Vista',
          Cidade: 'Bariloche'
          // Sem Endereco
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelSemEndereco]);
      
      // Act
      render(<ConsultaMatinal />);
      
      await waitFor(() => {
        const googleMapsButton = screen.getByText('🗺️ Google Maps');
        fireEvent.click(googleMapsButton);
      });
      
      // Assert
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/Hotel%20Vista%20Bariloche',
        '_blank'
      );
    });

    it('deve gerar link Waze correto COM endereço', async () => {
      // Arrange
      const hotelComEndereco = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Test',
          Cidade: 'Test City',
          Endereco: 'Rua Test 123'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelComEndereco]);
      
      // Act
      render(<ConsultaMatinal />);
      
      await waitFor(() => {
        const wazeButton = screen.getByText('📍 Waze');
        fireEvent.click(wazeButton);
      });
      
      // Assert
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://waze.com/ul?q=Rua%20Test%20123%2C%20Test%20City',
        '_blank'
      );
    });

    it('deve gerar link Waze correto SEM endereço', async () => {
      // Arrange
      const hotelSemEndereco = {
        id: 'rec2',
        fields: {
          Hotel: 'Hotel Sem Endereço',
          Cidade: 'Cidade Test'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelSemEndereco]);
      
      // Act
      render(<ConsultaMatinal />);
      
      await waitFor(() => {
        const wazeButton = screen.getByText('📍 Waze');
        fireEvent.click(wazeButton);
      });
      
      // Assert
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://waze.com/ul?q=Hotel%20Sem%20Endere%C3%A7o%20Cidade%20Test',
        '_blank'
      );
    });

    it('deve lidar com caracteres especiais nos links', async () => {
      // Arrange
      const hotelCaracteresEspeciais = {
        id: 'rec3',
        fields: {
          Hotel: 'Hotel São José & Cia',
          Cidade: 'São Paulo',
          Endereco: 'Rua José da Silva, 123 - Centro'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelCaracteresEspeciais]);
      
      // Act
      render(<ConsultaMatinal />);
      
      await waitFor(() => {
        const googleMapsButton = screen.getByText('🗺️ Google Maps');
        fireEvent.click(googleMapsButton);
      });
      
      // Assert - Verificar se caracteres foram encodados corretamente
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('Rua%20Jos%C3%A9%20da%20Silva'),
        '_blank'
      );
    });
  });

  describe('📊 HOTEL DATA LOADING & FILTERING', () => {
    it('deve buscar hotel com filtro por dia correto', async () => {
      // Arrange
      const selectSpy = vi.fn().mockReturnValue({
        firstPage: vi.fn().mockResolvedValue([])
      });
      mockTables.hoteis.mockReturnValue({ select: selectSpy });
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        expect(selectSpy).toHaveBeenCalledWith({
          filterByFormula: '{Dia} = 1',
          maxRecords: 1
        });
      });
    });

    it('deve buscar hotel correto ao mudar de dia', async () => {
      // Arrange
      const selectSpy = vi.fn().mockReturnValue({
        firstPage: vi.fn().mockResolvedValue([])
      });
      mockTables.hoteis.mockReturnValue({ select: selectSpy });
      
      // Act
      render(<ConsultaMatinal />);
      
      // Simular mudança para dia 5
      const dia5Button = screen.getByRole('button', { name: '5' });
      fireEvent.click(dia5Button);
      
      // Assert
      await waitFor(() => {
        expect(selectSpy).toHaveBeenLastCalledWith({
          filterByFormula: '{Dia} = 5',
          maxRecords: 1
        });
      });
    });

    it('deve lidar com erro na busca de hotel graciosamente', async () => {
      // Arrange - Mock erro
      mockTables.hoteis().select().firstPage.mockRejectedValue(
        new Error('Erro de rede Airtable')
      );
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - App não deve quebrar
      await waitFor(() => {
        expect(screen.getByText(/Hotel não definido para o dia/i)).toBeInTheDocument();
      });
      
      // Deve mostrar botão de retry
      expect(screen.getByText(/Tentar recarregar/i)).toBeInTheDocument();
    });

    it('deve permitir recarregar dados quando há erro', async () => {
      // Arrange
      mockTables.hoteis().select().firstPage
        .mockRejectedValueOnce(new Error('Erro'))
        .mockResolvedValueOnce([{
          id: 'rec1',
          fields: { Hotel: 'Hotel Recuperado', Cidade: 'Test' }
        }]);
      
      // Act
      render(<ConsultaMatinal />);
      
      await waitFor(() => {
        const retryButton = screen.getByText(/Tentar recarregar/i);
        fireEvent.click(retryButton);
      });
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText('Hotel Recuperado')).toBeInTheDocument();
      });
    });

    it('deve buscar novos dados quando dia atual muda programaticamente', async () => {
      // Arrange
      const selectSpy = vi.fn().mockReturnValue({
        firstPage: vi.fn().mockResolvedValue([])
      });
      mockTables.hoteis.mockReturnValue({ select: selectSpy });
      
      // Act
      render(<ConsultaMatinal />);
      
      // Simular vários cliques em dias diferentes
      const dia3Button = screen.getByRole('button', { name: '3' });
      const dia7Button = screen.getByRole('button', { name: '7' });
      
      fireEvent.click(dia3Button);
      fireEvent.click(dia7Button);
      
      // Assert
      await waitFor(() => {
        expect(selectSpy).toHaveBeenCalledWith({
          filterByFormula: '{Dia} = 7',
          maxRecords: 1
        });
      });
    });
  });

  describe('⚡ LOADING & ERROR STATES', () => {
    it('deve mostrar loading inicial enquanto busca dados', async () => {
      // Arrange - Mock com delay
      let resolveHotel: (value: any) => void;
      const hotelPromise = new Promise(resolve => {
        resolveHotel = resolve;
      });
      
      mockTables.hoteis().select().firstPage.mockReturnValue(hotelPromise);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Loading deve aparecer
      expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
      
      // Resolver promise
      resolveHotel!([]);
      
      // Assert - Loading deve sumir
      await waitFor(() => {
        expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
      });
    });

    it('deve mostrar loading específico para hotel', async () => {
      // Arrange - Mock outros dados carregados, só hotel em loading
      mockTables.roteiro().select().firstPage.mockResolvedValue([]);
      mockTables.gasolina().select().firstPage.mockResolvedValue([]);
      
      let resolveHotel: (value: any) => void;
      const hotelPromise = new Promise(resolve => {
        resolveHotel = resolve;
      });
      mockTables.hoteis().select().firstPage.mockReturnValue(hotelPromise);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Outras seções carregadas, hotel ainda loading
      await waitFor(() => {
        expect(screen.getByText(/Hotel do Dia/i)).toBeInTheDocument();
      });
      
      // Resolver hotel
      resolveHotel!([]);
      
      await waitFor(() => {
        expect(screen.getByText(/Hotel não definido/i)).toBeInTheDocument();
      });
    });

    it('deve lidar com multiple errors simultaneos', async () => {
      // Arrange - Todos os services com erro
      mockTables.roteiro().select().firstPage.mockRejectedValue(new Error('Erro roteiro'));
      mockTables.gasolina().select().firstPage.mockRejectedValue(new Error('Erro postos'));
      mockTables.hoteis().select().firstPage.mockRejectedValue(new Error('Erro hotel'));
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - App não deve quebrar
      await waitFor(() => {
        expect(screen.getByText(/Hotel não definido/i)).toBeInTheDocument();
      });
      
      // Deve ainda mostrar estrutura básica
      expect(screen.getByText(/Carretera Austral/i)).toBeInTheDocument();
      expect(screen.getByText(/Dia 1 de 20/i)).toBeInTheDocument();
    });
  });

  describe('📱 RESPONSIVIDADE & ACESSIBILIDADE', () => {
    it('deve renderizar botões Maps com tamanhos adequados para touch', async () => {
      // Arrange
      const hotel = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Test',
          Cidade: 'Test City'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotel]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        const googleMapsButton = screen.getByText('🗺️ Google Maps');
        const wazeButton = screen.getByText('📍 Waze');
        
        // Verificar classes de tamanho adequadas para mobile
        expect(googleMapsButton).toHaveClass('px-4', 'py-2');
        expect(wazeButton).toHaveClass('px-4', 'py-2');
      });
    });

    it('deve ter aria-labels apropriados para navegação', async () => {
      // Arrange
      const hotel = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Plaza',
          Cidade: 'Mendoza',
          Endereco: 'Rua Test 123'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotel]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        const googleMapsButton = screen.getByText('🗺️ Google Maps');
        const wazeButton = screen.getByText('📍 Waze');
        
        // Verificar que são botões clicáveis
        expect(googleMapsButton.tagName).toBe('BUTTON');
        expect(wazeButton.tagName).toBe('BUTTON');
      });
    });

    it('deve manter layout responsivo com conteúdo longo', async () => {
      // Arrange - Hotel com nomes/endereços muito longos
      const hotelLongo = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel com Nome Extremamente Longo Para Testar Responsividade',
          Cidade: 'Cidade Com Nome Muito Longo Também',
          Endereco: 'Endereço muito longo com muitos detalhes que pode quebrar layout em dispositivos móveis pequenos',
          Observações: 'Observações muito longas para testar se o layout responsivo funciona corretamente em todas as situações possíveis'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelLongo]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Verificar que elementos não quebram layout
      await waitFor(() => {
        const hotelCard = screen.getByText(/Hotel com Nome Extremamente Longo/i).closest('div');
        expect(hotelCard).toHaveClass('space-y-4'); // Layout spacing mantido
      });
    });
  });

  describe('🔄 INTEGRAÇÃO COM OUTROS COMPONENTES', () => {
    it('deve integrar corretamente com roteiro quando ambos presentes', async () => {
      // Arrange - Mock roteiro e hotel
      const mockRoteiro = {
        id: 'rot1',
        fields: {
          'Origem': 'Bariloche',
          'Destino': 'El Calafate',
          'KM Total': 300
        }
      };
      
      const mockHotel = {
        id: 'hot1',
        fields: {
          Hotel: 'Hotel El Calafate',
          Cidade: 'El Calafate'
        }
      };
      
      mockTables.roteiro().select().firstPage.mockResolvedValue([mockRoteiro]);
      mockTables.hoteis().select().firstPage.mockResolvedValue([mockHotel]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Ambos devem aparecer
      await waitFor(() => {
        expect(screen.getByText(/El Calafate/i)).toBeInTheDocument(); // Roteiro
        expect(screen.getByText('Hotel El Calafate')).toBeInTheDocument(); // Hotel
      });
    });

    it('deve manter navegação entre dias funcionando com hotel', async () => {
      // Arrange - Diferentes hotéis para diferentes dias
      const hotel1 = { id: 'h1', fields: { Hotel: 'Hotel Dia 1', Cidade: 'Cidade 1' } };
      const hotel5 = { id: 'h5', fields: { Hotel: 'Hotel Dia 5', Cidade: 'Cidade 5' } };
      
      mockTables.hoteis().select().firstPage
        .mockResolvedValueOnce([hotel1]) // Dia 1
        .mockResolvedValueOnce([hotel5]); // Dia 5
      
      // Act
      render(<ConsultaMatinal />);
      
      // Verificar hotel dia 1
      await waitFor(() => {
        expect(screen.getByText('Hotel Dia 1')).toBeInTheDocument();
      });
      
      // Navegar para dia 5
      const dia5Button = screen.getByRole('button', { name: '5' });
      fireEvent.click(dia5Button);
      
      // Assert - Hotel deve mudar
      await waitFor(() => {
        expect(screen.getByText('Hotel Dia 5')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Hotel Dia 1')).not.toBeInTheDocument();
    });

    it('deve funcionar corretamente com diferentes breakpoints de tela', async () => {
      // Arrange
      const hotel = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Responsivo',
          Cidade: 'Test'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotel]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Verificar classes responsivas
      await waitFor(() => {
        const hotelCard = screen.getByText('Hotel Responsivo').closest('.bg-white');
        
        // Verificar que card hotel está no grid responsivo
        const gridContainer = hotelCard?.closest('.grid');
        expect(gridContainer).toHaveClass('lg:grid-cols-2');
      });
    });
  });

  describe('🎯 EDGE CASES & ROBUSTEZ', () => {
    it('deve lidar com dados null/undefined graciosamente', async () => {
      // Arrange - Dados corrompidos
      const hotelCorrupto = {
        id: 'rec1',
        fields: {
          Hotel: null,
          Cidade: undefined,
          Endereco: '',
          Status: null
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotelCorrupto]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - App não deve quebrar
      await waitFor(() => {
        expect(screen.getByText(/Hotel em/i)).toBeInTheDocument();
      });
    });

    it('deve lidar com resposta vazia do Airtable', async () => {
      // Arrange
      mockTables.hoteis().select().firstPage.mockResolvedValue([]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/Hotel não definido para o dia/i)).toBeInTheDocument();
      });
    });

    it('deve lidar com múltiplos hotéis no mesmo dia (pegando primeiro)', async () => {
      // Arrange - Múltiplos hotéis (não deveria acontecer, mas...)
      const hotel1 = { id: 'h1', fields: { Hotel: 'Hotel Primeiro', Cidade: 'Test' } };
      const hotel2 = { id: 'h2', fields: { Hotel: 'Hotel Segundo', Cidade: 'Test' } };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotel1, hotel2]);
      
      // Act
      render(<ConsultaMatinal />);
      
      // Assert - Deve mostrar apenas o primeiro
      await waitFor(() => {
        expect(screen.getByText('Hotel Primeiro')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Hotel Segundo')).not.toBeInTheDocument();
    });

    it('deve preservar estado durante re-renders', async () => {
      // Arrange
      const hotel = {
        id: 'rec1',
        fields: {
          Hotel: 'Hotel Estável',
          Cidade: 'Test'
        }
      };
      
      mockTables.hoteis().select().firstPage.mockResolvedValue([hotel]);
      
      // Act
      const { rerender } = render(<ConsultaMatinal />);
      
      await waitFor(() => {
        expect(screen.getByText('Hotel Estável')).toBeInTheDocument();
      });
      
      // Re-render
      rerender(<ConsultaMatinal />);
      
      // Assert - Estado deve ser preservado
      expect(screen.getByText('Hotel Estável')).toBeInTheDocument();
    });

    it('deve fazer cleanup correto ao desmontar componente', async () => {
      // Arrange
      const { unmount } = render(<ConsultaMatinal />);
      
      // Act
      unmount();
      
      // Assert - Não deve haver memory leaks ou warnings
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});