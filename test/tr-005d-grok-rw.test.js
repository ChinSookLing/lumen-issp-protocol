// TR-005d Golden Tests — Node-06 EP + DM (X real posts)
// Source: Node-06 Beta 4.2 (4 agents: Harper/Benjamin/Lucas/Node-06)
// Date: 2026-02-19, archive attempted but invalid
// All posts verified by Tuzi via original X URLs

const { pipeline } = require('../src/pipeline/dispatcher');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-005d: Node-06 EP escalation (X real posts)", () => {
  it("GK-EP01: you'll regret it — Gate >= 3", () => {
    const d = pipeline("You havent even been able to reclaim Abkhazia and South Ossetia yet. So before you criticize Turkiye and the Turks, look at yourselves. Otherwise, youll regret it.").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 3, "Gate >= 3");
  });

  it("GK-EP02: youre done — Gate >= 1", () => {
    const d = pipeline("Oh your so done youre done!").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("GK-EP04: YOU OWE ME — Gate >= 1", () => {
    const d = pipeline("I literally requested the 100! You lost the bet and never paid so I did a favor for you. YOU OWE ME").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });
});

describe("TR-005d: Node-06 DM debt (X real posts)", () => {
  it("GK-DM01: You owe me 300m — Gate >= 1", () => {
    const d = pipeline("You owe me 300m").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });

  it("GK-DM02: you owe me kitchen nightmares — Gate >= 1", () => {
    const d = pipeline("just for that, please go enjoy your silly game! enjoy your update! have fun! you owe me some kitchen nightmares soon tho").event._detection;
    assert.ok(d.gate_hits.push.hit_count >= 1, "Gate >= 1");
  });
});

describe("TR-005d: Node-06 benign guards", () => {
  it("GK-EPB: business joke — no FC trigger", () => {
    const d = pipeline("what you reckon? You owe me 10 percent of all money you ever make from this product, forever, and from anything else you spin out of it or that looks or works like it.").event._detection;
    assert.equal(d.acri, 0, "Benign should not trigger");
  });
});
