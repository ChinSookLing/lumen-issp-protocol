/**
 * handoff-template.test.js
 * Layer 4 — Structured Hand-off 模板測試
 * 設計：Node-01（Architect）
 * 日期：2026-02-17
 */

  const { describe, test } = require("node:test");
  const { expect } = require("../helpers/expect-shim");

const {
  generate,
  validateTemplate,
  scoreToIntensity,
  DEFAULT_TEMPLATES,
  PATTERN_DISPLAY_NAMES
} = require('../../src/output/handoff-template');

// ============================================================
// 1. scoreToIntensity
// ============================================================

describe('scoreToIntensity — 分數轉強度標籤', () => {

  test('低分 → low', () => {
    expect(scoreToIntensity(0.1)).toBe('low');
    expect(scoreToIntensity(0.29)).toBe('low');
  });

  test('中分 → medium', () => {
    expect(scoreToIntensity(0.3)).toBe('medium');
    expect(scoreToIntensity(0.5)).toBe('medium');
    expect(scoreToIntensity(0.69)).toBe('medium');
  });

  test('高分 → high', () => {
    expect(scoreToIntensity(0.7)).toBe('high');
    expect(scoreToIntensity(0.84)).toBe('high');
  });

  test('極高分 → critical', () => {
    expect(scoreToIntensity(0.85)).toBe('critical');
    expect(scoreToIntensity(1.0)).toBe('critical');
  });

});

// ============================================================
// 2. generate — 基本功能
// ============================================================

describe('generate — Hand-off 通知生成', () => {

  test('英文模板基本輸出', () => {
    const result = generate({
      pattern: 'MB',
      score: 0.75,
      channel: 'push',
      locale: 'en'
    });

    expect(result.type).toBe('structured_handoff');
    expect(result.pattern).toBe('MB');
    expect(result.score).toBe(0.75);
    expect(result.channel).toBe('push');
    expect(result.locale).toBe('en');
    expect(result.intensity).toBe('high');
    expect(result.desensitized).toBe(true);
    expect(result.content.header).toContain('Lumen');
    expect(result.content.disclaimer).toBeTruthy();
  });

  test('中文繁體模板', () => {
    const result = generate({
      pattern: 'FC',
      score: 0.9,
      channel: 'push',
      locale: 'zh-trad'
    });
    expect(result.content.header).toContain('Lumen 協議通知');
    expect(result.intensity).toBe('critical');
  });

  test('中文簡體模板', () => {
    const result = generate({
      pattern: 'EA',
      score: 0.5,
      channel: 'vacuum',
      locale: 'zh-simp'
    });
    expect(result.content.header).toContain('Lumen 协议通知');
  });

  test('附加資源', () => {
    const resources = [
      { name: 'Helpline', url: 'https://example.com/help' }
    ];
    const result = generate({
      pattern: 'VS',
      score: 0.8,
      channel: 'vacuum',
      locale: 'en',
      resources
    });
    expect(result.content.resources).toEqual(resources);
    expect(result.content.resources_header).toBeTruthy();
  });

  test('body 中 Pattern 名稱已替換', () => {
    const result = generate({
      pattern: 'GC',
      score: 0.75,
      channel: 'push',
      locale: 'en'
    });
    const bodyText = result.content.body.join(' ');
    expect(bodyText).toContain('God Complex');
    expect(bodyText).not.toContain('{pattern_name}');
  });

});

// ============================================================
// 3. generate — 錯誤處理
// ============================================================

describe('generate — Error Handling', () => {

  test('無效 pattern → Error', () => {
    expect(() => generate({ pattern: 'INVALID', score: 0.5, channel: 'push' }))
      .toThrow(/Invalid pattern/);
  });

  test('無效 score → Error', () => {
    expect(() => generate({ pattern: 'MB', score: 1.5, channel: 'push' }))
      .toThrow(/Invalid score/);
  });

  test('無效 channel → Error', () => {
    expect(() => generate({ pattern: 'MB', score: 0.5, channel: 'invalid' }))
      .toThrow(/Invalid channel/);
  });

});

// ============================================================
// 4. validateTemplate — 模板驗證
// ============================================================

describe('validateTemplate — 自訂模板驗證', () => {

  test('合規模板 → valid', () => {
    const result = validateTemplate({
      header: 'Test Header',
      body: ['Pattern: {pattern_name}', 'Level: {intensity_level}'],
      disclaimer: 'Test disclaimer'
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('缺少 header → invalid', () => {
    const result = validateTemplate({
      body: ['{pattern_name} {intensity_level}'],
      disclaimer: 'Test'
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('header'))).toBe(true);
  });

  test('body 缺少佔位符 → invalid', () => {
    const result = validateTemplate({
      header: 'Header',
      body: ['No placeholders here'],
      disclaimer: 'Test'
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('{pattern_name}'))).toBe(true);
  });

  test('null input → invalid', () => {
    const result = validateTemplate(null);
    expect(result.valid).toBe(false);
  });

});

// ============================================================
// 5. 「僅信息、非勸告」合規檢查
// ============================================================

describe('Information-Only Compliance', () => {

  test('所有預設模板都包含 disclaimer', () => {
    Object.entries(DEFAULT_TEMPLATES).forEach(([locale, tmpl]) => {
      expect(tmpl.disclaimer).toBeTruthy();
      expect(tmpl.disclaimer.length).toBeGreaterThan(10);
    });
  });

  test('生成的 Hand-off 標記為 desensitized', () => {
    const result = generate({
      pattern: 'MB',
      score: 0.8,
      channel: 'push',
      locale: 'en'
    });
    expect(result.desensitized).toBe(true);
  });

});
