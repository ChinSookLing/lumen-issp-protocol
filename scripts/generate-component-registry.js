var fs = require("fs");
var path = require("path");

var CORE_DIR = path.join(__dirname, "../core");
var OUTPUT_FILE = path.join(__dirname, "../schemas/component-registry.generated.json");

var patternFiles = {
  DM: "dm.js",
  FC: "fc.js",
  MB: "mb.js",
  EA: "ea.js",
  IP: "ip.js",
  GC: "gc.js",
  EP: "ep.js",
  VS: "vs.js",
  "Class-0": "class0.js"
};

var registry = {};

var patterns = Object.keys(patternFiles);
for (var i = 0; i < patterns.length; i++) {
  var pattern = patterns[i];
  var filename = patternFiles[pattern];
  var filePath = path.join(CORE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn("Warning: " + filePath + " not found, skipping");
    continue;
  }
  var content = fs.readFileSync(filePath, "utf-8");
  var regex = /components\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
  var match;
  var keys = [];
  while ((match = regex.exec(content)) !== null) {
    if (keys.indexOf(match[1]) === -1) {
      keys.push(match[1]);
    }
  }
  keys.sort();
  registry[pattern] = keys;
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
console.log("Generated " + OUTPUT_FILE);
