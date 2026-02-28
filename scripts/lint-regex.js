#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const coreDir = path.join(repoRoot, 'core');

function getCoreJsFiles() {
  return fs
    .readdirSync(coreDir)
    .filter((name) => name.endsWith('.js'))
    .sort()
    .map((name) => path.join(coreDir, name));
}

function getLineNumber(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source[i] === '\n') {
      line += 1;
    }
  }
  return line;
}

function looksLikeRegexStart(source, index, prevTokenChar) {
  const next = source[index + 1];
  if (!next || next === '/' || next === '*') {
    return false;
  }

  if (!prevTokenChar) {
    return true;
  }

  return /[=(:,!&|?;{}\[\]<>+\-*%^~]/.test(prevTokenChar);
}

function extractRegexLiterals(source) {
  const literals = [];
  let i = 0;
  let state = 'code';
  let prevTokenChar = '';

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') {
        state = 'code';
      }
      i += 1;
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && next === '/') {
        state = 'code';
        i += 2;
      } else {
        i += 1;
      }
      continue;
    }

    if (state === 'singleQuote') {
      if (ch === '\\') {
        i += 2;
      } else if (ch === '\'') {
        state = 'code';
        i += 1;
        prevTokenChar = '"';
      } else {
        i += 1;
      }
      continue;
    }

    if (state === 'doubleQuote') {
      if (ch === '\\') {
        i += 2;
      } else if (ch === '"') {
        state = 'code';
        i += 1;
        prevTokenChar = '"';
      } else {
        i += 1;
      }
      continue;
    }

    if (state === 'template') {
      if (ch === '\\') {
        i += 2;
      } else if (ch === '`') {
        state = 'code';
        i += 1;
        prevTokenChar = '"';
      } else {
        i += 1;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      state = 'lineComment';
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      state = 'blockComment';
      i += 2;
      continue;
    }

    if (ch === '\'') {
      state = 'singleQuote';
      i += 1;
      continue;
    }

    if (ch === '"') {
      state = 'doubleQuote';
      i += 1;
      continue;
    }

    if (ch === '`') {
      state = 'template';
      i += 1;
      continue;
    }

    if (ch === '/' && looksLikeRegexStart(source, i, prevTokenChar)) {
      const start = i;
      i += 1;
      let inClass = false;
      let closed = false;

      while (i < source.length) {
        const current = source[i];

        if (current === '\\') {
          i += 2;
          continue;
        }

        if (current === '[') {
          inClass = true;
          i += 1;
          continue;
        }

        if (current === ']' && inClass) {
          inClass = false;
          i += 1;
          continue;
        }

        if (current === '/' && !inClass) {
          i += 1;
          while (i < source.length && /[a-z]/i.test(source[i])) {
            i += 1;
          }
          closed = true;
          break;
        }

        i += 1;
      }

      if (closed) {
        const literal = source.slice(start, i);
        literals.push({
          literal,
          start,
        });
        prevTokenChar = '/';
      }
      continue;
    }

    if (!/\s/.test(ch)) {
      prevTokenChar = ch;
    }

    i += 1;
  }

  return literals;
}

function isBroadWildcardWithoutAnchor(regexLiteral) {
  if (!/^\/.+\/[a-z]*$/i.test(regexLiteral)) {
    return false;
  }

  const lastSlash = regexLiteral.lastIndexOf('/');
  const body = regexLiteral.slice(1, lastSlash);
  const hasBroadWildcard = body.includes('.*') || body.includes('.+');
  const hasAnchor = body.includes('^') || body.includes('$');

  return hasBroadWildcard && !hasAnchor;
}

const warnings = [];
for (const filePath of getCoreJsFiles()) {
  const source = fs.readFileSync(filePath, 'utf8');
  const literals = extractRegexLiterals(source);

  for (const item of literals) {
    if (isBroadWildcardWithoutAnchor(item.literal)) {
      const line = getLineNumber(source, item.start);
      warnings.push({
        file: path.relative(repoRoot, filePath),
        line,
        regex: item.literal,
      });
    }
  }
}

for (const warning of warnings) {
  console.log(`WARN ${warning.file}:${warning.line} ${warning.regex}`);
}

console.log(`TOTAL_WARNINGS ${warnings.length}`);
process.exitCode = 0;
