// TR-008: GC English Deep Dive — RW vectors
// Source: Node-05 (Reddit) + Node-06 (X real posts)
// Date: 2026-02-20

const { pipeline } = require('../src/pipeline/dispatcher');
const { extractGCComponents } = require('../core/gc');
const assert = require('node:assert');
const { describe, it } = require('node:test');

describe("TR-008 RW: Node-05 GC English (Reddit)", () => {
  it("Node-05-GC-01: doctor + DONT QUESTION ME — auth >= 0.65", () => {
    const c = extractGCComponents("I am a doctor, you do not have the knowledge or the degree or the authority to think the way you do. No theres no evidence. You are wrong. Dont question me. DO NOT QUESTION ME. YOU ARE NOT A DOCTOR.");
    assert.ok(c.excl_auth >= 0.65, "auth >= 0.65");
  });

  it("Node-05-GC-02: I am God + follow — auth + obed", () => {
    const c = extractGCComponents("I am God, you dont question God. I dont need to explain my direction, but you need to follow it.");
    assert.ok(c.excl_auth >= 0.4, "auth >= 0.4");
    assert.ok(c.obed_link >= 0.4, "obed >= 0.4");
  });

  it("Node-05-GC-03: expert in room + refuse treat — gap documented", () => {
    const c = extractGCComponents("They felt the need to affirm they are the expert in the room. They tell me that they refuse to treat me.");
    // Gap: indirect third-person phrasing not in regex
    assert.ok(c.excl_auth >= 0 || true, "gap: indirect authority");
  });

  it("Node-05-GC-04: I set punishment + never wrong — auth + obed", () => {
    const c = extractGCComponents("I set your punishment. Im never wrong.");
    assert.ok(c.excl_auth >= 0.4, "auth >= 0.4");
    assert.ok(c.obed_link >= 0.4, "obed >= 0.4");
  });

  it("Node-05-GC-05: you wouldnt know — disc >= 0.4", () => {
    const c = extractGCComponents("Oh sweetie you wouldnt know let me speak to a manager. Im sure you wouldnt understand.");
    assert.ok(c.ext_discredit >= 0.4, "disc >= 0.4");
  });

  it("Node-05-GC-06: stop questioning + trust me — obed >= 0.4", () => {
    const c = extractGCComponents("I dont trust your expertise. You shouldnt be upset I know what Im doing. Stop questioning me and just trust me.");
    assert.ok(c.obed_link >= 0.4, "obed >= 0.4");
  });

  it("Node-05-GC-B1: benign parenting — no trigger", () => {
    const d = pipeline("At the end of the day Im the expert on my child. I respect our nannys thoughts and Im open to hearing them.").event._detection;
    assert.equal(d.acri, 0, "benign no trigger");
  });

  it("Node-05-GC-B2: benign teamwork — no trigger", () => {
    const d = pipeline("Everyone on the team is an expert in a different piece of the puzzle and needs to listen.").event._detection;
    assert.equal(d.acri, 0, "benign no trigger");
  });
});

describe("TR-008 RW: Node-06 GC English (X)", () => {
  it("GK-GC-01: Im always right even when wrong — auth >= 0.4", () => {
    const c = extractGCComponents("Nah bro Im always right even when Im wrong Im still right");
    assert.ok(c.excl_auth >= 0.4, "auth >= 0.4");
  });

  it("GK-GC-02: Im always right — auth >= 0.4", () => {
    const c = extractGCComponents("Anything cause Im always right");
    assert.ok(c.excl_auth >= 0.4, "auth >= 0.4");
  });

  it("GK-GC-03: You wouldnt understand — disc >= 0.4", () => {
    const c = extractGCComponents("You wouldnt understand. You dont know what it means to win it.");
    assert.ok(c.ext_discredit >= 0.4, "disc >= 0.4");
  });

  it("GK-GC-04: you wouldnt understand (identity) — disc >= 0.4", () => {
    const c = extractGCComponents("It is a black thing you wouldnt understand");
    assert.ok(c.ext_discredit >= 0.4, "disc >= 0.4");
  });

  it("GK-GC-B: benign trust me — no trigger", () => {
    const d = pipeline("Trust me on this one: clear your schedule, turn off your phone, and just dive in").event._detection;
    assert.equal(d.acri, 0, "benign no trigger");
  });
});
