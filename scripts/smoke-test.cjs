#!/usr/bin/env node
// scripts/smoke-test.cjs - MÁXIMA COBERTURA DE TESTES
const { spawn, exec } = require('child_process');
const fs = require('fs');

console.log('🧪 SMOKE TEST AUTOMATIZADO - MÁXIMA COBERTURA\n');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) { log(`✅ ${message}`, colors.green); }
function error(message) { log(`❌ ${message}`, colors.red); }
function warning(message) { log(`⚠️  ${message}`, colors.yellow); }
function info(message) { log(`ℹ️  ${message}`, colors.blue); }
function highlight(message) { log(`🔍 ${message}`, colors.cyan); }

// TESTE 1: Estrutura de arquivos críticos
function testFileStructure() {
  info('TESTE 1: Verificando estrutura de arquivos críticos...');
  
  const requiredFiles = [
    'src/components/ConsultaMatinal.tsx',
    'src/components/HotelDashboard.tsx',
    'src/hooks/useHoteis.ts',
    'src/hooks/useGastos.ts',
    'src/types/airtable.ts',
    'src/config/airtable.ts',
    'src/utils/postos.test.ts',
    'package.json',
    'vite.config.ts',
    'tailwind.config.js'
  ];

  let passed = true;
  let critical = 0;
  let optional = 0;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`${file} existe`);
      if (file.includes('ConsultaMatinal') || file.includes('HotelDashboard') || file.includes('useHoteis')) {
        critical++;
      }
    } else {
      if (file.includes('test') || file.includes('config')) {
        warning(`${file} não encontrado (opcional)`);
        optional++;
      } else {
        error(`${file} CRÍTICO não encontrado`);
        passed = false;
      }
    }
  });

  highlight(`Arquivos críticos: ${critical}/3 | Opcionais: ${optional}`);
  return passed;
}

// TESTE 2: TypeScript compilation detalhada
function testTypeScript() {
  return new Promise((resolve) => {
    info('TESTE 2: Verificação TypeScript detalhada...');
    
    exec('npx tsc --noEmit --listFiles', (err, stdout, stderr) => {
      if (err) {
        error('Erros de TypeScript detectados:');
        console.log(stderr);
        
        // Análise específica de erros hotel
        if (stderr.includes('HotelData') || stderr.includes('useHoteis')) {
          error('❌ ERRO CRÍTICO: Problemas na integração Hotel');
        }
        if (stderr.includes('ConsultaMatinal')) {
          error('❌ ERRO CRÍTICO: Problemas no componente principal');
        }
        
        resolve(false);
      } else {
        success('TypeScript: Compilação limpa');
        
        // Contar arquivos processados
        const files = stdout.split('\n').filter(line => line.includes('.tsx') || line.includes('.ts')).length;
        highlight(`Arquivos TypeScript processados: ${files}`);
        
        resolve(true);
      }
    });
  });
}

// TESTE 3: Build detalhado com métricas
function testBuild() {
  return new Promise((resolve) => {
    info('TESTE 3: Build de produção com métricas...');
    
    const startTime = Date.now();
    
    exec('npm run build', (err, stdout, stderr) => {
      const buildTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (err) {
        error(`Build FALHOU em ${buildTime}s:`);
        console.log(stderr);
        resolve(false);
      } else {
        success(`Build SUCESSO em ${buildTime}s`);
        
        // Análise do bundle
        try {
          const distPath = 'dist';
          if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath, { recursive: true });
            const jsFiles = files.filter(f => f.includes('.js'));
            const cssFiles = files.filter(f => f.includes('.css'));
            
            highlight(`Bundle: ${jsFiles.length} JS, ${cssFiles.length} CSS files`);
            
            // Verificar tamanho aproximado
            let totalSize = 0;
            files.forEach(file => {
              try {
                const stats = fs.statSync(`${distPath}/${file}`);
                totalSize += stats.size;
              } catch (e) {}
            });
            
            const sizeKB = (totalSize / 1024).toFixed(0);
            if (totalSize > 2 * 1024 * 1024) { // > 2MB
              warning(`Bundle size: ${sizeKB}KB (grande)`);
            } else {
              success(`Bundle size: ${sizeKB}KB`);
            }
          }
        } catch (e) {
          warning('Não foi possível analisar bundle size');
        }
        
        resolve(true);
      }
    });
  });
}

// TESTE 4: Lógica de postos estratégicos (REGRESSION)
function testPostosLogic() {
  info('TESTE 4: Verificando lógica de postos (REGRESSION)...');
  
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  let passed = true;
  let features = 0;

  // Verificações críticas postos
  const postoChecks = [
    { pattern: 'isUltimo', name: 'Lógica destino final' },
    { pattern: 'kmAcumulado.*sort', name: 'Ordenação por KM Acumulado' },
    { pattern: 'Descanso em Mendoza|diaAtual === 5', name: 'Caso especial Dia 5' },
    { pattern: 'filterByFormula.*Dia.*=', name: 'Filtro dinâmico por dia' },
    { pattern: 'postosOrdenados.*map', name: 'Processamento de postos' }
  ];

  postoChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(consultaContent)) {
      success(check.name);
      features++;
    } else {
      error(`${check.name} NÃO encontrada`);
      passed = false;
    }
  });

  highlight(`Features de postos: ${features}/${postoChecks.length}`);
  return passed;
}

// TESTE 5: Hotel Integration COMPLETA
function testHotelIntegration() {
  info('TESTE 5: Verificando integração Hotel COMPLETA...');
  
  let passed = true;
  let hotelFeatures = 0;

  // 1. Interface/Tipos
  const typesContent = fs.readFileSync('src/types/airtable.ts', 'utf8');
  const hotelTypeChecks = [
    { pattern: 'interface.*Hotel', name: 'Interface Hotel definida' },
    { pattern: 'Endereco.*string', name: 'Campo Endereço tipado' },
    { pattern: 'Check-in.*string', name: 'Campos de data tipados' }
  ];

  hotelTypeChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(typesContent)) {
      success(check.name);
      hotelFeatures++;
    } else {
      warning(`${check.name} não detectada`);
    }
  });

  // 2. Hook useHoteis
  if (fs.existsSync('src/hooks/useHoteis.ts')) {
    const hookContent = fs.readFileSync('src/hooks/useHoteis.ts', 'utf8');
    const hookChecks = [
      { pattern: 'export.*useHoteis', name: 'Hook useHoteis exportado' },
      { pattern: 'useState.*hotel', name: 'Estado hotel gerenciado' },
      { pattern: 'tables\\.hoteis', name: 'Integração Airtable hotéis' }
    ];

    hookChecks.forEach(check => {
      const regex = new RegExp(check.pattern, 'i');
      if (regex.test(hookContent)) {
        success(check.name);
        hotelFeatures++;
      } else {
        warning(`${check.name} não detectada`);
      }
    });
  } else {
    error('Hook useHoteis NÃO encontrado');
    passed = false;
  }

  // 3. ConsultaMatinal Integration
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  const consultaChecks = [
    { pattern: 'useState.*hotel', name: 'Estado hotel na ConsultaMatinal' },
    { pattern: 'HotelData', name: 'Interface HotelData usada' },
    { pattern: 'tables\\.hoteis.*select', name: 'Busca hotel por dia' },
    { pattern: 'hotel\\?', name: 'Renderização condicional hotel' }
  ];

  consultaChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(consultaContent)) {
      success(check.name);
      hotelFeatures++;
    } else {
      error(`${check.name} NÃO encontrada`);
      passed = false;
    }
  });

  highlight(`Features Hotel: ${hotelFeatures}/9`);
  return passed;
}

// TESTE 6: Google Maps & Waze Integration
function testMapsIntegration() {
  info('TESTE 6: Verificando integração Maps & Waze...');
  
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  let passed = true;
  let mapsFeatures = 0;

  const mapsChecks = [
    { 
      pattern: 'generateGoogleMapsLink', 
      name: 'Função Google Maps',
      critical: true
    },
    { 
      pattern: 'generateWazeLink', 
      name: 'Função Waze',
      critical: true
    },
    { 
      pattern: 'google\\.com/maps/search', 
      name: 'URL Google Maps correta',
      critical: true
    },
    { 
      pattern: 'waze\\.com/ul\\?q=', 
      name: 'URL Waze correta',
      critical: true
    },
    { 
      pattern: 'encodeURIComponent', 
      name: 'Encoding de URLs',
      critical: false
    },
    { 
      pattern: 'window\\.open.*_blank', 
      name: 'Abertura em nova aba',
      critical: false
    }
  ];

  mapsChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(consultaContent)) {
      success(check.name);
      mapsFeatures++;
    } else {
      if (check.critical) {
        error(`${check.name} NÃO encontrada`);
        passed = false;
      } else {
        warning(`${check.name} não detectada`);
      }
    }
  });

  highlight(`Features Maps: ${mapsFeatures}/${mapsChecks.length}`);
  return passed;
}

// TESTE 7: HotelDashboard específico
function testHotelDashboard() {
  info('TESTE 7: Verificando HotelDashboard...');
  
  let passed = true;
  let dashboardFeatures = 0;

  if (fs.existsSync('src/components/HotelDashboard.tsx')) {
    const hotelContent = fs.readFileSync('src/components/HotelDashboard.tsx', 'utf8');
    
    const dashboardChecks = [
      { pattern: 'AddHotelModal|Modal', name: 'Modal de adicionar hotel' },
      { pattern: 'Endereco|endereco', name: 'Campo endereço no modal' },
      { pattern: 'useHoteis', name: 'Hook useHoteis integrado' },
      { pattern: 'hotel\\.fields\\.Endereco', name: 'Display endereço na lista' },
      { pattern: 'onClick.*Maps|Maps.*onClick', name: 'Botões navegação' },
      { pattern: 'hotel.*map', name: 'Lista de hotéis renderizada' }
    ];

    dashboardChecks.forEach(check => {
      const regex = new RegExp(check.pattern, 'i');
      if (regex.test(hotelContent)) {
        success(check.name);
        dashboardFeatures++;
      } else {
        warning(`${check.name} não detectada`);
      }
    });
  } else {
    error('HotelDashboard.tsx NÃO encontrado');
    passed = false;
  }

  highlight(`Features Dashboard: ${dashboardFeatures}/6`);
  return passed;
}

// TESTE 8: Responsividade mobile
function testResponsiveDesign() {
  info('TESTE 8: Verificando design responsivo...');
  
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  let responsiveFeatures = 0;

  const responsivePatterns = [
    { pattern: 'grid.*lg:grid-cols', name: 'Grid responsivo' },
    { pattern: 'sm:|md:|lg:|xl:', name: 'Breakpoints Tailwind' },
    { pattern: 'max-w.*mx-auto', name: 'Container responsivo' },
    { pattern: 'px-4.*sm:px', name: 'Padding responsivo' },
    { pattern: 'flex.*space-x|gap', name: 'Layout flexível' }
  ];

  responsivePatterns.forEach(pattern => {
    const regex = new RegExp(pattern.pattern, 'i');
    if (regex.test(consultaContent)) {
      success(pattern.name);
      responsiveFeatures++;
    } else {
      warning(`${pattern.name} não encontrado`);
    }
  });

  highlight(`Features Responsivas: ${responsiveFeatures}/${responsivePatterns.length}`);
  return responsiveFeatures >= 3; // Mínimo 3/5 para passar
}

// TESTE 9: Performance e otimizações
function testPerformance() {
  info('TESTE 9: Verificando otimizações de performance...');
  
  let perfFeatures = 0;
  
  // Verificar lazy loading, memoization, etc.
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  
  const perfChecks = [
    { pattern: 'useCallback|useMemo', name: 'Hooks de otimização' },
    { pattern: 'useState.*loading', name: 'Estados de loading' },
    { pattern: 'catch.*error', name: 'Tratamento de erros' },
    { pattern: 'async.*await', name: 'Operações assíncronas' }
  ];

  perfChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(consultaContent)) {
      success(check.name);
      perfFeatures++;
    } else {
      warning(`${check.name} não detectada`);
    }
  });

  highlight(`Features Performance: ${perfFeatures}/${perfChecks.length}`);
  return true; // Performance checks são informativos
}

// TESTE 10: Setup de testes
function testTestSetup() {
  info('TESTE 10: Verificando configuração de testes...');
  
  let passed = true;
  let testFeatures = 0;

  // Package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['test', 'test:smoke', 'test:logic', 'test:integration'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      success(`Script ${script} configurado`);
      testFeatures++;
    } else {
      warning(`Script ${script} não encontrado`);
    }
  });

  // Dependências de teste
  const testDeps = ['vitest', '@testing-library/react', '@testing-library/jest-dom'];
  testDeps.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      success(`Dependência ${dep} instalada`);
      testFeatures++;
    } else {
      warning(`Dependência ${dep} não encontrada`);
    }
  });

  // Arquivos de teste
  const testFiles = ['src/utils/postos.test.ts'];
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`Arquivo de teste ${file} existe`);
      testFeatures++;
    } else {
      warning(`Arquivo de teste ${file} não encontrado`);
    }
  });

  highlight(`Setup de testes: ${testFeatures}/8`);
  return testFeatures >= 6; // Mínimo 6/8 para passar
}

// TESTE 11: Segurança e configurações
function testSecurity() {
  info('TESTE 11: Verificando segurança e configurações...');
  
  let secFeatures = 0;
  let issues = 0;

  // Verificar se não há secrets expostos
  const configContent = fs.readFileSync('src/config/airtable.ts', 'utf8');
  
  if (configContent.includes('process.env') || configContent.includes('import.meta.env')) {
    success('Variáveis de ambiente usadas corretamente');
    secFeatures++;
  } else {
    error('Possíveis secrets hardcoded detectados');
    issues++;
  }

  // Verificar .gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env') && gitignore.includes('dist')) {
      success('.gitignore configurado corretamente');
      secFeatures++;
    } else {
      warning('.gitignore pode estar incompleto');
    }
  }

  // Verificar se não há console.logs em produção
  const components = ['src/components/ConsultaMatinal.tsx', 'src/components/HotelDashboard.tsx'];
  let consoleLogs = 0;
  components.forEach(comp => {
    if (fs.existsSync(comp)) {
      const content = fs.readFileSync(comp, 'utf8');
      const logs = (content.match(/console\.log/g) || []).length;
      consoleLogs += logs;
    }
  });

  if (consoleLogs === 0) {
    success('Nenhum console.log em produção');
    secFeatures++;
  } else {
    warning(`${consoleLogs} console.log encontrados`);
  }

  highlight(`Verificações de segurança: ${secFeatures}/3, Issues: ${issues}`);
  return issues === 0;
}

// TESTE 12: Integração Airtable
function testAirtableIntegration() {
  info('TESTE 12: Verificando integração Airtable completa...');
  
  let passed = true;
  let airtableFeatures = 0;

  const configContent = fs.readFileSync('src/config/airtable.ts', 'utf8');
  
  const airtableChecks = [
    { pattern: 'roteiro.*base', name: 'Tabela roteiro configurada' },
    { pattern: 'gasolina.*base', name: 'Tabela gasolina configurada' },
    { pattern: 'hoteis.*base', name: 'Tabela hotéis configurada' },
    { pattern: 'export.*tables', name: 'Tables exportadas' }
  ];

  airtableChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(configContent)) {
      success(check.name);
      airtableFeatures++;
    } else {
      error(`${check.name} NÃO encontrada`);
      passed = false;
    }
  });

  // Verificar uso correto em components
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  const usageChecks = [
    { pattern: 'tables\\.roteiro\\(\\)', name: 'Uso correto tables.roteiro()' },
    { pattern: 'tables\\.gasolina\\(\\)', name: 'Uso correto tables.gasolina()' },
    { pattern: 'tables\\.hoteis\\(\\)', name: 'Uso correto tables.hoteis()' },
    { pattern: 'filterByFormula', name: 'Filtros Airtable implementados' }
  ];

  usageChecks.forEach(check => {
    const regex = new RegExp(check.pattern, 'i');
    if (regex.test(consultaContent)) {
      success(check.name);
      airtableFeatures++;
    } else {
      error(`${check.name} NÃO encontrada`);
      passed = false;
    }
  });

  highlight(`Integração Airtable: ${airtableFeatures}/8`);
  return passed;
}

// EXECUTAR TODOS OS TESTES
async function runMaxCoverageTest() {
  console.log(`${colors.blue}🏍️ INICIANDO SMOKE TEST - MÁXIMA COBERTURA${colors.reset}\n`);
  
  const results = [];
  const testNames = [
    'Estrutura de Arquivos',
    'TypeScript Compilation', 
    'Build de Produção',
    'Lógica Postos (Regression)',
    'Hotel Integration',
    'Maps & Waze Integration',
    'Hotel Dashboard',
    'Design Responsivo',
    'Performance',
    'Setup de Testes',
    'Segurança',
    'Integração Airtable'
  ];
  
  // Testes síncronos
  results.push(testFileStructure());
  results.push(testPostosLogic());
  results.push(testHotelIntegration());
  results.push(testMapsIntegration());
  results.push(testHotelDashboard());
  results.push(testResponsiveDesign());
  results.push(testPerformance());
  results.push(testTestSetup());
  results.push(testSecurity());
  results.push(testAirtableIntegration());
  
  // Testes assíncronos
  results.push(await testTypeScript());
  results.push(await testBuild());

  // Análise de resultados
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log(`${colors.blue}📊 SMOKE TEST RESULTS - MÁXIMA COBERTURA${colors.reset}`);
  console.log('='.repeat(70));
  
  // Resultado detalhado por teste
  results.forEach((result, index) => {
    const status = result ? '✅' : '❌';
    const color = result ? colors.green : colors.red;
    log(`${status} ${testNames[index]}`, color);
  });

  console.log('\n' + '-'.repeat(70));
  log(`📈 PASS RATE: ${passRate}% (${passed}/${total})`, colors.cyan);
  
  if (failed === 0) {
    success(`🎉 TODOS OS TESTES PASSARAM! (${passed}/${total})`);
    log('\n🚀 DEPLOY APROVADO! Código com máxima cobertura validada.', colors.green);
    log('\n📋 Próximos passos:', colors.blue);
    console.log('  1. npm run test:scenarios (se arquivo existir)');
    console.log('  2. npm run test:integration');
    console.log('  3. npm run deploy');
    process.exit(0);
  } else if (failed <= 2 && passRate >= 80) {
    warning(`⚠️  TESTES COM WARNINGS (${passRate}% pass rate)`);
    log('\n🤔 REVISAR WARNINGS. Deploy possível mas recomenda-se correções.', colors.yellow);
    log('\n📋 Ações recomendadas:', colors.blue);
    console.log('  1. Revisar testes que falharam');
    console.log('  2. Corrigir se críticos');
    console.log('  3. Deploy com cautela');
    process.exit(0);
  } else {
    error(`❌ MUITOS TESTES FALHARAM (${passRate}% pass rate)`);
    log('\n🚨 DEPLOY BLOQUEADO. Corrigir falhas críticas antes de continuar.', colors.red);
    log('\n📋 Ações obrigatórias:', colors.blue);
    console.log('  1. Corrigir todos os erros críticos');
    console.log('  2. Re-executar smoke test');
    console.log('  3. Deploy apenas após 90%+ pass rate');
    process.exit(1);
  }
}

// Executar
runMaxCoverageTest().catch(err => {
  error('Erro durante smoke test:');
  console.error(err);
  process.exit(1);
});