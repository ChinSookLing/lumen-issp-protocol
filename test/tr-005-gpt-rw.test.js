// TR-005 Golden Tests — Node-05-C11~C22 + Node-01 COMBO
// M75 1A regex expansion verification vectors
// Source: Node-05 (Reddit forum posts), Node-01 (designed COMBO)
// Date: 2026-02-19

const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-005: Node-05 RW vectors — FC Chain-RW", () => {
  it("Node-05-C11: PIP 30-day ultimatum — should trigger FC", () => {
    const r = pipeline("It was basically an ultimatum: improve in 30 days or get fired. Each week there was a meeting and I was criticized for something different. The goals felt subjective and shifting.");
    const d = r.event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 2, "Gate >= 2");
    assert.ok(d.acri > 0, "FC should trigger");
  });

  it("Node-05-C13: 24h lease deadline — Gate >= 2", () => {
    const r = pipeline("You have 24 hours to decide, because we already have another prospective tenant. If you dont renew within that window, the unit will be given away.");
    const d = r.event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 2, "Gate >= 2");
  });

  it("Node-05-C16B: benign lease — no trigger", () => {
    const r = pipeline("Take a few days to review the lease and ask questions. Let us know by the end of the week. No pressure.");
    const d = r.event._detection;
    assert.equal(d.acri, 0, "Benign should not trigger");
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate should be 0");
  });
});

describe("TR-005: Node-05 RW vectors — MB loyalty/identity", () => {
  it("Node-05-C17: if you really cared — Gate >= 2", () => {
    const r = pipeline("I dont care if you were depressed or whatever. I have struggled too, but I never left my friends behind. If you really cared about me, you would have done it as soon as you saw it.");
    const d = r.event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 2, "Gate >= 2");
  });

  it("Node-05-C18: with us or against us — should trigger MB", () => {
    const r = pipeline("If youre not with us, youre against us. People got attacked for posting anything other than activist posts. Even neutral content was treated as betrayal.");
    const d = r.event._detection;
    assert.ok(d.acri > 0, "MB should trigger");
  });

  it("Node-05-C21B: benign friendship — no trigger", () => {
    const r = pipeline("I feel stressed can we talk tomorrow instead? No worries if you cant make it. Our friendship isnt measured by one action.");
    const d = r.event._detection;
    assert.equal(d.acri, 0, "Benign should not trigger");
    assert.equal(d.gate_hits.push.hit_count, 0, "Gate should be 0");
  });
});

describe("TR-005: Node-01 COMBO vectors", () => {
  it("COMBO-MB: loyalty + letting down — should trigger MB", () => {
    const r = pipeline("If you really cared about us you would speak up. Real friends dont stay silent. You are letting everyone down.");
    const d = r.event._detection;
    assert.ok(d.acri > 0, "MB should trigger");
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
  });

  it("COMBO-MB-BENIGN: care without pressure — no trigger", () => {
    const r = pipeline("I really care about my friends and I try not to let anyone down.");
    const d = r.event._detection;
    assert.equal(d.acri, 0, "Benign should not trigger");
  });
});
