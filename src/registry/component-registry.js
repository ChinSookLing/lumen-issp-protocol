const VALID_COMPONENTS_BY_PATTERN = {
  DM: ["excl", "debt", "withdraw", "opts"],
  FC: ["binary_frame", "consequence", "closure_pressure", "label_attack"],
  MB: ["guilt_invoke", "collective_pressure", "sacrifice_demand", "moral_consequence"],
  EA: ["bond_claim", "isolation_hint", "abandon_fear", "affection_gate"],
  IP: ["id_req", "narrow", "press", "legit"],
  GC: ["excl_auth", "salvation", "ext_discredit", "obed_link"],
  EP: ["bait_or_taunt", "escalation_pressure", "forced_response_frame", "label_or_shame_hook"],
  VS: ["ucp", "rnr", "pba", "avoid"],
  "Class-0": ["ctx_gap", "alt_abs", "counter_miss", "clarity_skip"],
};

const BOOSTER_COMPONENTS = new Set(["label_attack", "label_or_shame_hook"]);

function validateMapping(mapping) {
  var validComponents = VALID_COMPONENTS_BY_PATTERN[mapping.pattern];
  if (!validComponents) {
    throw new Error("Unknown pattern: " + mapping.pattern);
  }
  var entries = Object.entries(mapping.mappings);
  for (var i = 0; i < entries.length; i++) {
    var rule = entries[i][1];
    if (validComponents.indexOf(rule.component) === -1) {
      throw new Error("Invalid component " + rule.component + " for " + mapping.pattern);
    }
  }
  return true;
}

module.exports = {
  VALID_COMPONENTS_BY_PATTERN: VALID_COMPONENTS_BY_PATTERN,
  BOOSTER_COMPONENTS: BOOSTER_COMPONENTS,
  validateMapping: validateMapping,
};
