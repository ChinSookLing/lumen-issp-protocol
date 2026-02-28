/**
 * time-provider.js
 * 可注入的時間來源 — 測試用固定時鐘，生產用 Date.now()
 *
 * 設計：Node-05（M70 Sprint 8 建議 #1）
 * 實作：Node-01（Architect）
 * 日期：2026-02-18
 */
'use strict';

let _provider = () => new Date();

function now() {
  return _provider();
}

function isoNow() {
  return _provider().toISOString();
}

function epochNow() {
  return _provider().getTime();
}

function setProvider(fn) {
  if (typeof fn !== 'function') {
    throw new Error('time-provider: setProvider requires a function');
  }
  _provider = fn;
}

function resetProvider() {
  _provider = () => new Date();
}

module.exports = { now, isoNow, epochNow, setProvider, resetProvider };
