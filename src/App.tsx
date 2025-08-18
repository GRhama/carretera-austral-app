// src/App.tsx - ADICIONADA ABA GESTÃO DE HOTÉIS
import React, { useState } from 'react';
import { Plus, Calendar, DollarSign, Hotel, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import HotelDashboard from './components/HotelDashboard'; // ← NOVO IMPORT
import AddGastoForm from './components/AddGastoForm';
import ConsultaMatinal from './components/ConsultaMatinal';
import DebugHotelFields from './components/DebugHotelFields'; 
import './App.css';

type View = 'consulta' | 'gastos' | 'hoteis'; // ← EXPANDIDO COM HOTÉIS

function App() {
  const [currentView, setCurrentView] = useState<View>('consulta');
  const [showAddGasto, setShowAddGasto] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'consulta':
        return <ConsultaMatinal />;
      case 'gastos':
        return <Dashboard />;
      case 'hoteis': // ← FALTAVA O CASE!
        return <HotelDashboard />; // ← SEM DEBUG
      default:
        return <ConsultaMatinal />;
    }
  };

  return (
    <div className="App relative">
      
      {/* Navigation Header - Mobile First */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🏍️ Carretera Austral
              </h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                MVP
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setCurrentView('consulta')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'consulta'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Plano de Viagem
              </button>
              
              <button
                onClick={() => setCurrentView('gastos')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'gastos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Gestão Gastos
              </button>

              {/* ← NOVA ABA HOTÉIS */}
              <button
                onClick={() => setCurrentView('hoteis')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'hoteis'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Hotel className="h-4 w-4 mr-2" />
                Gestão de Hotéis
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => {
                  setCurrentView('consulta');
                  setShowMenu(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'consulta'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4 mr-3" />
                Plano de Viagem
              </button>
              
              <button
                onClick={() => {
                  setCurrentView('gastos');
                  setShowMenu(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'gastos'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="h-4 w-4 mr-3" />
                Gestão Gastos
              </button>

              {/* ← NOVA ABA HOTÉIS MOBILE */}
              <button
                onClick={() => {
                  setCurrentView('hoteis');
                  setShowMenu(false);
                }}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'hoteis'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Hotel className="h-4 w-4 mr-3" />
                Gestão de Hotéis
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="relative">
        {renderView()}
      </main>

      {/* Floating Action Button - Só aparece na view de gastos */}
      {currentView === 'gastos' && (
        <button
          onClick={() => setShowAddGasto(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50"
          aria-label="Adicionar gasto"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Quick Add Button - Aparece em todas as views EXCETO hotéis (que tem seu próprio botão) */}
      {currentView !== 'hoteis' && (
        <button
          onClick={() => setShowAddGasto(true)}
          className="fixed bottom-6 left-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 z-50"
          aria-label="Adicionar gasto rápido"
          title="Adicionar Gasto"
        >
          <DollarSign className="h-5 w-5" />
        </button>
      )}

      {/* Add Gasto Form Modal */}
      <AddGastoForm 
        isOpen={showAddGasto}
        onClose={() => setShowAddGasto(false)}
      />

      {/* Version Info - Development Only */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs opacity-70">
          MVP v1.2 • {new Date().toLocaleDateString('pt-BR')} • Hotéis ✅
        </div>
      </div>
    </div>
  );
}

export default App;