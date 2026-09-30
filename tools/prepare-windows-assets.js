const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
const appName = appJson.name || 'GiroVendasDesktop';

const src = path.join(root, 'node_modules', 'react-native-vector-icons', 'Fonts', 'Ionicons.ttf');
const appDir = path.join(root, 'windows', appName);
const assetsDir = path.join(appDir, 'Assets');
const dst = path.join(assetsDir, 'Ionicons.ttf');
const vcxproj = path.join(appDir, `${appName}.vcxproj`);

function readU32BE(buf, off) {
  return buf.readUInt32BE(off);
}

function writeU32BE(buf, off, value) {
  buf.writeUInt32BE(value >>> 0, off);
}

function checksum(buf, start, length) {
  let sum = 0;
  const end = start + length;
  let i = start;
  for (; i + 3 < end; i += 4) {
    sum = (sum + buf.readUInt32BE(i)) >>> 0;
  }
  if (i < end) {
    const tail = Buffer.alloc(4);
    buf.copy(tail, 0, i, end);
    sum = (sum + tail.readUInt32BE(0)) >>> 0;
  }
  return sum >>> 0;
}

// RNW's Windows text stack has historically been stricter about bundled TTF
// metadata. Recalculate the SFNT table checksums and head.checkSumAdjustment
// on the copy we place in the Windows project. Glyph outlines are untouched.
function repairTtfChecksums(input) {
  const out = Buffer.from(input);
  if (out.length < 12) throw new Error('Ionicons.ttf inválido: cabeçalho muito curto.');

  const numTables = out.readUInt16BE(4);
  const recordsStart = 12;
  if (recordsStart + numTables * 16 > out.length) {
    throw new Error('Ionicons.ttf inválido: diretório de tabelas truncado.');
  }

  let headOffset = -1;
  let headLength = 0;

  // First zero head.checkSumAdjustment because the table checksum is defined
  // with that field cleared.
  for (let i = 0; i < numTables; i++) {
    const rec = recordsStart + i * 16;
    const tag = out.toString('ascii', rec, rec + 4);
    const tableOffset = readU32BE(out, rec + 8);
    const tableLength = readU32BE(out, rec + 12);

    if (tableOffset + tableLength > out.length) {
      throw new Error(`Ionicons.ttf inválido: tabela ${tag} fora do arquivo.`);
    }

    if (tag === 'head') {
      headOffset = tableOffset;
      headLength = tableLength;
      if (headLength >= 12) writeU32BE(out, headOffset + 8, 0);
    }
  }

  if (headOffset < 0 || headLength < 12) {
    throw new Error('Ionicons.ttf inválido: tabela head não encontrada.');
  }

  // Recompute all table checksums.
  for (let i = 0; i < numTables; i++) {
    const rec = recordsStart + i * 16;
    const tableOffset = readU32BE(out, rec + 8);
    const tableLength = readU32BE(out, rec + 12);
    writeU32BE(out, rec + 4, checksum(out, tableOffset, tableLength));
  }

  // The global checksum includes the zeroed checkSumAdjustment field.
  const paddedLength = (out.length + 3) & ~3;
  const padded = Buffer.alloc(paddedLength);
  out.copy(padded);
  const sum = checksum(padded, 0, padded.length);
  const adjustment = (0xB1B0AFBA - sum) >>> 0;
  writeU32BE(out, headOffset + 8, adjustment);

  return out;
}

if (!fs.existsSync(src)) {
  throw new Error(`Fonte Ionicons não encontrada em ${src}. Rode npm install antes deste passo.`);
}
if (!fs.existsSync(appDir)) {
  throw new Error(`Projeto Windows não encontrado em ${appDir}. O init-windows precisa rodar antes.`);
}

fs.mkdirSync(assetsDir, {recursive: true});
const original = fs.readFileSync(src);
const repaired = repairTtfChecksums(original);
fs.writeFileSync(dst, repaired);

if (!fs.existsSync(vcxproj)) {
  throw new Error(`Projeto nativo não encontrado em ${vcxproj}.`);
}

let project = fs.readFileSync(vcxproj, 'utf8');
const escapedAsset = 'Assets\\\\Ionicons.ttf';

if (!project.includes('Ionicons.ttf')) {
  const itemGroup =
    `  <ItemGroup>\n` +
    `    <None Include="${escapedAsset}">\n` +
    `      <DeploymentContent>true</DeploymentContent>\n` +
    `    </None>\n` +
    `  </ItemGroup>\n`;
  const importMarker = '  <Import Project="$(VCTargetsPath)\\\\Microsoft.Cpp.targets" />';
  if (project.includes(importMarker)) {
    project = project.replace(importMarker, itemGroup + importMarker);
  } else {
    project += `\n${itemGroup}`;
  }
  fs.writeFileSync(vcxproj, project);
}

console.log(`Ionicons preparado: ${dst} (${repaired.length} bytes)`);
console.log(`Projeto nativo atualizado: ${vcxproj}`);
