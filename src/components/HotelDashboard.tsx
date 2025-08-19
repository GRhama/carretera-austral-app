import React, { useState } from 'react';
import { Hotel, Calendar, DollarSign, ExternalLink, RefreshCw, Plus, MapPin } from 'lucide-react';
import { useHoteis } from '../hooks/useHoteis';

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
          <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para adicionar hotel - CAMPOS CORRIGIDOS
interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hotel: any) => Promise<boolean>;
}

const AddHotelModal: React.FC<AddHotelModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [hotelData, setHotelData] = useState({
    Dia: 1,                    // ✅ CAMPO CORRETO
    Hotel: '',                 // ✅ CAMPO CORRETO
    Cidade: '',                // ✅ CAMPO CORRETO
    Endereco: '',              // ✅ CAMPO CORRETO  
    'Check-in': '',            // ✅ CAMPO CORRETO (maiúsculo + hífen)
    'Check-out': '',           // ✅ CAMPO CORRETO (maiúsculo + hífen)
    Preço: 0,                  // ✅ CAMPO CORRETO (maiúsculo + acento)
    Observações: '',           // ✅ CAMPO CORRETO (plural)
    Codigo_Reserva: ''         // ✅ CAMPO CORRETO (underscore)
    // ❌ REMOVIDO: Link (causava erro no Airtable)
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onSubmit(hotelData);
    
    if (success) {
      // Reset form
      setHotelData({
        Dia: 1,
        Hotel: '',
        Cidade: '',
        Endereco: '',
        'Check-in': '',
        'Check-out': '',
        Preço: 0,
        Observações: '',
        Codigo_Reserva: ''
      });
      onClose();
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">✅ Registrar Reserva de Hotel</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dia da Viagem *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={hotelData.Dia}
                onChange={(e) => setHotelData(prev => ({ ...prev, Dia: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={hotelData.Cidade}
                onChange={(e) => setHotelData(prev => ({ ...prev, Cidade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Mendoza"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Hotel
            </label>
            <input
              type="text"
              value={hotelData.Hotel}
              onChange={(e) => setHotelData(prev => ({ ...prev, Hotel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Hotel Continental"
            />
          </div>
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Endereco Completo *
  </label>
  <input
    type="text"
    required
    value={hotelData.Endereco}
    onChange={(e) => setHotelData(prev => ({ ...prev, Endereco: e.target.value }))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="José Federico Moreno 1570, Mendoza, Argentina"
  />
</div>

<div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereco Completo *
            </label>
            <input
              type="text"
              required
              value={hotelData.Endereco}
              onChange={(e) => setHotelData(prev => ({ ...prev, Endereco: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="José Federico Moreno 1570, Mendoza, Argentina"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in *
              </label>
              <input
                type="date"
                required
                value={hotelData['Check-in']}
                onChange={(e) => setHotelData(prev => ({ ...prev, 'Check-in': e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out *
              </label>
              <input
                type="date"
                required
                value={hotelData['Check-out']}
                onChange={(e) => setHotelData(prev => ({ ...prev, 'Check-out': e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço por noite (R$)
            </label>
            <input
              type="number"
              value={hotelData.Preço}
              onChange={(e) => setHotelData(prev => ({ ...prev, Preço: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="250"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código da Reserva
            </label>
            <input
              type="text"
              value={hotelData.Codigo_Reserva}
              onChange={(e) => setHotelData(prev => ({ ...prev, Codigo_Reserva: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 6767364046"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço Completo *
            </label>
            <input
              type="text"
              required
              value={hotelData.Endereco}
              onChange={(e) => setHotelData(prev => ({ ...prev, Endereco: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="José Federico Moreno 1570, Mendoza, Argentina"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={hotelData.Observações}
              onChange={(e) => setHotelData(prev => ({ ...prev, Observações: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Café da manhã incluso, próximo das cataratas..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Registrar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HotelDashboard: React.FC = () => {
  const { 
    hoteis, 
    loading, 
    error, 
    totalGastoHoteis, 
    hoteisReservados, 
    hoteisPesquisando,
    addHotel,
    refreshHoteis 
  } = useHoteis();

  const [showAddModal, setShowAddModal] = useState(false);

  // Early returns para loading/error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando hotéis da viagem...</p>
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

  // Calcular próximo check-in - CAMPOS CORRIGIDOS
  const hoje = new Date();
  const proximoHotel = hoteisReservados
    .filter(hotel => new Date(hotel.fields['Check-in']) >= hoje)
    .sort((a, b) => new Date(a.fields['Check-in']).getTime() - new Date(b.fields['Check-in']).getTime())[0];

  const diasProximoCheckIn = proximoHotel 
    ? Math.ceil((new Date(proximoHotel.fields['Check-in']).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Gerar links externos para hotéis em pesquisa - USANDO CAMPO CIDADE CORRETO
  const generateBookingLink = (cidade?: string) => {
    const baseUrl = "https://www.booking.com/search.html";
    const params = new URLSearchParams({
      ss: cidade || 'Chile Argentina',
      group_adults: '3',
      no_rooms: '1',
      checkin: '2025-10-17',
      checkout: '2025-10-18'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const generateAirbnbLink = (cidade?: string) => {
    const baseUrl = "https://www.airbnb.com/search";
    const params = new URLSearchParams({
      location: cidade || 'Chile',
      adults: '3',
      checkin: '2025-10-17',
      checkout: '2025-10-18'
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏨 Gestão de Hotéis
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Carretera Austral • 20 dias • 4 motociclistas
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Registrar Reserva
              </button>
              <button
                onClick={refreshHoteis}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Hotéis Confirmados"
            value={hoteisReservados.length}
            subtitle={`de ${hoteis.length} total`}
            icon={<Hotel className="h-5 w-5 text-green-600" />}
            trend={hoteisReservados.length > hoteisPesquisando.length ? 'up' : 'down'}
          />
          
          <StatCard
            title="Hotéis Faltando"
            value={hoteisPesquisando.length}
            subtitle="ainda pesquisando"
            icon={<MapPin className="h-5 w-5 text-orange-600" />}
            trend={hoteisPesquisando.length === 0 ? 'up' : 'down'}
          />
          
          <StatCard
            title="Total Gasto"
            value={`R$ ${totalGastoHoteis.toLocaleString('pt-BR')}`}
            subtitle={`Média R$ ${(totalGastoHoteis / Math.max(hoteisReservados.length, 1)).toLocaleString('pt-BR')}/noite`}
            icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          />
          
          <StatCard
            title="Próximo Check-in"
            value={proximoHotel ? `${diasProximoCheckIn} dias` : 'N/A'}
            subtitle={proximoHotel ? (proximoHotel.fields.Hotel || proximoHotel.fields.Cidade) : 'Nenhum hotel próximo'}
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
          />
        </div>

        {/* ❌ SEÇÃO REMOVIDA: Links Externos Gerais (redundante) */}

        {/* Hotéis Confirmados - CAMPOS CORRIGIDOS */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              ✅ Hotéis Confirmados ({hoteisReservados.length})
            </h3>
          </div>
          <div className="px-6 py-4">
            {hoteisReservados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum hotel confirmado ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {hoteisReservados.map((hotel) => (
                  <div key={hotel.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {hotel.fields.Hotel || `Hotel em ${hotel.fields.Cidade}`}
                        </h4>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          🏙️ {hotel.fields.Cidade} • 📅 {hotel.fields['Check-in']} até {hotel.fields['Check-out']}
                        </p>
                        {hotel.fields.Codigo_Reserva && (
                          <p className="text-sm text-gray-600">
                            🎫 Código: {hotel.fields.Codigo_Reserva}
                          </p>
                        )}
                        {hotel.fields.Endereco && (
                          <p className="text-sm text-gray-600">
                            📍 {hotel.fields.Endereco}
                          </p>
                        )}
                        {hotel.fields.Observações && (
                          <p className="text-sm text-gray-500 mt-2">
                            💬 {hotel.fields.Observações}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {hotel.fields.Preço ? `R$ ${hotel.fields.Preço.toLocaleString('pt-BR')}` : 'Preço não informado'}
                        </p>
                        <p className="text-sm text-gray-500">por noite</p>
                 
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hotéis Pesquisando - CAMPOS CORRIGIDOS */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              🔍 Hotéis em Pesquisa ({hoteisPesquisando.length})
            </h3>
          </div>
          <div className="px-6 py-4">
            {hoteisPesquisando.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Todos os hotéis já foram confirmados! 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {hoteisPesquisando.map((hotel) => (
                  <div key={hotel.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {hotel.fields.Hotel || `Hotel em ${hotel.fields.Cidade}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          🏙️ {hotel.fields.Cidade} • 📅 {hotel.fields['Check-in']}
                        </p>
                      </div>
                      {/* ✅ LINKS INDIVIDUAIS MANTIDOS (úteis!) */}
                      <div className="flex space-x-2">
                        <a
                          href={generateBookingLink(hotel.fields.Cidade)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Booking
                        </a>
                        <a
                          href={generateAirbnbLink(hotel.fields.Cidade)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Airbnb
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para adicionar hotel */}
      <AddHotelModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addHotel}
      />
    </div>
  );
};



export default HotelDashboard;