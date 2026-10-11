/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Check,
  Copy,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  PanelRight,
  Maximize2,
  FileSpreadsheet,
  Puzzle,
  RotateCcw,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import {
  EVIDENCES_GA2,
  PROGRAM_INFO,
  INITIAL_EVALUATED_SUBMISSIONS,
  EvaluatedSubmission,
  buildAvaFeedbackComment,
} from './data/senaGa2Data';
import {
  downloadChromeExtensionZip,
  getChromeExtensionFiles,
} from './utils/chromeExtensionBuilder';

const STORAGE_KEY = 'sena_ga2_522309_submissions_v2';

// Exact high-precision reproduction of the uploaded APROBADO.png (Green Smiley Face)
const APROBADO_FACE_DATA_URI =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
      <circle cx="500" cy="500" r="452" fill="#23F218" stroke="#1A1A1A" stroke-width="34" />
      <ellipse cx="363" cy="340" rx="48" ry="80" fill="#1A1A1A" />
      <ellipse cx="632" cy="340" rx="48" ry="80" fill="#1A1A1A" />
      <path d="M 260 540 A 240 235 0 0 0 740 540" fill="none" stroke="#1A1A1A" stroke-width="32" stroke-linecap="round" />
    </svg>`
  );

// Exact high-precision reproduction of the uploaded NO APROBADO.png (Red Frowning Face)
const NO_APROBADO_FACE_DATA_URI =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
      <circle cx="500" cy="500" r="452" fill="#E62429" stroke="#1A1A1A" stroke-width="34" />
      <ellipse cx="358" cy="340" rx="48" ry="80" fill="#1A1A1A" />
      <ellipse cx="628" cy="340" rx="48" ry="80" fill="#1A1A1A" />
      <path d="M 255 740 A 242 235 0 0 1 738 740" fill="none" stroke="#1A1A1A" stroke-width="32" stroke-linecap="round" />
    </svg>`
  );

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'evaluador' | 'consolidado' | 'guia' | 'extension'>('evaluador');
  const [chromeSidePanelMode, setChromeSidePanelMode] = useState<boolean>(false);

  // Selected Evidence
  const [selectedEvidenceCode, setSelectedEvidenceCode] = useState<string>(EVIDENCES_GA2[0].code);
  const [hasClickedEvidence, setHasClickedEvidence] = useState<boolean>(false);
  const currentEvidence = useMemo(
    () => EVIDENCES_GA2.find((e) => e.code === selectedEvidenceCode) || EVIDENCES_GA2[0],
    [selectedEvidenceCode]
  );

  // Apprentice(s) & Instructor Metadata
  const [apprenticeNames, setApprenticeNames] = useState<string[]>(['Valentina Morales Gómez']);
  const [newApprenticeInput, setNewApprenticeInput] = useState<string>('');
  const [fichaNumber, setFichaNumber] = useState<string>('2874519');
  const [instructorName, setInstructorName] = useState<string>('Instructor Virtual SENA');
  const [customObservation, setCustomObservation] = useState<string>('');

  // Criterion Scores (1 to 100)
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    EVIDENCES_GA2[0].rubric.forEach((c) => {
      initial[c.id] = 88;
    });
    return initial;
  });

  // Reset rubric scores when switching evidence if not initialized
  useEffect(() => {
    setCriterionScores((prev) => {
      const next = { ...prev };
      currentEvidence.rubric.forEach((c) => {
        if (typeof next[c.id] !== 'number') {
          next[c.id] = 85;
        }
      });
      return next;
    });
  }, [currentEvidence]);

  // Saved Submissions Roster (persisted in localStorage)
  const [submissions, setSubmissions] = useState<EvaluatedSubmission[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_EVALUATED_SUBMISSIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
    } catch {
      // ignore storage errors
    }
  }, [submissions]);

  // Filter states for Consolidado
  const [rosterFilterStatus, setRosterFilterStatus] = useState<'TODOS' | 'APROBADO' | 'NO_APROBADO'>('TODOS');
  const [rosterFilterEvidence, setRosterFilterEvidence] = useState<string>('TODAS');
  const [rosterSearch, setRosterSearch] = useState<string>('');

  // Copy & Selection states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState<boolean>(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [isDictamenSelected, setIsDictamenSelected] = useState<boolean>(false);
  const [selectedRosterApprenticeName, setSelectedRosterApprenticeName] = useState<string | null>(
    'Valentina Morales Gómez'
  );

  // Selected extension file preview
  const extensionFiles = useMemo(() => getChromeExtensionFiles(), []);
  const [selectedExtFile, setSelectedExtFile] = useState<string>('manifest.json');

  // Weighted Score Calculation (1 to 100)
  const finalScore = useMemo(() => {
    let weightedSum = 0;
    currentEvidence.rubric.forEach((c) => {
      const score = criterionScores[c.id] ?? 80;
      weightedSum += score * (c.weight / 100);
    });
    return Math.max(1, Math.min(100, Math.round(weightedSum)));
  }, [currentEvidence, criterionScores]);

  const isApproved = finalScore >= 70;

  // Generated AVA Comment
  const generatedComment = useMemo(() => {
    return buildAvaFeedbackComment({
      apprenticeNames,
      evidence: currentEvidence,
      criterionScores,
      finalScore,
      customObservation,
      instructorName,
    });
  }, [apprenticeNames, currentEvidence, criterionScores, finalScore, customObservation, instructorName]);

  // Handlers
  const handleCriterionScoreChange = (criterionId: string, value: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(value)));
    setCriterionScores((prev) => ({
      ...prev,
      [criterionId]: clamped,
    }));
  };

  const handleSetAllCriteria = (targetScore: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(targetScore)));
    const updated: Record<string, number> = { ...criterionScores };
    currentEvidence.rubric.forEach((c) => {
      updated[c.id] = clamped;
    });
    setCriterionScores(updated);
  };

  const handleAddApprentice = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newApprenticeInput.trim();
    if (!trimmed) return;
    setApprenticeNames((prev) => [...prev, trimmed]);
    setNewApprenticeInput('');
  };

  const handleUpdateFirstApprentice = (name: string) => {
    setApprenticeNames((prev) => {
      const copy = [...prev];
      copy[0] = name;
      return copy;
    });
  };

  const handleRemoveApprentice = (index: number) => {
    if (apprenticeNames.length <= 1) return;
    setApprenticeNames((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSaveEvaluation = () => {
    const cleanNames = apprenticeNames.map((n) => n.trim()).filter(Boolean);
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newEntry: EvaluatedSubmission = {
      id: `sub-${Date.now()}`,
      apprenticeNames: cleanNames.length > 0 ? cleanNames : ['Aprendiz SENA'],
      fichaNumber: fichaNumber.trim() || '522309',
      evidenceCode: currentEvidence.code,
      criterionScores: { ...criterionScores },
      finalScore,
      approved: isApproved,
      customObservation,
      generatedComment,
      evaluatedAt: timestamp,
    };

    setSubmissions((prev) => [newEntry, ...prev]);
    setSelectedSubmissionId(newEntry.id);
    setIsDictamenSelected(true);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleLoadSubmissionIntoEditor = (sub: EvaluatedSubmission) => {
    setSelectedSubmissionId(sub.id);
    setIsDictamenSelected(true);
    setHasClickedEvidence(true);
    setSelectedEvidenceCode(sub.evidenceCode);
    setApprenticeNames(sub.apprenticeNames);
    setFichaNumber(sub.fichaNumber);
    setCriterionScores((prev) => ({ ...prev, ...sub.criterionScores }));
    setCustomObservation(sub.customObservation);
    setActiveTab('evaluador');
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleExportRosterCSV = () => {
    const headers = [
      'Fecha',
      'Ficha',
      'Aprendices',
      'Codigo_Evidencia',
      'Instrumento',
      'Calificacion_1_a_100',
      'Juicio_SENA',
      'Estado_Criterios',
      'Comentario_AVA',
    ];
    const rows = submissions.map((s) => {
      const ev = EVIDENCES_GA2.find((e) => e.code === s.evidenceCode) || EVIDENCES_GA2[0];
      return [
        `"${s.evaluatedAt}"`,
        `"${s.fichaNumber}"`,
        `"${s.apprenticeNames.join(', ')}"`,
        `"${s.evidenceCode}"`,
        `"${ev.instrumentCode}"`,
        s.finalScore,
        s.approved ? '"A"' : '"D"',
        s.approved ? '"APROBADO"' : '"NO APROBADO"',
        `"${s.generatedComment.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      ];
    });
    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `Calificaciones_SENA_GA2_Ficha_${fichaNumber || '522309'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Roster
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      if (rosterFilterStatus === 'APROBADO' && !s.approved) return false;
      if (rosterFilterStatus === 'NO_APROBADO' && s.approved) return false;
      if (rosterFilterEvidence !== 'TODAS' && s.evidenceCode !== rosterFilterEvidence) return false;
      if (rosterSearch.trim().length > 0) {
        const q = rosterSearch.toLowerCase();
        const matchName = s.apprenticeNames.some((n) => n.toLowerCase().includes(q));
        const matchEv = s.evidenceCode.toLowerCase().includes(q);
        const matchFicha = s.fichaNumber.toLowerCase().includes(q);
        return matchName || matchEv || matchFicha;
      }
      return true;
    });
  }, [submissions, rosterFilterStatus, rosterFilterEvidence, rosterSearch]);

  const approvedList = useMemo(() => submissions.filter((s) => s.approved), [submissions]);
  const rejectedList = useMemo(() => submissions.filter((s) => !s.approved), [submissions]);

  // Unique list of full apprentice names across all evaluations
  const uniqueApprenticeNames = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach((s) => {
      s.apprenticeNames.forEach((name) => {
        const clean = name.trim();
        if (clean) set.add(clean);
      });
    });
    return Array.from(set);
  }, [submissions]);

  // All 4 evidences evaluated for the selected apprentice in the top roster
  const selectedApprenticeFourEvidences = useMemo(() => {
    if (!selectedRosterApprenticeName) return [];
    return EVIDENCES_GA2.map((ev) => {
      const match = submissions.find(
        (s) =>
          s.evidenceCode === ev.code &&
          s.apprenticeNames.some(
            (n) => n.trim().toLowerCase() === selectedRosterApprenticeName.trim().toLowerCase()
          )
      );
      if (match) {
        return {
          evidence: ev,
          submission: match,
          finalScore: match.finalScore,
          approved: match.approved,
        };
      }
      // Fallback if a newly added apprentice hasn't been evaluated on all 4 yet
      return {
        evidence: ev,
        submission: null,
        finalScore: 75,
        approved: true,
      };
    });
  }, [selectedRosterApprenticeName, submissions]);

  const displayNamesJoined =
    apprenticeNames.map((n) => n.trim()).filter(Boolean).join(', ') || 'Aprendiz SENA';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Top Bar Contract: 3 Exact Zones */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('evaluador');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          SENA Evaluador GA2 · 522309
        </a>

        {/* Zone 2: 4 Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <a
            href="#evaluador"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('evaluador');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              activeTab === 'evaluador' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Calificador & Rúbrica AVA
          </a>
          <a
            href="#consolidado"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('consolidado');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              activeTab === 'consolidado' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Consolidado ({submissions.length})
          </a>
          <a
            href="#guia"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('guia');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              activeTab === 'guia' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Estructura Guía 2
          </a>
          <a
            href="#extension"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('extension');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
              activeTab === 'extension' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Extensión Chrome
          </a>
        </nav>

        {/* Zone 3: 2 Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setChromeSidePanelMode((prev) => !prev)}
            title="Alternar vista de Panel Lateral de Extensión de Google Chrome"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            {chromeSidePanelMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Vista Escritorio</span>
              </>
            ) : (
              <>
                <PanelRight className="w-3.5 h-3.5" />
                <span>Modo Panel Chrome</span>
              </>
            )}
          </button>
          <button
            onClick={downloadChromeExtensionZip}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Descargar Extensión Chrome (.ZIP)</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container — adapts to Chrome Extension Side Panel mode when toggled */}
      <main
        id="top"
        className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 transition-all ${
          chromeSidePanelMode
            ? 'max-w-[500px] bg-white border-x border-slate-300 shadow-lg my-0'
            : 'max-w-[1380px] space-y-8'
        }`}
      >
        {/* Program Context Header */}
        <section className="border-b border-slate-200 pb-5 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
              <span>Programa: {PROGRAM_INFO.programName}</span>
              <span aria-hidden="true">·</span>
              <span>Código: {PROGRAM_INFO.programCode}</span>
              <span aria-hidden="true">·</span>
              <span>{PROGRAM_INFO.guideNumber}</span>
              <span aria-hidden="true">·</span>
              <span>Fase: {PROGRAM_INFO.projectPhase}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900" style={{ textWrap: 'balance' }}>
              Instrumento de Revisión, Rúbrica y Retroalimentación AVA — Guía de Aprendizaje 2
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-[82ch]">
              <strong>Proyecto:</strong> {PROGRAM_INFO.projectName} · <strong>Actividad:</strong>{' '}
              {PROGRAM_INFO.projectActivity}
            </p>
          </div>

          {/* Mobile / Quick Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start lg:self-end shrink-0">
            <button
              onClick={() => setActiveTab('evaluador')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'evaluador' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Evaluar Evidencia
            </button>
            <button
              onClick={() => setActiveTab('consolidado')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'consolidado' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semáforo Aprendices ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab('guia')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'guia' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Referencia Guía 2
            </button>
            <button
              onClick={() => setActiveTab('extension')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'extension' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extensión Chrome
            </button>
          </div>
        </section>

        {/* Listado de Aprendices con Nombres Completos (ANTES del cuadro de Aprobados y No Aprobados) */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 my-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Listado de Aprendices (Nombres Completos) — Consulta Individual de las 4 Evidencias
              </h2>
              <p className="text-xs text-slate-500">
                Haga clic sobre el nombre completo de cualquier aprendiz para desplegar inmediatamente el estado de sus cuatro (4) evidencias evaluadas.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 shrink-0">
              {uniqueApprenticeNames.length} aprendices en ficha {fichaNumber}
            </span>
          </div>

          {/* Clickable Full Names List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {uniqueApprenticeNames.map((fullName, idx) => {
              const isSelectedName = selectedRosterApprenticeName === fullName;
              return (
                <button
                  key={fullName}
                  type="button"
                  onClick={() => {
                    setSelectedRosterApprenticeName(fullName);
                    const firstSub = submissions.find((s) =>
                      s.apprenticeNames.some((n) => n.trim() === fullName)
                    );
                    if (firstSub) {
                      handleLoadSubmissionIntoEditor(firstSub);
                    } else {
                      setApprenticeNames([fullName]);
                    }
                  }}
                  className={`text-left px-3.5 py-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                    isSelectedName
                      ? 'bg-slate-100 border-black ring-1 ring-black/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`text-xs sm:text-sm truncate ${
                      isSelectedName ? 'font-black text-black' : 'font-normal text-slate-700'
                    }`}
                  >
                    {idx + 1}. {fullName}
                  </span>
                  <span
                    className={`text-[11px] font-mono ml-2 shrink-0 ${
                      isSelectedName ? 'font-black text-black' : 'text-slate-400'
                    }`}
                  >
                    4 evidencias
                  </span>
                </button>
              );
            })}
          </div>

          {/* Immediate Popup/Box showing the 4 Evaluated Evidences for the Clicked Apprentice */}
          {selectedRosterApprenticeName && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-sm font-black text-black">
                  Resultado de las 4 Evidencias Evaluadas — Aprendiz: {selectedRosterApprenticeName}
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Haga clic en cualquier evidencia para abrir su rúbrica detallada
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {selectedApprenticeFourEvidences.map(({ evidence, submission, finalScore: evScore, approved }) => (
                  <div
                    key={evidence.code}
                    onClick={() => {
                      if (submission) {
                        handleLoadSubmissionIntoEditor(submission);
                      } else {
                        setSelectedEvidenceCode(evidence.code);
                        setApprenticeNames([selectedRosterApprenticeName]);
                        setHasClickedEvidence(true);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                      approved
                        ? 'bg-emerald-50/90 border-emerald-400 hover:bg-emerald-100/80'
                        : 'bg-red-50/90 border-red-400 hover:bg-red-100/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div
                        className={`text-xs font-mono font-bold ${
                          approved ? 'text-emerald-800' : 'text-red-800'
                        }`}
                      >
                        Evidencia {evidence.code} · {evidence.instrumentCode}
                      </div>
                      <div
                        className={`text-sm font-bold leading-snug ${
                          approved ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {evidence.title}
                      </div>
                      <div
                        className={`text-xs font-extrabold tracking-wide pt-0.5 ${
                          approved ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {approved
                          ? `APROBADO — Calificación: ${evScore} / 100 puntos`
                          : `NO APROBADO — Calificación: ${evScore} / 100 puntos`}
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <img
                        src={approved ? APROBADO_FACE_DATA_URI : NO_APROBADO_FACE_DATA_URI}
                        alt={approved ? 'Carita feliz verde Aprobado' : 'Carita triste roja No Aprobado'}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-contain"
                      />
                      <span
                        className={`text-[11px] font-mono font-extrabold ${
                          approved ? 'text-emerald-800' : 'text-red-800'
                        }`}
                      >
                        {approved ? 'APROBADO' : 'NO APROBADO'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Quick Summary Strip: Approved (Green 70-100) vs Not Approved (Red 1-69) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          {/* Green Box: APROBADO (70 - 100) */}
          <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl p-4 flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-bold tracking-wide text-emerald-800">
                  APROBADO · CUMPLE CRITERIOS DE EVALUACIÓN (70 A 100 PUNTOS)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 tabular-nums">
                {approvedList.length} registro(s)
              </span>
            </div>
            <div className="text-xs text-emerald-900 space-y-1">
              {approvedList.length === 0 ? (
                <p className="text-emerald-700">Aún no hay aprendices aprobados registrados en la sesión.</p>
              ) : (
                approvedList.map((item) => {
                  const isSelected = selectedSubmissionId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSubmissionIntoEditor(item)}
                      className={`flex items-center justify-between py-1.5 border-b border-emerald-200/70 last:border-none cursor-pointer px-2 rounded transition-colors ${
                        isSelected
                          ? 'bg-emerald-200/80 ring-1 ring-black/20'
                          : 'hover:bg-emerald-100/60'
                      }`}
                    >
                      <span
                        className={
                          isSelected
                            ? 'font-black text-black tracking-tight'
                            : 'font-normal text-emerald-700'
                        }
                      >
                        APROBADO — {item.apprenticeNames.join(', ')}
                      </span>
                      <span
                        className={`font-mono tabular-nums whitespace-nowrap ml-2 ${
                          isSelected
                            ? 'font-black text-black'
                            : 'font-normal text-emerald-800'
                        }`}
                      >
                        {item.evidenceCode} · {item.finalScore}/100
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Red Box: NO APROBADO (1 - 69) */}
          <div className="bg-red-50/90 border border-red-300 rounded-xl p-4 flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span className="text-xs font-bold tracking-wide text-red-800">
                  NO APROBADO · NO CUMPLE CRITERIOS DE EVALUACIÓN (1 A 69 PUNTOS)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-red-800 tabular-nums">
                {rejectedList.length} registro(s)
              </span>
            </div>
            <div className="text-xs text-red-900 space-y-1">
              {rejectedList.length === 0 ? (
                <p className="text-red-700">No hay aprendices con estado No Aprobado en este momento.</p>
              ) : (
                rejectedList.map((item) => {
                  const isSelected = selectedSubmissionId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSubmissionIntoEditor(item)}
                      className={`flex items-center justify-between py-1.5 border-b border-red-200/70 last:border-none cursor-pointer px-2 rounded transition-colors ${
                        isSelected
                          ? 'bg-red-200/80 ring-1 ring-black/20'
                          : 'hover:bg-red-100/60'
                      }`}
                    >
                      <span
                        className={
                          isSelected
                            ? 'font-black text-black tracking-tight'
                            : 'font-normal text-red-600'
                        }
                      >
                        NO APROBADO — {item.apprenticeNames.join(', ')}
                      </span>
                      <span
                        className={`font-mono tabular-nums whitespace-nowrap ml-2 ${
                          isSelected
                            ? 'font-black text-black'
                            : 'font-normal text-red-700'
                        }`}
                      >
                        {item.evidenceCode} · {item.finalScore}/100
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* TAB 1: EVALUADOR Y RÚBRICA INTERACTIVA */}
        {activeTab === 'evaluador' && (
          <div
            className={`grid grid-cols-1 ${
              chromeSidePanelMode ? 'gap-6' : 'lg:grid-cols-12 gap-7'
            } items-start`}
          >
            {/* Left Column: Evidence Selection, Apprentice Data & Interactive Rubric */}
            <div className={`${chromeSidePanelMode ? '' : 'lg:col-span-7'} space-y-6`}>
              {/* Step 1: Select among the 4 Evidences of Guide 2 */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">
                    01. Selección de Evidencia de Aprendizaje (Guía 2)
                  </h2>
                  <span className="text-xs font-mono text-slate-500">
                    Instrumento: {currentEvidence.instrumentCode}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EVIDENCES_GA2.map((ev, index) => {
                    const active = hasClickedEvidence && ev.code === currentEvidence.code;
                    const colorStyles = [
                      {
                        // 1. Rosado muy claro -> se oscurece al pasar el cursor (hover) y al hacer clic
                        unselectedCard:
                          'bg-pink-50 hover:bg-pink-300 text-pink-950 border-pink-200 hover:border-pink-400',
                        selectedCard:
                          'bg-pink-400 hover:bg-pink-500 text-pink-950 border-pink-600 shadow-sm ring-2 ring-pink-400/50',
                        unselectedCode: 'text-pink-900 font-bold',
                        selectedCode: 'text-pink-950 font-bold',
                        unselectedType: 'text-pink-800',
                        selectedType: 'text-pink-900',
                      },
                      {
                        // 2. Verde claro -> Verde más oscuro al pasar el cursor y al seleccionar
                        unselectedCard:
                          'bg-emerald-100 hover:bg-emerald-300 text-emerald-950 border-emerald-300 hover:border-emerald-500',
                        selectedCard:
                          'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-600/40',
                        unselectedCode: 'text-emerald-900 font-bold',
                        selectedCode: 'text-emerald-100 font-bold',
                        unselectedType: 'text-emerald-800',
                        selectedType: 'text-emerald-50',
                      },
                      {
                        // 3. Azul claro -> Azul más oscuro al pasar el cursor y al seleccionar
                        unselectedCard:
                          'bg-sky-100 hover:bg-sky-300 text-sky-950 border-sky-300 hover:border-sky-500',
                        selectedCard:
                          'bg-sky-700 hover:bg-sky-800 text-white border-sky-800 shadow-sm ring-2 ring-sky-600/40',
                        unselectedCode: 'text-sky-900 font-bold',
                        selectedCode: 'text-sky-100 font-bold',
                        unselectedType: 'text-sky-800',
                        selectedType: 'text-sky-50',
                      },
                      {
                        // 4. Naranja claro -> Naranja más oscuro al pasar el cursor y al seleccionar
                        unselectedCard:
                          'bg-orange-100 hover:bg-orange-300 text-orange-950 border-orange-300 hover:border-orange-500',
                        selectedCard:
                          'bg-orange-600 hover:bg-orange-700 text-white border-orange-700 shadow-sm ring-2 ring-orange-500/40',
                        unselectedCode: 'text-orange-900 font-bold',
                        selectedCode: 'text-orange-100 font-bold',
                        unselectedType: 'text-orange-800',
                        selectedType: 'text-orange-50',
                      },
                    ][index % 4];

                    return (
                      <button
                        key={ev.code}
                        onClick={() => {
                          setSelectedEvidenceCode(ev.code);
                          setHasClickedEvidence(true);
                        }}
                        className={`text-left p-3.5 rounded-lg border transition-colors duration-150 cursor-pointer ${
                          active ? colorStyles.selectedCard : colorStyles.unselectedCard
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className={active ? colorStyles.selectedCode : colorStyles.unselectedCode}>
                            {ev.code}
                          </span>
                          <span className={active ? colorStyles.selectedType : colorStyles.unselectedType}>
                            {ev.type}
                          </span>
                        </div>
                        <div className="text-xs font-semibold line-clamp-2 leading-snug">{ev.title}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Normative Technical Metadata of the Selected Evidence */}
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div>
                    <strong className="text-slate-800">Competencia Técnica ({currentEvidence.competencyCode}):</strong>{' '}
                    {currentEvidence.competencyName}
                  </div>
                  <div>
                    <strong className="text-slate-800">Resultado de Aprendizaje ({currentEvidence.rapCode}):</strong>{' '}
                    {currentEvidence.rapName}
                  </div>
                  <div>
                    <strong className="text-slate-800">Componente Formativo Base:</strong>{' '}
                    {currentEvidence.formativeComponent} ·{' '}
                    <strong className="text-slate-800">Entregable:</strong> {currentEvidence.deliverableProduct}
                  </div>
                </div>
              </div>

              {/* Step 2: Apprentice(s) Information */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">
                    02. Datos del Aprendiz o Grupo de Trabajo
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">
                    Personalización nominal AVA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Propio del Aprendiz Principal
                    </label>
                    <input
                      type="text"
                      value={apprenticeNames[0] || ''}
                      onChange={(e) => handleUpdateFirstApprentice(e.target.value)}
                      placeholder="Ej: Valentina Morales Gómez"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Número de Ficha SENA
                    </label>
                    <input
                      type="text"
                      value={fichaNumber}
                      onChange={(e) => setFichaNumber(e.target.value)}
                      placeholder="Ej: 2874519"
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Additional Group Members (e.g. for Agency Simulation / Group Work) */}
                <div className="space-y-2">
                  <form onSubmit={handleAddApprentice} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newApprenticeInput}
                      onChange={(e) => setNewApprenticeInput(e.target.value)}
                      placeholder="Agregar otro aprendiz si la entrega es grupal (ej: Mateo Vargas Pardo)..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Añadir Integrante</span>
                    </button>
                  </form>

                  {apprenticeNames.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-500 font-semibold">Integrantes del grupo:</span>
                      {apprenticeNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-800 font-medium"
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveApprentice(idx)}
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Quitar aprendiz"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Interactive Rubric & Checklist Evaluation (1 to 100) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3.5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      03. Rúbrica y Lista de Chequeo ({currentEvidence.instrumentCode})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Califique cada criterio de 1 a 100. Puntaje mínimo aprobatorio SENA: 70 puntos.
                    </p>
                  </div>

                  {/* Quick Preset Simulation Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetAllCriteria(55)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Simular No Aprobado (55)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetAllCriteria(90)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Simular Aprobado (90)
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {currentEvidence.rubric.map((criterion, idx) => {
                    const val = criterionScores[criterion.id] ?? 85;
                    const critApproved = val >= 70;
                    return (
                      <div
                        key={criterion.id}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="text-xs font-bold text-slate-900">
                            Criterio {idx + 1}: {criterion.title}{' '}
                            <span className="font-mono font-normal text-slate-500">
                              (Peso: {criterion.weight}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                            <span
                              className={`font-bold ${
                                critApproved ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {critApproved ? 'CUMPLE' : 'NO CUMPLE'} · {val} / 100
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {criterion.description}
                        </p>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                          <input
                            type="range"
                            min={1}
                            max={100}
                            value={val}
                            onChange={(e) =>
                              handleCriterionScoreChange(criterion.id, Number(e.target.value))
                            }
                            aria-label={criterion.title}
                            className="flex-1 accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg"
                          />

                          {/* Quick Level Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {[
                              { label: 'Deficiente (45)', score: 45 },
                              { label: 'Básico (65)', score: 65 },
                              { label: 'Cumple (80)', score: 80 },
                              { label: 'Excelente (100)', score: 100 },
                            ].map((preset) => (
                              <button
                                key={preset.score}
                                type="button"
                                onClick={() =>
                                  handleCriterionScoreChange(criterion.id, preset.score)
                                }
                                className={`px-2 py-1 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                                  Math.abs(val - preset.score) <= 3
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {preset.score}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-slate-500">
                          Referencia curricular: {criterion.guideReference}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Instructor Note */}
                <div className="pt-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Observación Específica Adicional del Instructor (Opcional — se integra al comentario AVA):
                  </label>
                  <textarea
                    rows={2}
                    value={customObservation}
                    onChange={(e) => setCustomObservation(e.target.value)}
                    placeholder="Ej: Destaco el uso de retícula modular en la portada de la campaña Vento; recuerda adjuntar las fuentes tipográficas o convertir texto a curvas..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Official Status Banner (Red 1-69 / Green 70-100) + Personalized AVA Feedback */}
            <div className={`${chromeSidePanelMode ? '' : 'lg:col-span-5'} space-y-6 sticky top-20`}>
              {/* OFFICIAL STATUS CARD: RED (1-69 NO APROBADO) OR GREEN (70-100 APROBADO) */}
              <div
                className={`rounded-xl p-5 border-2 transition-colors space-y-3 ${
                  isApproved
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-red-50 border-red-500 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold opacity-80">
                    Dictamen Oficial de Evaluación (Escala 1 a 100)
                  </span>
                  <span className="font-mono text-xs font-bold">
                    {currentEvidence.instrumentCode}
                  </span>
                </div>

                {/* Dynamic Color-Coded Apprentice Name(s) & Status Phrase — turns black & bold when selected */}
                <div
                  onClick={() => setIsDictamenSelected((prev) => !prev)}
                  title="Haga clic para resaltar en color negro y negrilla el aprendiz y su estado"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 cursor-pointer select-none"
                >
                  <div className="space-y-1.5">
                    <div
                      className={`text-xl sm:text-2xl tracking-tight flex items-center gap-3 ${
                        isDictamenSelected
                          ? 'font-black text-black'
                          : isApproved
                          ? 'font-semibold text-emerald-700'
                          : 'font-semibold text-red-700'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <span>APROBADO</span>
                          <img
                            src={APROBADO_FACE_DATA_URI}
                            alt="Aprobado"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-contain shrink-0"
                          />
                        </>
                      ) : (
                        <>
                          <span>NO APROBADO</span>
                          <img
                            src={NO_APROBADO_FACE_DATA_URI}
                            alt="No Aprobado"
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 object-contain shrink-0"
                          />
                        </>
                      )}
                    </div>
                    <div
                      className={`text-base leading-snug ${
                        isDictamenSelected
                          ? 'font-black text-black'
                          : isApproved
                          ? 'font-medium text-emerald-800'
                          : 'font-medium text-red-700'
                      }`}
                    >
                      Aprendiz(ces): {displayNamesJoined}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div
                      className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums ${
                        isApproved ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {finalScore} <span className="text-base font-normal">/ 100</span>
                    </div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        isApproved ? 'text-emerald-800' : 'text-red-800'
                      }`}
                    >
                      {isApproved
                        ? 'Rango 70–100 · Juicio SENA: A'
                        : 'Rango 1–69 · Juicio SENA: D'}
                    </div>
                  </div>
                </div>

                <p
                  className={`text-xs pt-2 border-t ${
                    isApproved
                      ? 'border-emerald-200 text-emerald-900'
                      : 'border-red-200 text-red-900'
                  }`}
                >
                  {isApproved
                    ? `Cumple con los criterios de evaluación establecidos en la Guía de Aprendizaje 2 para la evidencia ${currentEvidence.code}.`
                    : `No alcanza el puntaje mínimo aprobatorio (70/100). Requiere plan de mejora y nuevo envío atendiendo las recomendaciones AVA.`}
                </p>
              </div>

              {/* AVA Feedback Generator Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      04. Comentario Pedagógico AVA para el Aprendiz
                    </h2>
                    <p className="text-xs text-slate-500">
                      Incluye nombre propio, reconocimiento al esfuerzo y mejoras según Guía AVA.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Firma del Instructor Virtual SENA:
                  </label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Texto listo para Zajuna / Territorium SENA:
                    </span>
                    <span className="font-mono text-slate-500">
                      {generatedComment.split(/\s+/).length} palabras
                    </span>
                  </div>
                  <textarea
                    readOnly
                    rows={13}
                    value={generatedComment}
                    className="w-full p-3.5 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-sans focus:outline-none"
                  />
                </div>

                {/* Action Buttons: Copy AVA Comment & Save to Gradebook */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy('ava-comment', generatedComment)}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === 'ava-comment' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>¡Comentario AVA Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Retroalimentación AVA</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEvaluation}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      isApproved
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-red-700 hover:bg-red-800 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar Calificación ({finalScore}/100)</span>
                  </button>
                </div>

                {savedBanner && (
                  <div className="p-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    Calificación registrada en el Consolidado de Aprendices.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONSOLIDADO DE APRENDICES (VERDE APROBADO 70-100 / ROJO NO APROBADO 1-69) */}
        {activeTab === 'consolidado' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Consolidado de Calificaciones y Estado de Aprobación (Ficha {fichaNumber})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Visualización cromática normativa: <strong className="text-emerald-700">VERDE (APROBADO: 70 a 100)</strong> y{' '}
                    <strong className="text-red-700">ROJO (NO APROBADO: 1 a 69)</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleExportRosterCSV}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Planilla CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setRosterFilterStatus('TODOS')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      rosterFilterStatus === 'TODOS'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({submissions.length})
                  </button>
                  <button
                    onClick={() => setRosterFilterStatus('APROBADO')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      rosterFilterStatus === 'APROBADO'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    APROBADO 70–100 ({approvedList.length})
                  </button>
                  <button
                    onClick={() => setRosterFilterStatus('NO_APROBADO')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      rosterFilterStatus === 'NO_APROBADO'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-red-800 hover:bg-red-50'
                    }`}
                  >
                    NO APROBADO 1–69 ({rejectedList.length})
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={rosterFilterEvidence}
                    onChange={(e) => setRosterFilterEvidence(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="TODAS">Todas las Evidencias (4)</option>
                    {EVIDENCES_GA2.map((ev) => (
                      <option key={ev.code} value={ev.code}>
                        {ev.code} — {ev.shortCode}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Buscar aprendiz o evidencia..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 w-56"
                    />
                  </div>
                </div>
              </div>

              {/* High-Density Gradebook Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Estado y Nombre(s) del Aprendiz</th>
                      <th className="py-3 px-4">Ficha</th>
                      <th className="py-3 px-4">Evidencia / Instrumento</th>
                      <th className="py-3 px-4 text-right">Calificación (1–100)</th>
                      <th className="py-3 px-4">Extracto de Retroalimentación AVA</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredSubmissions.map((sub) => {
                      const ev =
                        EVIDENCES_GA2.find((e) => e.code === sub.evidenceCode) || EVIDENCES_GA2[0];
                      const isRowSelected = selectedSubmissionId === sub.id;
                      return (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedSubmissionId(sub.id)}
                          className={`transition-colors cursor-pointer ${
                            isRowSelected ? 'bg-slate-100' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4 align-top">
                            {sub.approved ? (
                              <div className="space-y-0.5">
                                <div
                                  className={`flex items-center gap-1.5 ${
                                    isRowSelected
                                      ? 'font-black text-black text-sm'
                                      : 'font-normal text-emerald-700'
                                  }`}
                                >
                                  <CheckCircle2
                                    className={`w-4 h-4 shrink-0 ${
                                      isRowSelected ? 'text-black' : 'text-emerald-600'
                                    }`}
                                  />
                                  <span>APROBADO — {sub.apprenticeNames.join(', ')}</span>
                                </div>
                                <div
                                  className={`text-[11px] font-mono ${
                                    isRowSelected ? 'font-bold text-black' : 'text-emerald-800'
                                  }`}
                                >
                                  Cumple criterios de evaluación · {sub.evaluatedAt}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div
                                  className={`flex items-center gap-1.5 ${
                                    isRowSelected
                                      ? 'font-black text-black text-sm'
                                      : 'font-normal text-red-600'
                                  }`}
                                >
                                  <XCircle
                                    className={`w-4 h-4 shrink-0 ${
                                      isRowSelected ? 'text-black' : 'text-red-600'
                                    }`}
                                  />
                                  <span>NO APROBADO — {sub.apprenticeNames.join(', ')}</span>
                                </div>
                                <div
                                  className={`text-[11px] font-mono ${
                                    isRowSelected ? 'font-bold text-black' : 'text-red-800'
                                  }`}
                                >
                                  No cumple criterios de evaluación · {sub.evaluatedAt}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 align-top">
                            {sub.fichaNumber}
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="font-mono font-semibold text-slate-900">
                              {sub.evidenceCode}
                            </div>
                            <div className="text-slate-500">{ev.title}</div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono tabular-nums align-top whitespace-nowrap">
                            <span
                              className={`text-sm font-extrabold ${
                                sub.approved ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {sub.finalScore} / 100
                            </span>
                            <div className="text-[11px] text-slate-500">
                              Juicio: {sub.approved ? 'A (Aprobado)' : 'D (No Aprobado)'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 max-w-md align-top">
                            <p className="line-clamp-2 leading-relaxed">{sub.generatedComment}</p>
                          </td>

                          <td className="py-3.5 px-4 text-right align-top whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopy(sub.id, sub.generatedComment)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              >
                                {copiedId === sub.id ? 'Copiado' : 'Copiar AVA'}
                              </button>
                              <button
                                onClick={() => handleLoadSubmissionIntoEditor(sub)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(sub.id)}
                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: REFERENCIA TÉCNICA DE LA GUÍA DE APRENDIZAJE 2 */}
        {activeTab === 'guia' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-700" />
                  <span>Matriz Curricular Oficial — Guía de Aprendizaje 2 (Programa 522309)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Referencia completa extraída del formato GFPI-F-135 V01 para verificación de competencias, RAPs, criterios e instrumentos de evaluación.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {EVIDENCES_GA2.map((ev) => (
                  <div
                    key={ev.code}
                    className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 bg-slate-50/40"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                        <span className="font-bold text-slate-900">{ev.code}</span>
                        <span>{ev.type} · {ev.instrumentCode}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{ev.title}</h3>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <strong>Competencia ({ev.competencyCode}):</strong> {ev.competencyName}
                        </p>
                        <p>
                          <strong>Resultado de Aprendizaje ({ev.rapCode}):</strong> {ev.rapName}
                        </p>
                        <p>
                          <strong>Criterios de Evaluación:</strong>{' '}
                          {ev.evaluationCriteriaSummary.join(' · ')}
                        </p>
                        <p>
                          <strong>Producto a Entregar:</strong> {ev.deliverableProduct} (
                          {ev.deliverableFormat})
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">
                        {ev.rubric.length} criterios ponderados (100 pts)
                      </span>
                      <button
                        onClick={() => {
                          setSelectedEvidenceCode(ev.code);
                          setActiveTab('evaluador');
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Calificar esta Evidencia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: EXTENSIÓN DE GOOGLE CHROME (MANIFEST V3) */}
        {activeTab === 'extension' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    Paquete Ejecutable para Extensión de Google Chrome (Manifest V3)
                  </h2>
                  <p className="text-xs text-slate-600 max-w-3xl">
                    Descargue el paquete completo <code className="font-mono">.ZIP</code> listo para instalar en Google Chrome o active el{' '}
                    <strong>Modo Panel Chrome</strong> en la barra superior. Incluye inyección directa de comentarios en la plataforma LMS SENA (Zajuna / Territorium).
                  </p>
                </div>

                <button
                  onClick={downloadChromeExtensionZip}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 self-start md:self-center whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar SENA_Evaluador_GA2_Chrome_Extension.zip</span>
                </button>
              </div>

              {/* 4-Step Installation Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: 'Paso 1',
                    title: 'Descargar y Descomprimir',
                    desc: 'Haga clic en el botón superior para descargar el archivo .ZIP y descomprímalo en una carpeta local de su equipo.',
                  },
                  {
                    step: 'Paso 2',
                    title: 'Abrir chrome://extensions',
                    desc: 'En el navegador Google Chrome, ingrese a chrome://extensions/ y active el interruptor "Modo de desarrollador" arriba a la derecha.',
                  },
                  {
                    step: 'Paso 3',
                    title: 'Cargar Descomprimida',
                    desc: 'Pulse el botón "Cargar descomprimida" (Load unpacked) y seleccione la carpeta extraída con el manifest.json.',
                  },
                  {
                    step: 'Paso 4',
                    title: 'Calificar sobre Zajuna / LMS',
                    desc: 'Abra la extensión desde la barra de Chrome mientras revisa evidencias y pulse "Insertar en LMS SENA" o "Copiar Comentario AVA".',
                  },
                ].map((item) => (
                  <div key={item.step} className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1.5">
                    <div className="text-xs font-mono font-bold text-slate-500">{item.step}</div>
                    <div className="text-sm font-bold text-slate-900">{item.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Inspector of Chrome Extension Source Files */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {extensionFiles.map((f) => (
                      <button
                        key={f.filename}
                        onClick={() => setSelectedExtFile(f.filename)}
                        className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
                          selectedExtFile === f.filename
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.filename}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const found = extensionFiles.find((f) => f.filename === selectedExtFile);
                      if (found) handleCopy(`ext-${found.filename}`, found.content);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>
                      {copiedId === `ext-${selectedExtFile}`
                        ? 'Archivo Copiado'
                        : `Copiar ${selectedExtFile}`}
                    </span>
                  </button>
                </div>

                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
                  {extensionFiles.find((f) => f.filename === selectedExtFile)?.content}
                </pre>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            SENA — Servicio Nacional de Aprendizaje · Programa 522309: Desarrollo de Medios Gráficos Visuales
          </span>
          <span className="font-mono">
            Guía de Aprendizaje 2 · Escala 1–100 (Rojo: 1–69 No Aprobado · Verde: 70–100 Aprobado)
          </span>
        </div>
      </footer>
    </div>
  );
}
