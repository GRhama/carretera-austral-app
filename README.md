# 🏍️ Carretera Austral - Sistema de Gestão de Viagem

Sistema de gestão colaborativa para viagem de moto pela Carretera Austral (Chile/Argentina).
**20 dias • 4 pessoas • 10.385km • Deadline: 17/10/2025**

## 🚀 Quick Start

### 1. **Setup do Projeto**
```bash
npm install
```

### 2. **Configuração do Airtable** ⚠️ **CRÍTICO**

Edite `src/config/airtable.ts` com suas credenciais REAIS:

- Base ID (da URL do Airtable)
- Personal Access Token (novo, seguro)
- Table IDs de cada tabela

### 3. **Executar localmente**
```bash
npm run dev
# Abre em http://localhost:3000
```

### 4. **Deploy GitHub Pages**
```bash
npm run deploy
# Publica em https://[username].github.io/carretera-austral-app
```

## ⚠️ **PARA CONFIGURAR:**

1. **src/config/airtable.ts** → Suas credenciais
2. **src/components/AddGastoForm.tsx** → Nomes reais do grupo (linha 18)

## 🧪 **Teste básico:**
1. npm run dev
2. Adicionar um gasto
3. Verificar se salvou no Airtable
