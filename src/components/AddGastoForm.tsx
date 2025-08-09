import React, { useState } from 'react';
import { X, DollarSign, User, Tag, FileText, MapPin } from 'lucide-react';
import { useGastos } from '../hooks/useGastos';
import { GastoFields } from '../types/airtable';

interface AddGastoFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// CATEGORIAS - COM EMOJIS EXATOS DO AIRTABLE
const CATEGORIAS = [
  '⛽ Combustível',
  '🍽️ Alimentação',
  '🏨 Hospedagem', 
  '⭕ Outros'
];

// RESPONSÁVEIS - baseado no que vi na sua tabela
const RESPONSAVEIS = [
  'Aspira',
  'Benites', 
  'Souza',
  'Cartão'  // Vi esse na tabela também
];

const AddGastoForm: React.FC<AddGastoFormProps> = ({ isOpen, onClose }) => {
  const { addGasto } = useGastos();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Categoria: '🍽️ Alimentação', // COM EMOJI EXATO
    Valor: '',
    Responsável: RESPONSAVEIS[0],
    Descrição: '',
    Local: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 INICIANDO SUBMIT...');
    console.log('📝 Form Data:', formData);
    
    if (!formData.Valor || parseFloat(formData.Valor) <= 0) {
      alert('Informe um valor válido');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 ENVIANDO GASTO...');
      
      const success = await addGasto({
        Categoria: formData.Categoria,         // COM EMOJI
        Valor: parseFloat(formData.Valor),
        Responsável: formData.Responsável,     // COM ACENTO
        Descrição: formData.Descrição || undefined,
        Local: formData.Local || undefined
      });

      console.log('✅ RESULTADO:', success);

      if (success) {
        console.log('🎉 SUCESSO! Resetando form...');
        
        // Reset form
        setFormData({
          Categoria: '🍽️ Alimentação', // COM EMOJI EXATO
          Valor: '',
          Responsável: RESPONSAVEIS[0],
          Descrição: '',
          Local: ''
        });
        onClose();
        
        // FORÇAR REFRESH DA PÁGINA PARA GARANTIR SINCRONIZAÇÃO
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
      } else {
        console.log('❌ FALHOU - success = false');
        alert('Erro ao salvar gasto. Tente novamente.');
      }
    } catch (error) {
      console.error('💥 ERRO CATCH:', error);
      alert('Erro ao salvar gasto. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Adicionar Gasto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Categoria (com emojis) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="h-4 w-4 inline mr-1" />
              Categoria
            </label>
            <select
              value={formData.Categoria}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                Categoria: e.target.value // Sem cast de tipo
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-carretera-500 focus:border-transparent"
              required
            >
              {CATEGORIAS.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.Valor}
              onChange={(e) => setFormData(prev => ({ ...prev, Valor: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-carretera-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="h-4 w-4 inline mr-1" />
              Responsável
            </label>
            <select
              value={formData.Responsável}
              onChange={(e) => setFormData(prev => ({ ...prev, Responsável: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-carretera-500 focus:border-transparent"
              required
            >
              {RESPONSAVEIS.map(pessoa => (
                <option key={pessoa} value={pessoa}>
                  {pessoa}
                </option>
              ))}
            </select>
          </div>

          {/* Local */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="h-4 w-4 inline mr-1" />
              Local (opcional)
            </label>
            <input
              type="text"
              value={formData.Local}
              onChange={(e) => setFormData(prev => ({ ...prev, Local: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-carretera-500 focus:border-transparent"
              placeholder="Ex: Bariloche"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="h-4 w-4 inline mr-1" />
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={formData.Descrição}
              onChange={(e) => setFormData(prev => ({ ...prev, Descrição: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-carretera-500 focus:border-transparent"
              placeholder="Ex: Almoço no centro"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-carretera-600 text-white py-2 px-4 rounded-md hover:bg-carretera-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Gasto'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddGastoForm;
