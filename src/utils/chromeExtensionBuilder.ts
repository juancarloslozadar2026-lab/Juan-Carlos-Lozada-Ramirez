import { EVIDENCES_GA2, PROGRAM_INFO } from '../data/senaGa2Data';

// Pure TypeScript CRC32 implementation for standard ZIP archive creation
function crc32(bytes: Uint8Array): number {
  let c = -1;
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

interface ZipEntry {
  filename: string;
  content: string;
}

function createZipBlob(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  }[] = [];

  let offset = 0;
  const localChunks: Uint8Array[] = [];

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.filename);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true); // Version needed
    view.setUint16(6, 0x0800, true); // UTF-8 flag
    view.setUint16(8, 0, true); // Compression: 0 (Stored)
    view.setUint16(10, 0, true); // Mod time
    view.setUint16(12, 0, true); // Mod date
    view.setUint32(14, crc, true);
    view.setUint32(18, dataBytes.length, true);
    view.setUint32(22, dataBytes.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    fileRecords.push({ nameBytes, dataBytes, crc, offset });
    localChunks.push(localHeader, dataBytes);
    offset += localHeader.length + dataBytes.length;
  }

  const centralChunks: Uint8Array[] = [];
  let centralSize = 0;

  for (const rec of fileRecords) {
    const centralHeader = new Uint8Array(46 + rec.nameBytes.length);
    const view = new DataView(centralHeader.buffer);
    view.setUint32(0, 0x02014b50, true); // Central directory signature
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0x0800, true); // UTF-8
    view.setUint16(10, 0, true); // Stored
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, rec.crc, true);
    view.setUint32(20, rec.dataBytes.length, true);
    view.setUint32(24, rec.dataBytes.length, true);
    view.setUint16(28, rec.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, rec.offset, true);
    centralHeader.set(rec.nameBytes, 46);

    centralChunks.push(centralHeader);
    centralSize += centralHeader.length;
  }

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // End of central directory
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, fileRecords.length, true);
  eocdView.setUint16(10, fileRecords.length, true);
  eocdView.setUint32(12, centralSize, true);
  eocdView.setUint32(16, offset, true);
  eocdView.setUint16(20, 0, true);

  return new Blob([...localChunks, ...centralChunks, eocd], {
    type: 'application/zip',
  });
}

export function getChromeExtensionFiles(): ZipEntry[] {
  const manifestJson = JSON.stringify(
    {
      manifest_version: 3,
      name: 'Evaluador SENA GA2 — Medios Gráficos Visuales (522309)',
      short_name: 'SENA GA2 Eval',
      version: '2.1.0',
      description:
        'Extensión para Instructores SENA: Calificación 1-100, rúbricas IE-GA2 y retroalimentación AVA para Desarrollo de Medios Gráficos Visuales.',
      permissions: ['storage', 'activeTab', 'scripting', 'clipboardWrite', 'sidePanel'],
      action: {
        default_title: 'Abrir Evaluador SENA GA2',
        default_popup: 'popup.html',
      },
      side_panel: {
        default_path: 'popup.html',
      },
      background: {
        service_worker: 'background.js',
      },
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js'],
          run_at: 'document_idle',
        },
      ],
    },
    null,
    2
  );

  const backgroundJs = `// Servicio Background para abrir Panel Lateral o Popup SENA GA2
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }
});
`;

  const contentJs = `// Script de Integración LMS SENA (Zajuna / Territorium)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'INSERT_AVA_FEEDBACK') {
    const activeEl = document.activeElement;
    const textareas = Array.from(document.querySelectorAll('textarea, [contenteditable="true"]'));
    const target = (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable))
      ? activeEl
      : textareas[0];

    if (target) {
      if (target.tagName === 'TEXTAREA') {
        target.value = msg.comment;
        target.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        target.innerText = msg.comment;
      }
      sendResponse({ ok: true });
    } else {
      navigator.clipboard.writeText(msg.comment);
      sendResponse({ ok: false, copied: true });
    }
  }
  return true;
});
`;

  const popupHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Evaluador SENA GA2 — Extensión Chrome</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { width: 460px; min-height: 580px; margin: 0; padding: 14px; background: #F8FAFC; color: #0F172A; }
    .header { border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 14px; font-weight: 700; margin: 0; color: #0F172A; }
    .subtitle { font-size: 11px; color: #64748B; margin: 2px 0 0 0; }
    label { display: block; font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px; }
    select, input[type="text"], textarea {
      width: 100%; padding: 7px 9px; font-size: 12px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFF; margin-bottom: 10px;
    }
    .criterion { background: #FFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 9px 10px; margin-bottom: 8px; }
    .crit-head { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 4px; }
    .crit-desc { font-size: 10.5px; color: #64748B; margin-bottom: 6px; line-height: 1.35; }
    .status-banner { padding: 10px 12px; border-radius: 8px; font-weight: 700; font-size: 12px; margin: 10px 0; border: 1px solid transparent; }
    .approved { background: #F0FDF4; border-color: #86EFAC; color: #15803D; }
    .rejected { background: #FEF2F2; border-color: #FCA5A5; color: #B91C1C; }
    .btn-row { display: flex; gap: 8px; margin-top: 8px; }
    button { flex: 1; padding: 8px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; }
    .btn-primary { background: #0F172A; color: #FFF; }
    .btn-secondary { background: #E2E8F0; color: #1E293B; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Evaluador SENA · Guía 2 (522309)</h1>
      <p class="subtitle">Desarrollo de Medios Gráficos Visuales</p>
    </div>
  </div>

  <label for="apprentice">Nombre(s) del Aprendiz (separar por coma si es grupal):</label>
  <input id="apprentice" type="text" placeholder="Ej: Valentina Morales, Carlos Peña" value="Valentina Morales Gómez" />

  <label for="evidence">Evidencia Guía de Aprendizaje 2:</label>
  <select id="evidence"></select>

  <div id="criteria-container"></div>

  <div id="status-box" class="status-banner approved"></div>

  <label for="feedback">Comentario de Retroalimentación AVA:</label>
  <textarea id="feedback" rows="7"></textarea>

  <div class="btn-row">
    <button id="btn-copy" class="btn-primary">Copiar Comentario AVA</button>
    <button id="btn-inject" class="btn-secondary">Insertar en LMS SENA</button>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `const EVIDENCES = ${JSON.stringify(EVIDENCES_GA2, null, 2)};

const evidenceSelect = document.getElementById('evidence');
const apprenticeInput = document.getElementById('apprentice');
const criteriaContainer = document.getElementById('criteria-container');
const statusBox = document.getElementById('status-box');
const feedbackArea = document.getElementById('feedback');
const btnCopy = document.getElementById('btn-copy');
const btnInject = document.getElementById('btn-inject');

let currentEvidence = EVIDENCES[0];
let scores = {};

EVIDENCES.forEach((ev, idx) => {
  const opt = document.createElement('option');
  opt.value = idx;
  opt.textContent = ev.code + ' — ' + ev.title.slice(0, 44) + '...';
  evidenceSelect.appendChild(opt);
});

function initScores() {
  scores = {};
  currentEvidence.rubric.forEach(c => { scores[c.id] = 85; });
}

function renderCriteria() {
  criteriaContainer.innerHTML = '';
  currentEvidence.rubric.forEach(c => {
    const div = document.createElement('div');
    div.className = 'criterion';
    div.innerHTML = \`
      <div class="crit-head">
        <span>\${c.title} (\${c.weight}%)</span>
        <span id="val-\${c.id}">\${scores[c.id]} / 100</span>
      </div>
      <div class="crit-desc">\${c.description}</div>
      <input type="range" min="1" max="100" value="\${scores[c.id]}" id="rng-\${c.id}" style="width:100%" />
    \`;
    criteriaContainer.appendChild(div);
    div.querySelector('input').addEventListener('input', (e) => {
      scores[c.id] = Number(e.target.value);
      document.getElementById('val-' + c.id).textContent = scores[c.id] + ' / 100';
      updateEvaluation();
    });
  });
}

function updateEvaluation() {
  let total = 0;
  currentEvidence.rubric.forEach(c => {
    total += (scores[c.id] || 1) * (c.weight / 100);
  });
  const finalScore = Math.max(1, Math.min(100, Math.round(total)));
  const approved = finalScore >= 70;
  const names = apprenticeInput.value.trim() || 'Aprendiz SENA';

  statusBox.className = 'status-banner ' + (approved ? 'approved' : 'rejected');
  statusBox.textContent = (approved ? 'APROBADO' : 'NO APROBADO') + ' — ' + names + ' — Calificación: ' + finalScore + ' / 100';

  const strengths = currentEvidence.rubric.filter(c => scores[c.id] >= 75).map(c => c.strengthFeedback);
  const improvements = currentEvidence.rubric.filter(c => scores[c.id] < 75).map(c => c.improvementFeedback);

  const comment = [
    'Estimado(a) aprendiz ' + names + ', recibe un cordial saludo.',
    '',
    'Reconozco y valoro tu esfuerzo y dedicación en la entrega de la evidencia "' + currentEvidence.code + ' - ' + currentEvidence.title + '" (' + currentEvidence.instrumentCode + ').',
    strengths.length ? 'Destaco positivamente que ' + strengths.join('; además, ') + '.' : 'Valoro tu avance inicial en el desarrollo de esta actividad de la Guía 2.',
    improvements.length
      ? 'Según la Guía de Orientación AVA, para alcanzar los criterios de evaluación te sugiero: ' + improvements.join('; asimismo, ') + '. Te invito a consultar el componente "' + currentEvidence.formativeComponent + '".'
      : 'Cumples satisfactoriamente con los criterios de evaluación establecidos en el instrumento ' + currentEvidence.instrumentCode + '.',
    '',
    'Estado: ' + (approved ? 'APROBADO' : 'NO APROBADO') + ' (' + names + ') | Calificación: ' + finalScore + '/100 (' + (approved ? 'A' : 'D') + ').',
    'Atentamente, Instructor Virtual SENA — Programa 522309.'
  ].join('\\n');

  feedbackArea.value = comment;
}

evidenceSelect.addEventListener('change', (e) => {
  currentEvidence = EVIDENCES[Number(e.target.value)];
  initScores();
  renderCriteria();
  updateEvaluation();
});

apprenticeInput.addEventListener('input', updateEvaluation);

btnCopy.addEventListener('click', () => {
  navigator.clipboard.writeText(feedbackArea.value);
  btnCopy.textContent = '¡Copiado al portapapeles!';
  setTimeout(() => { btnCopy.textContent = 'Copiar Comentario AVA'; }, 1500);
});

btnInject.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'INSERT_AVA_FEEDBACK', comment: feedbackArea.value });
      }
    });
  }
});

initScores();
renderCriteria();
updateEvaluation();
`;

  const readmeTxt = `======================================================================
EXTENSIÓN GOOGLE CHROME: EVALUADOR SENA GUÍA DE APRENDIZAJE 2
Programa: ${PROGRAM_INFO.programName} (Código ${PROGRAM_INFO.programCode})
======================================================================

INSTRUCCIONES DE INSTALACIÓN EN GOOGLE CHROME (60 SEGUNDOS):

1. Descomprima este archivo ZIP en una carpeta de su computador
   (por ejemplo: "SENA_Evaluador_GA2_Extension").
2. Abra su navegador Google Chrome y escriba en la barra de direcciones:
   chrome://extensions/
3. En la esquina superior derecha, active el interruptor "Modo de desarrollador"
   (Developer mode).
4. Haga clic en el botón "Cargar descomprimida" (Load unpacked) arriba a la izquierda.
5. Seleccione la carpeta donde descomprimió los archivos.
6. ¡Listo! Fije el icono de "Evaluador SENA GA2" en su barra de extensiones de Chrome
   para calificar evidencias directamente sobre Zajuna / Territorium SENA.
`;

  return [
    { filename: 'manifest.json', content: manifestJson },
    { filename: 'popup.html', content: popupHtml },
    { filename: 'popup.js', content: popupJs },
    { filename: 'background.js', content: backgroundJs },
    { filename: 'content.js', content: contentJs },
    { filename: 'README_INSTALACION.txt', content: readmeTxt },
  ];
}

export function downloadChromeExtensionZip(): void {
  const files = getChromeExtensionFiles();
  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SENA_Evaluador_GA2_522309_Chrome_Extension.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
