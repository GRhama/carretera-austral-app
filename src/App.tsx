import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddGastoForm from './components/AddGastoForm';
import './App.css';

function App() {
  const [showAddGasto, setShowAddGasto] = useState(false);

  return (
    <div className="App">
      <Dashboard />
      <button
        onClick={() => setShowAddGasto(true)}
        className="fixed bottom-6 right-6 bg-carretera-600 hover:bg-carretera-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-carretera-300"
        aria-label="Adicionar gasto"
      >
        <Plus className="h-6 w-6" />
      </button>
      <AddGastoForm 
        isOpen={showAddGasto}
        onClose={() => setShowAddGasto(false)}
      />
    </div>
  );
}

export default App;
