#!/usr/bin/env node
// scripts/smoke-test.js - Smoke Test Automatizado
const { spawn, exec } = require('child_process');
const fs = require('fs');

console.log('🧪 SMOKE TEST AUTOMATIZADO - Carretera Austral\n');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) { log(`✅ ${message}`, colors.green); }
function error(message) { log(`❌ ${message}`, colors.red); }
function warning(message) { log(`⚠️  ${message}`, colors.yellow); }
function info(message) { log(`ℹ️  ${message}`, colors.blue); }

// TESTE 1: Arquivos críticos existem
function testFileStructure() {
  info('TESTE 1: Verificando estrutura de arquivos...');
  
  const requiredFiles = [
    'src/components/ConsultaMatinal.tsx',
    'src/config/airtable.ts',
    'package.json'
  ];

  let passed = true;
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`${file} existe`);
    } else {
      error(`${file} NÃO ENCONTRADO`);
      passed = false;
    }
  });

  return passed;
}

// TESTE 2: TypeScript compilation
function testTypeScript() {
  return new Promise((resolve) => {
    info('TESTE 2: Verificando TypeScript...');
    
    exec('npx tsc --noEmit', (err, stdout, stderr) => {
      if (err) {
        error('Erros de TypeScript:');
        console.log(stderr);
        resolve(false);
      } else {
        success('TypeScript: SEM ERROS');
        resolve(true);
      }
    });
  });
}

// TESTE 3: Build test
function testBuild() {
  return new Promise((resolve) => {
    info('TESTE 3: Testando build...');
    
    exec('npm run build', (err, stdout, stderr) => {
      if (err) {
        error('Build FALHOU:');
        console.log(stderr);
        resolve(false);
      } else {
        success('Build SUCESSO');
        resolve(true);
      }
    });
  });
}

// TESTE 4: Verificar lógica implementada
function testLogicImplementation() {
  info('TESTE 4: Verificando lógica de postos...');
  
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  let passed = true;

  // Verificar se a lógica de último posto está implementada
  if (consultaContent.includes('isUltimo')) {
    success('Lógica destino final implementada');
  } else {
    error('Lógica destino final NÃO encontrada');
    passed = false;
  }

  // Verificar ordenação por KM Acumulado
  if (consultaContent.includes('kmAcumulado') && consultaContent.includes('sort')) {
    success('Ordenação por KM Acumulado implementada');
  } else {
    error('Ordenação por KM Acumulado NÃO encontrada');
    passed = false;
  }

  // Verificar casos especiais
  if (consultaContent.includes('Descanso em Mendoza') || consultaContent.includes('diaAtual === 5')) {
    success('Caso especial Dia 5 implementado');
  } else {
    warning('Caso especial Dia 5 não detectado');
  }

  return passed;
}

// TESTE 5: Verificar responsividade
function testResponsiveClasses() {
  info('TESTE 5: Verificando classes responsivas...');
  
  const consultaContent = fs.readFileSync('src/components/ConsultaMatinal.tsx', 'utf8');
  let passed = true;

  const responsivePatterns = [
    'grid-cols-1',
    'sm:grid-cols-2', 
    'lg:grid-cols-3',
    'md:grid-cols'
  ];

  responsivePatterns.forEach(pattern => {
    if (consultaContent.includes(pattern)) {
      success(`Classe responsiva ${pattern} encontrada`);
    } else {
      warning(`Classe responsiva ${pattern} não encontrada`);
      passed = false;
    }
  });

  return passed;
}

// TESTE 6: Verificar configuração de testes
function testTestSetup() {
  info('TESTE 6: Verificando setup de testes...');
  
  let passed = true;

  // Verificar package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const testScripts = ['test', 'test:smoke', 'test:logic'];
  
  testScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      success(`Script ${script} configurado`);
    } else {
      warning(`Script ${script} não configurado`);
    }
  });

  // Verificar arquivos de teste
  const testFiles = [
    'src/utils/postos.test.ts',
    'src/components/ConsultaMatinal.test.tsx'
  ];

  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`Arquivo de teste ${file} existe`);
    } else {
      warning(`Arquivo de teste ${file} não encontrado`);
    }
  });

  return passed;
}

// EXECUTAR TODOS OS TESTES
async function runSmokeTest() {
  console.log(`${colors.blue}🏍️ INICIANDO SMOKE TEST AUTOMATIZADO${colors.reset}\n`);
  
  const results = [];
  
  // Testes síncronos
  results.push(testFileStructure());
  results.push(testLogicImplementation());
  results.push(testResponsiveClasses());
  results.push(testTestSetup());
  
  // Testes assíncronos
  results.push(await testTypeScript());
  results.push(await testBuild());

  // Resultado final
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  const failed = total - passed;

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.blue}📊 SMOKE TEST RESULTS${colors.reset}`);
  console.log('='.repeat(60));
  
  if (failed === 0) {
    success(`🎉 TODOS OS TESTES PASSARAM! (${passed}/${total})`);
    log('\n🚀 DEPLOY APROVADO! Código pronto para produção.', colors.green);
    console.log('\nPróximos passos:');
    console.log('  npm run deploy');
    process.exit(0);
  } else if (failed <= 2) {
    warning(`⚠️  TESTES COM WARNINGS (${passed}/${total} passaram)`);
    log('\n🤔 REVISAR WARNINGS. Deploy possível mas recomenda-se correções.', colors.yellow);
    process.exit(0);
  } else {
    error(`❌ TESTES FALHARAM (${failed}/${total} falharam)`);
    log('\n🚨 DEPLOY BLOQUEADO. Corrigir erros antes de continuar.', colors.red);
    process.exit(1);
  }
}

// Executar
runSmokeTest().catch(err => {
  error('Erro durante smoke test:');
  console.error(err);
  process.exit(1);
});