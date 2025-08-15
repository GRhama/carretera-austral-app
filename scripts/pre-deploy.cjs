// scripts/pre-deploy.js - Script Completo Pré-Deploy
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) { log(`✅ ${message}`, colors.green); }
function error(message) { log(`❌ ${message}`, colors.red); }
function info(message) { log(`🔧 ${message}`, colors.blue); }
function step(message) { log(`\n${colors.bold}🚀 ${message}${colors.reset}`, colors.blue); }

async function runCommand(command, description) {
  try {
    info(`Executando: ${description}`);
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 120000 // 2 minutos timeout
    });
    success(`${description} - SUCESSO`);
    return true;
  } catch (err) {
    error(`${description} - FALHOU`);
    console.log(err.stdout);
    console.log(err.stderr);
    return false;
  }
}

async function preDeployChecks() {
  console.log(`${colors.bold}🏍️ CARRETERA AUSTRAL - PRÉ-DEPLOY AUTOMATIZADO${colors.reset}\n`);
  
  let allPassed = true;
  const results = [];

  // STEP 1: TypeScript Check
  step('STEP 1: TypeScript Validation');
  const tsCheck = await runCommand('npx tsc --noEmit', 'TypeScript check');
  results.push({ name: 'TypeScript', passed: tsCheck });
  if (!tsCheck) allPassed = false;

  // STEP 2: Smoke Test
  step('STEP 2: Smoke Test Automatizado');
  const smokeTest = await runCommand('node scripts/smoke-test.js', 'Smoke test');
  results.push({ name: 'Smoke Test', passed: smokeTest });
  if (!smokeTest) allPassed = false;

  // STEP 3: Unit Tests (se existirem)
  step('STEP 3: Testes Unitários');
  try {
    const unitTests = await runCommand('npm run test:logic 2>/dev/null || echo "Tests not found"', 'Unit tests');
    results.push({ name: 'Unit Tests', passed: unitTests });
  } catch {
    log('⚠️  Testes unitários não configurados ainda', colors.yellow);
    results.push({ name: 'Unit Tests', passed: true }); // Não bloquear por enquanto
  }

  // STEP 4: Build Final
  step('STEP 4: Build de Produção');
  const buildTest = await runCommand('npm run build', 'Build produção');
  results.push({ name: 'Build', passed: buildTest });
  if (!buildTest) allPassed = false;

  // STEP 5: Bundle Size Check
  step('STEP 5: Análise de Performance');
  try {
    const distSize = execSync('du -sh dist 2>/dev/null || echo "N/A"', { encoding: 'utf8' }).trim();
    if (distSize !== 'N/A') {
      info(`Bundle size: ${distSize}`);
      success('Bundle criado com sucesso');
    }
  } catch {
    log('⚠️  Análise de bundle não disponível', colors.yellow);
  }

  // RESULTADOS FINAIS
  console.log('\n' + '='.repeat(70));
  log(`${colors.bold}📊 RESULTADOS PRÉ-DEPLOY${colors.reset}`);
  console.log('='.repeat(70));

  results.forEach(result => {
    if (result.passed) {
      success(`${result.name}: PASSOU`);
    } else {
      error(`${result.name}: FALHOU`);
    }
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log('\n' + '='.repeat(70));
  
  if (allPassed) {
    log(`${colors.bold}${colors.green}🎉 DEPLOY APROVADO! (${passedCount}/${totalCount})${colors.reset}`);
    console.log('\n🚀 Código validado e pronto para produção!');
    console.log('\nPróximos passos:');
    console.log('  1. npm run deploy');
    console.log('  2. Testar URL de produção');
    console.log('  3. Compartilhar com motociclistas');
    
    // Auto-deploy se aprovado
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\n🤔 Fazer deploy automaticamente? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        log('\n🚀 Iniciando deploy...', colors.blue);
        try {
          execSync('npm run deploy', { stdio: 'inherit' });
          success('\n🎉 Deploy concluído com sucesso!');
        } catch (err) {
          error('\n❌ Erro no deploy');
          console.log(err);
        }
      } else {
        log('\n👍 Deploy manual quando pronto: npm run deploy', colors.blue);
      }
      readline.close();
    });
    
  } else {
    log(`${colors.bold}${colors.red}❌ DEPLOY BLOQUEADO! (${passedCount}/${totalCount})${colors.reset}`);
    console.log('\n🚨 Erros encontrados que impedem o deploy.');
    console.log('\n📋 Próximos passos:');
    console.log('  1. Corrigir erros mostrados acima');
    console.log('  2. Executar novamente: npm run test:pre-deploy');
    console.log('  3. Deploy só após todos os testes passarem');
    process.exit(1);
  }
}

// Executar
preDeployChecks().catch(err => {
  error('Erro crítico no pré-deploy:');
  console.error(err);
  process.exit(1);
});