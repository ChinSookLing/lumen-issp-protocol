/**
 * L3 Momentum Engine - Gamma Calibration Scan
 * Author: Node-04 (AI Council)
 * 
 * 目標：使用 8 組 Grooming Fixtures，尋找讓 ACRI 最接近預期行為的衰減係數 (γ)
 * 
 * 執行方式：node scripts/calibrate-gamma.js
 */

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────
const GAMMA_MIN = 0.70;
const GAMMA_MAX = 0.99;
const STEP = 0.01;
const WINDOW_SIZE = 5;
const MSE_THRESHOLD = 0.05;

// ─── Load Fixtures ───────────────────────────────────────────────────
const FIXTURES_DIR = path.join(__dirname, '../test/fixtures/multi-turn');

function loadFixtures() {
  const files = [
    'GC-GROOM-01.json', 'GC-GROOM-02.json', 'GC-GROOM-03.json', 'GC-GROOM-04.json',
    'GC-GROOM-05.json', 'GC-GROOM-06.json', 'GC-GROOM-07.json', 'GC-GROOM-08.json'
  ];
  
  const loaded = [];
  for (const file of files) {
    const fullPath = path.join(FIXTURES_DIR, file);
    if (fs.existsSync(fullPath)) {
      loaded.push(JSON.parse(fs.readFileSync(fullPath, 'utf8')));
    } else {
      console.warn(`[WARN] Fixture not found: ${file}`);
    }
  }
  return loaded;
}

// ─── Simplified Momentum Calculation ─────────────────────────────────
// Mirrors momentum-engine.js decay logic for calibration purposes
function simulateMomentum(turns, gamma, windowSize) {
  let momentum = 0;
  const history = [];
  
  for (const turn of turns) {
    const baseAcri = turn.mock_l2_base_acri || turn.acri_base || 0;
    const structureHit = turn.structure_hit ? 1 : 0;
    
    history.push(baseAcri + structureHit * 0.1);
    
    // Apply decay over window
    const windowTurns = history.slice(-windowSize);
    momentum = 0;
    for (let i = 0; i < windowTurns.length; i++) {
      const age = windowTurns.length - 1 - i;
      momentum += windowTurns[i] * Math.pow(gamma, age);
    }
    momentum /= windowTurns.length;
  }
  
  return momentum;
}

// ─── Main Scan ───────────────────────────────────────────────────────
function runCalibration() {
  const fixtures = loadFixtures();
  
  if (fixtures.length === 0) {
    console.error('[ERROR] No fixtures loaded. Ensure grooming samples are in test/fixtures/multi-turn/');
    process.exit(1);
  }
  
  console.log(`[L3 Calibration] 啟動 γ 係數掃描，範圍: ${GAMMA_MIN} - ${GAMMA_MAX}`);
  console.log(`[L3 Calibration] 載入 ${fixtures.length} 組 fixtures\n`);
  
  let bestGamma = null;
  let lowestMSE = Infinity;
  let bestReport = [];
  
  for (let gamma = GAMMA_MIN; gamma <= GAMMA_MAX; gamma += STEP) {
    const currentGamma = parseFloat(gamma.toFixed(2));
    let totalSquaredError = 0;
    const currentReport = [];
    
    for (const fixture of fixtures) {
      const turns = fixture.turns || [];
      const targetAcri = fixture.expected?.acri_target_float || fixture.expected_acri || 0;
      
      const finalAcri = simulateMomentum(turns, currentGamma, WINDOW_SIZE);
      const error = finalAcri - targetAcri;
      totalSquaredError += (error * error);
      
      currentReport.push({
        id: fixture.id || fixture.fixture_id || 'unknown',
        target: targetAcri,
        actual: parseFloat(finalAcri.toFixed(3)),
        delta: parseFloat(error.toFixed(3))
      });
    }
    
    const mse = totalSquaredError / fixtures.length;
    
    if (mse < lowestMSE) {
      lowestMSE = mse;
      bestGamma = currentGamma;
      bestReport = currentReport;
    }
  }
  
  // ─── Output Report ─────────────────────────────────────────────────
  console.log(`✅ 校準完成！`);
  console.log(`🎯 最佳衰減係數 (Optimal γ): ${bestGamma}`);
  console.log(`📉 最小均方誤差 (Lowest MSE): ${lowestMSE.toFixed(5)}\n`);
  
  console.log(`[各樣本命中報告 - γ=${bestGamma}]`);
  console.table(bestReport);
  
  if (lowestMSE < MSE_THRESHOLD) {
    console.log(`\n💡 建議行動: 將 config/engines/momentum.json 中的 decayFactor 更新為 ${bestGamma}`);
  } else {
    console.warn(`\n⚠️ 警告: 最佳 MSE (${lowestMSE.toFixed(5)}) 仍大於 ${MSE_THRESHOLD}。`);
    console.warn(`   建議引入時間加權 (Time-weighted decay): e^(-λΔt) 取代 γ^(n-i)`);
  }
  
  return { bestGamma, lowestMSE, report: bestReport };
}

// ─── Execute ─────────────────────────────────────────────────────────
if (require.main === module) {
  runCalibration();
}

module.exports = { runCalibration, simulateMomentum };
