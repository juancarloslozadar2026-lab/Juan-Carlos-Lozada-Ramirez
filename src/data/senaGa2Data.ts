export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  weight: number; // Percentage weight summing to 100
  guideReference: string;
  strengthFeedback: string;
  improvementFeedback: string;
}

export interface EvidenceDefinition {
  code: string;
  shortCode: string;
  title: string;
  type: 'Evidencia de conocimiento' | 'Evidencia de producto';
  instrumentCode: string;
  competencyCode: string;
  competencyName: string;
  rapCode: string;
  rapName: string;
  evaluationCriteriaSummary: string[];
  formativeComponent: string;
  deliverableProduct: string;
  deliverableFormat: string;
  deliverableExtension: string;
  rubric: RubricCriterion[];
}

export interface EvaluatedSubmission {
  id: string;
  apprenticeNames: string[]; // Supports 1 or multiple apprentices
  fichaNumber: string;
  evidenceCode: string;
  criterionScores: Record<string, number>; // 1 to 100 per criterion
  finalScore: number; // 1 to 100
  approved: boolean; // >= 70 is APROBADO (green), 1-69 is NO APROBADO (red)
  customObservation: string;
  generatedComment: string;
  evaluatedAt: string;
}

export const PROGRAM_INFO = {
  programName: 'Desarrollo de Medios Gráficos Visuales',
  programCode: '522309',
  guideNumber: 'Guía de Aprendizaje 2 (GFPI-F-135 V01)',
  projectPhase: 'Identificar necesidades',
  projectName:
    'Desarrollo de una estrategia de comunicación gráfica fundamentada en las necesidades del cliente.',
  projectActivity:
    'Definir la estrategia creativa a partir de los recursos técnicos y gráficos para plantear las piezas de comunicación gráfica.',
  totalDuration: '328 horas (136 horas técnicas · 192 horas claves)',
};

export const EVIDENCES_GA2: EvidenceDefinition[] = [
  {
    code: 'GA2-291301081-AA1-EV01',
    shortCode: 'AA1-EV01',
    title: 'Cuadro comparativo Libros, e-magazine, presentaciones, catálogos, e-card',
    type: 'Evidencia de conocimiento',
    instrumentCode: 'IE-GA2-291301081-AA1-EV01',
    competencyCode: '291301081',
    competencyName:
      'Elaborar productos editoriales multimedia según el acuerdo editorial y parámetros técnicos.',
    rapCode: '291301081-01',
    rapName:
      'Determinar recursos y procedimientos necesarios en el desarrollo de la publicación digital.',
    evaluationCriteriaSummary: [
      'Organiza los elementos interactivos de la publicación digital según formato de salida.',
    ],
    formativeComponent: 'Conceptualización y metodologías epub',
    deliverableProduct:
      'Dos cuadros comparativos: (1) Evolución del libro y (2) Diferencia entre publicaciones digitales y físicas.',
    deliverableFormat:
      'Documento de texto (PDF) o imagen (JPG o PNG), un archivo o apartado estructurado por cada cuadro comparativo.',
    deliverableExtension: 'Mínimo cuatro (4) elementos para realizar la comparación en cada clase.',
    rubric: [
      {
        id: 'ev1-c1',
        title: 'Cuadro Comparativo 1: Evolución histórica del libro y exponentes',
        description:
          'Describe con precisión fechas, contexto histórico, mayores exponentes y aportes, características de la época, del proceso y elementos de trabajo.',
        weight: 30,
        guideReference: 'Literal a — Cuadro Comparativo 1: "Evolución del libro" (Guía 2, pág. 4)',
        strengthFeedback:
          'estructuraste con rigor cronológico el cuadro de evolución del libro, identificando fechas, contexto histórico, exponentes, procesos y materiales de soporte',
        improvementFeedback:
          'profundizar en el Cuadro Comparativo 1 ("Evolución del libro"), especificando las fechas exactas, contexto histórico, mayores exponentes, características del proceso y los materiales o elementos con los que trabajaban en cada época',
      },
      {
        id: 'ev1-c2',
        title: 'Cuadro Comparativo 2: Atributos de publicaciones digitales vs. físicas (mín. 4 productos)',
        description:
          'Describe atributos y propiedades de ambas clases e incluye mínimo 4 productos de cada una (libros, e-magazine, presentaciones, catálogos, e-card) con sus atributos principales.',
        weight: 35,
        guideReference:
          'Literal b — Cuadro Comparativo 2: "Diferencia entre publicaciones digitales y físicas" (Guía 2, pág. 4)',
        strengthFeedback:
          'caracterizaste apropiadamente los atributos y propiedades de al menos cuatro productos editoriales digitales y físicos (libros, e-magazine, presentaciones, catálogos y e-card)',
        improvementFeedback:
          'completar el Cuadro Comparativo 2 incluyendo como mínimo cuatro (4) productos digitales y cuatro (4) físicos (libros, e-magazine, presentaciones, catálogos, e-card) detallando sus atributos y propiedades técnicas según formato de salida',
      },
      {
        id: 'ev1-c3',
        title: 'Análisis de diferencias, ventajas, desventajas y elementos interactivos',
        description:
          'Establece claramente las diferencias, ventajas y desventajas entre medios impresos y digitales, organizando los elementos interactivos según formato de salida.',
        weight: 20,
        guideReference: 'Criterio de evaluación IE-GA2-291301081-AA1-EV01',
        strengthFeedback:
          'estableciste con claridad analítica las diferencias, ventajas, desventajas y el rol de los elementos interactivos según el formato de salida',
        improvementFeedback:
          'ampliar la contrastación de ventajas, desventajas y diferencias operativas entre publicaciones físicas y digitales, enfatizando cómo se organizan los elementos interactivos según el formato de salida',
      },
      {
        id: 'ev1-c4',
        title: 'Cumplimiento de lineamientos técnicos de entrega, redacción y formato',
        description:
          'Entrega en formato solicitado (PDF, JPG o PNG), aplica normas ortográficas, jerarquía visual y fundamentación en el componente "Conceptualización y metodologías epub".',
        weight: 15,
        guideReference: 'Lineamientos generales de entrega GA2-291301081-AA1-EV01',
        strengthFeedback:
          'cumpliste cabalmente con los lineamientos de formato (PDF/JPG/PNG), orden visual y apropiación del componente formativo "Conceptualización y metodologías epub"',
        improvementFeedback:
          'cuidar la presentación gráfica, ortografía y entrega completa de ambos cuadros en formato PDF, JPG o PNG conforme a los lineamientos del componente "Conceptualización y metodologías epub"',
      },
    ],
  },
  {
    code: 'GA2-291301081-AA2-EV01',
    shortCode: 'AA2-EV01',
    title: 'Diagrama de flujo medios de salida',
    type: 'Evidencia de conocimiento',
    instrumentCode: 'IE-GA2-291301081-AA2-EV01',
    competencyCode: '291301081',
    competencyName:
      'Elaborar productos editoriales multimedia según el acuerdo editorial y parámetros técnicos.',
    rapCode: '291301081-01',
    rapName:
      'Determinar recursos y procedimientos necesarios en el desarrollo de la publicación digital.',
    evaluationCriteriaSummary: [
      'Organiza los elementos interactivos de la publicación digital según formato de salida.',
    ],
    formativeComponent: 'Conceptualización y metodologías epub',
    deliverableProduct:
      'Diagrama de flujo de todos los medios de salida relacionando productos editoriales digitales, procesos y características.',
    deliverableFormat: 'PDF o el software de su preferencia.',
    deliverableExtension: 'Libre.',
    rubric: [
      {
        id: 'ev2-c1',
        title: 'Relación de productos editoriales digitales y sus principales medios de salida',
        description:
          'Identifica y articula todos los medios de salida vinculando los diferentes productos editoriales digitales (ePub, PDF interactivo, web, app, etc.).',
        weight: 35,
        guideReference: 'Descripción de evidencia GA2-291301081-AA2-EV01 (Guía 2, pág. 4)',
        strengthFeedback:
          'relacionaste de forma integral los productos editoriales digitales con sus respectivos medios y formatos de salida',
        improvementFeedback:
          'incluir y articular la totalidad de los productos editoriales digitales con sus principales medios de salida conforme al componente formativo "Conceptualización y metodologías epub"',
      },
      {
        id: 'ev2-c2',
        title: 'Secuencia lógica de procesos y características técnicas de cada medio',
        description:
          'Detalla los procesos de producción, exportación y las características técnicas propias de cada formato de salida.',
        weight: 35,
        guideReference: 'Criterio de evaluación IE-GA2-291301081-AA2-EV01',
        strengthFeedback:
          'describiste acertadamente los procesos técnicos y las características específicas de cada formato de publicación online',
        improvementFeedback:
          'detallar las fases del proceso técnico y las características particulares de cada medio de salida, explicando cómo se organizan sus elementos interactivos',
      },
      {
        id: 'ev2-c3',
        title: 'Simbología de diagramación de flujo, conectores y jerarquía visual',
        description:
          'Utiliza correctamente nodos, conectores direccionales y jerarquía informativa propia de un diagrama de flujo legible en formato PDF o software especializado.',
        weight: 30,
        guideReference: 'Lineamientos generales de entrega GA2-291301081-AA2-EV01 (Guía 2, pág. 5)',
        strengthFeedback:
          'aplicaste una estructura de diagrama de flujo limpia, con conectores lógicos claros y excelente legibilidad gráfica',
        improvementFeedback:
          'emplear convenciones claras de diagrama de flujo (nodos de inicio/proceso/decisión y flechas direccionales) para que la lectura secuencial de los medios de salida sea inequívoca',
      },
    ],
  },
  {
    code: 'GA2-291301081-AA2-EV02',
    shortCode: 'AA2-EV02',
    title: 'Diseño de introducción a un contenido editorial (Caso Agencia "Vento")',
    type: 'Evidencia de producto',
    instrumentCode: 'IE-GA2-291301081-AA2-EV02',
    competencyCode: '291301081',
    competencyName:
      'Elaborar productos editoriales multimedia según el acuerdo editorial y parámetros técnicos.',
    rapCode: '291301081-02',
    rapName:
      'Elaborar prototipo de diseño e interacción de acuerdo con el proyecto editorial.',
    evaluationCriteriaSummary: [
      'Organiza los elementos interactivos de la publicación digital según formato de salida.',
    ],
    formativeComponent: 'Conceptualización y metodologías epub',
    deliverableProduct:
      'Diseño de maquetación de un elemento editorial interactivo para campaña digital de la agencia "Vento".',
    deliverableFormat: 'Formato a elección donde contenga la diagramación del elemento.',
    deliverableExtension: 'Libre.',
    rubric: [
      {
        id: 'ev3-c1',
        title: 'Maquetación basada en retícula y armonía entre fotografía y texto',
        description:
          'Construye la diagramación sobre una retícula clara, logrando equilibrio visual entre las fotografías protagonistas y los bloques tipográficos.',
        weight: 30,
        guideReference: 'Caso Agencia "Vento" — Maquetación y retícula editorial (Guía 2, pág. 5)',
        strengthFeedback:
          'aplicaste una retícula compositiva sólida que armoniza las fotografías con la jerarquía tipográfica de la pieza editorial',
        improvementFeedback:
          'estructurar la maquetación sobre una retícula editorial definida que garantice equilibrio, márgenes consistentes y armonía entre las fotografías y el texto',
      },
      {
        id: 'ev3-c2',
        title: 'Creatividad, innovación, desarrollo de la idea y efectividad comunicativa',
        description:
          'Responde al brief de la agencia "Vento" (lanzamiento, mantenimiento o reactivación de producto) con pertinencia conceptual e innovación gráfica.',
        weight: 35,
        guideReference: 'Parámetros conceptuales Agencia "Vento" (Guía 2, pág. 5)',
        strengthFeedback:
          'desarrollaste una propuesta creativa, innovadora y comunicativamente efectiva para la campaña digital solicitada por la agencia "Vento"',
        improvementFeedback:
          'fortalecer el desarrollo conceptual de la campaña para la agencia "Vento", asegurando mayor innovación en la diagramación, pertinencia gráfica y efectividad en el mensaje del producto elegido',
      },
      {
        id: 'ev3-c3',
        title: 'Organización de elementos editoriales interactivos según formato de salida',
        description:
          'Integra y dispone funcionalmente los elementos interactivos (botones, navegación, enlaces o disparadores multimedia) acordes al formato digital elegido.',
        weight: 35,
        guideReference: 'Criterio de evaluación IE-GA2-291301081-AA2-EV02',
        strengthFeedback:
          'organizaste coherentemente los elementos interactivos de la publicación digital de acuerdo con el formato de salida seleccionado',
        improvementFeedback:
          'incorporar y señalizar claramente los elementos editoriales interactivos (controles de navegación, hipervínculos o recursos multimedia) organizados según las especificaciones del formato de salida',
      },
    ],
  },
  {
    code: 'GA2-291301083-AA1-EV01',
    shortCode: '291301083-EV01',
    title: 'Taller dispositivos de captura (Fase 1 Conceptual y Fase 2 Sesión Fotográfica)',
    type: 'Evidencia de conocimiento',
    instrumentCode: 'IE-GA2-291301083-AA1-EV01',
    competencyCode: '291301083',
    competencyName:
      'Editar imágenes de acuerdo con los criterios de comunicación y técnicas de edición.',
    rapCode: '291301083-01',
    rapName:
      'Alistar dispositivos de captura y materiales de ilustración, según especificaciones técnicas del diseño.',
    evaluationCriteriaSummary: [
      'Alista equipos de producción de imagen según los requerimientos del proyecto y manual de funcionamiento.',
      'Aplica gestión de color en dispositivos de captura y salida a partir de la normatividad técnica.',
      'Preparar el escenario y la iluminación de la producción fotográfica teniendo en cuenta los requerimientos del proyecto.',
    ],
    formativeComponent: 'Imagen y captura',
    deliverableProduct:
      'Taller completo con Fase 1 (5 preguntas de producción fotográfica) y Fase 2 (campaña publicitaria con mínimo 4 de las 5 tipologías fotográficas).',
    deliverableFormat:
      'Formato a elección que contenga el desarrollo de ambas fases incluyendo los formatos de imagen.',
    deliverableExtension: 'Libre.',
    rubric: [
      {
        id: 'ev4-c1',
        title: 'Fase 1: Conceptualización de producción fotográfica, logística y etapas',
        description:
          'Responde las 5 preguntas orientadoras: qué es y para qué sirve la producción fotográfica, integrantes, componentes, planificación/logística y etapas (preproducción, producción y postproducción).',
        weight: 25,
        guideReference: 'Fase 1 — Cuestionario de captura y producción fotográfica (Guía 2, pág. 7)',
        strengthFeedback:
          'diste respuesta fundamentada a los cinco interrogantes de la Fase 1 sobre integrantes, componentes, logística y etapas de la producción fotográfica',
        improvementFeedback:
          'completar con mayor profundidad conceptual las cinco preguntas de la Fase 1 (definición de producción fotográfica, integrantes, componentes, logística y la importancia de la preproducción, producción y postproducción)',
      },
      {
        id: 'ev4-c2',
        title: 'Fase 2 (Criterio 1): Alistamiento de equipos de captura y gestión de color',
        description:
          'Alista los equipos de producción de imagen según requerimientos del cliente y aplica gestión de color en dispositivos de captura y salida atendiendo la normatividad técnica.',
        weight: 25,
        guideReference: 'Fase 2 numerales 1 y 2 · Criterios IE-GA2-291301083-AA1-EV01',
        strengthFeedback:
          'documentaste correctamente el alistamiento de los dispositivos de captura y la aplicación de perfiles y gestión de color en entrada y salida bajo normatividad técnica',
        improvementFeedback:
          'especificar técnicamente el alistamiento de los equipos de captura y detallar cómo aplicaste la gestión de color (perfiles ICC, balance de blancos, espacio RGB/CMYK) entre captura y salida según la normatividad técnica',
      },
      {
        id: 'ev4-c3',
        title: 'Fase 2 (Criterio 2): Preparación del escenario, esquema de iluminación y eje de campaña',
        description:
          'Prepara el escenario y la iluminación para la sesión fotográfica manteniendo un mismo eje temático de campaña para el producto y marca del cliente.',
        weight: 25,
        guideReference: 'Fase 2 numeral 3 · Criterio de iluminación IE-GA2-291301083-AA1-EV01',
        strengthFeedback:
          'preparaste acertadamente el escenario y el esquema de iluminación manteniendo un eje temático unificado de campaña publicitaria',
        improvementFeedback:
          'sustentar la preparación del escenario y el esquema de iluminación utilizado, articulando todas las tomas bajo un mismo eje temático y concepto de campaña para el producto del cliente',
      },
      {
        id: 'ev4-c4',
        title: 'Fase 2 (Criterio 3): Mínimo 4 tipologías fotográficas y sustentación de planos/encuadres',
        description:
          'Incluye mínimo 4 de las 5 fotografías solicitadas (retrato, pintar con luces, urbana, moda, producto) sustentando procesos, planos, ángulos, encuadres y formatos de imagen.',
        weight: 25,
        guideReference: 'Fase 2 — Repertorio de fotografías y sustentación técnica (Guía 2, págs. 7-8)',
        strengthFeedback:
          'entregaste las tipologías fotográficas requeridas (mínimo 4 de 5: retrato, pintar con luces, urbana, moda, producto) sustentando procesos, planos y encuadres',
        improvementFeedback:
          'incluir como mínimo cuatro (4) de las cinco tipologías solicitadas (retrato, pintar con luces, urbana, moda, producto) y anexar la sustentación técnica de procesos, planos, encuadres y formatos de imagen',
      },
    ],
  },
];

export function buildAvaFeedbackComment(params: {
  apprenticeNames: string[];
  evidence: EvidenceDefinition;
  criterionScores: Record<string, number>;
  finalScore: number;
  customObservation?: string;
  instructorName: string;
}): string {
  const {
    apprenticeNames,
    evidence,
    criterionScores,
    finalScore,
    customObservation,
    instructorName,
  } = params;

  const cleanNames =
    apprenticeNames.filter((n) => n.trim().length > 0).join(', ') || 'Aprendiz SENA';
  const isPlural = apprenticeNames.filter((n) => n.trim().length > 0).length > 1;
  const approved = finalScore >= 70;
  const statusLabel = approved ? 'APROBADO' : 'NO APROBADO';
  const senaLetter = approved ? 'A (Aprobado)' : 'D (No Aprobado - En proceso de alcance)';

  const strongCriteria = evidence.rubric.filter((c) => (criterionScores[c.id] ?? 80) >= 75);
  const weakCriteria = evidence.rubric.filter((c) => (criterionScores[c.id] ?? 80) < 75);

  const greeting = isPlural
    ? `Estimados aprendices ${cleanNames}, reciban un cordial saludo.`
    : `Estimado(a) aprendiz ${cleanNames}, recibe un cordial saludo.`;

  const effortRecognition = isPlural
    ? `En primer lugar, reconozco y valoro el esfuerzo, compromiso y trabajo colaborativo demostrado por el equipo en la elaboración y entrega de la evidencia "${evidence.code} - ${evidence.title}", correspondiente a la competencia técnica ${evidence.competencyCode} (${evidence.competencyName}) y al Resultado de Aprendizaje ${evidence.rapCode}.`
    : `En primer lugar, reconozco y valoro tu esfuerzo, dedicación y compromiso formativo en el desarrollo y envío de la evidencia "${evidence.code} - ${evidence.title}", correspondiente a la competencia técnica ${evidence.competencyCode} (${evidence.competencyName}) y al Resultado de Aprendizaje ${evidence.rapCode}.`;

  let strengthsParagraph = '';
  if (strongCriteria.length > 0) {
    const items = strongCriteria.map((c) => c.strengthFeedback).join('; asimismo, ');
    strengthsParagraph = `Destaco positivamente que en esta entrega ${items}.`;
  } else {
    strengthsParagraph = `Valoro tu iniciativa al presentar este primer avance del ejercicio práctico propuesto en la Guía de Aprendizaje 2.`;
  }

  let improvementsParagraph = '';
  if (weakCriteria.length > 0) {
    const items = weakCriteria.map((c) => c.improvementFeedback).join('; igualmente, se recomienda ');
    improvementsParagraph = `De acuerdo con los lineamientos de la Guía de Orientación AVA y el instrumento de evaluación ${evidence.instrumentCode}, para fortalecer tu competencia técnica te sugiero las siguientes acciones de mejora: ${items}. Te invito a repasar el componente formativo "${evidence.formativeComponent}" en la plataforma virtual.`;
  } else if (finalScore < 100) {
    improvementsParagraph = `Siguiendo las pautas de mejora continua de la Guía de Orientación AVA e instrumento ${evidence.instrumentCode}, te sugiero continuar profundizando en el componente formativo "${evidence.formativeComponent}" para enriquecer tu portafolio profesional con casos aplicados al sector gráfico.`;
  } else {
    improvementsParagraph = `De acuerdo con el instrumento de evaluación ${evidence.instrumentCode} y la Guía de Orientación AVA, tu entrega sobresale por su rigor conceptual, técnico y estético. Te invito a conservar este nivel de excelencia en las siguientes evidencias del proyecto formativo.`;
  }

  const customNote =
    customObservation && customObservation.trim().length > 0
      ? `\n\nObservación específica del instructor: ${customObservation.trim()}`
      : '';

  const closingGuidance = approved
    ? `Continúa avanzando con este mismo entusiasmo en tu proceso de Formación Profesional Integral SENA.`
    : `Recuerda que en el modelo pedagógico SENA cuentas con la oportunidad de ajustar tu evidencia atendiendo estas recomendaciones técnicas y realizar un nuevo envío en el espacio de la actividad "${evidence.code}" para alcanzar el logro del Resultado de Aprendizaje.`;

  return `${greeting}

${effortRecognition}

${strengthsParagraph}

${improvementsParagraph}${customNote}

Resultado de la Revisión Curricular:
• Estado de la Evidencia: ${statusLabel} (${cleanNames})
• Calificación Cuantitativa: ${finalScore} / 100 puntos — Juicio Evaluativo SENA: ${senaLetter}
• Instrumento Aplicado: Lista de chequeo ${evidence.instrumentCode}

${closingGuidance}

Atentamente,
${instructorName}
Instructor Virtual SENA — Desarrollo de Medios Gráficos Visuales (Ficha / Programa 522309)`;
}

function makeSubmission(
  id: string,
  apprenticeNames: string[],
  evidenceIndex: number,
  scores: number[],
  customObservation: string,
  evaluatedAt: string
): EvaluatedSubmission {
  const ev = EVIDENCES_GA2[evidenceIndex];
  const criterionScores: Record<string, number> = {};
  let weighted = 0;
  ev.rubric.forEach((c, idx) => {
    const val = scores[idx] ?? scores[0] ?? 80;
    criterionScores[c.id] = val;
    weighted += val * (c.weight / 100);
  });
  const finalScore = Math.max(1, Math.min(100, Math.round(weighted)));
  return {
    id,
    apprenticeNames,
    fichaNumber: '2874519',
    evidenceCode: ev.code,
    criterionScores,
    finalScore,
    approved: finalScore >= 70,
    customObservation,
    generatedComment: buildAvaFeedbackComment({
      apprenticeNames,
      evidence: ev,
      criterionScores,
      finalScore,
      customObservation,
      instructorName: 'Instructor Virtual SENA',
    }),
    evaluatedAt,
  };
}

export const INITIAL_EVALUATED_SUBMISSIONS: EvaluatedSubmission[] = [
  // 1. Valentina Morales Gómez (4 evidencias: 3 aprobadas, 1 no aprobada)
  makeSubmission(
    'sub-v-1',
    ['Valentina Morales Gómez'],
    0,
    [92, 88, 90, 95],
    'Excelente síntesis gráfica en ambos cuadros comparativos y clara diferenciación entre e-magazine, e-card y catálogo impreso.',
    '2026-10-06 08:15'
  ),
  makeSubmission(
    'sub-v-2',
    ['Valentina Morales Gómez'],
    1,
    [88, 84, 86],
    'Diagrama de flujo claro con todos los medios de salida editorial digital correctamente articulados.',
    '2026-10-06 08:30'
  ),
  makeSubmission(
    'sub-v-3',
    ['Valentina Morales Gómez'],
    2,
    [95, 92, 95],
    'Maquetación sobresaliente para la campaña de la agencia Vento con retícula modular bien definida.',
    '2026-10-06 08:45'
  ),
  makeSubmission(
    'sub-v-4',
    ['Valentina Morales Gómez'],
    3,
    [72, 60, 62, 62],
    'Buena Fase 1 conceptual, pero en la Fase 2 faltó documentar la gestión de color ICC y completar la cuarta fotografía de la campaña.',
    '2026-10-06 09:00'
  ),

  // 2. Carlos Andrés Peña Ruiz (4 evidencias: 2 aprobadas, 2 no aprobadas)
  makeSubmission(
    'sub-c-1',
    ['Carlos Andrés Peña Ruiz'],
    0,
    [80, 76, 78, 78],
    'Cumple con los dos cuadros comparativos y los cuatro productos por categoría.',
    '2026-10-06 09:10'
  ),
  makeSubmission(
    'sub-c-2',
    ['Carlos Andrés Peña Ruiz'],
    1,
    [55, 50, 62],
    'Entregaste un mapa mental general pero omitiste los procesos de exportación y las características de los medios de salida interactivos.',
    '2026-10-06 09:25'
  ),
  makeSubmission(
    'sub-c-3',
    ['Carlos Andrés Peña Ruiz'],
    2,
    [62, 64, 58],
    'Es necesario organizar los elementos interactivos de acuerdo con el formato de salida elegido para la agencia Vento.',
    '2026-10-06 09:40'
  ),
  makeSubmission(
    'sub-c-4',
    ['Carlos Andrés Peña Ruiz'],
    3,
    [84, 80, 82, 82],
    'Buen desarrollo del taller de dispositivos de captura y esquema de iluminación.',
    '2026-10-06 09:55'
  ),

  // 3. Laura Sofía Castro Restrepo (4 evidencias: 3 aprobadas, 1 no aprobada)
  makeSubmission(
    'sub-l-1',
    ['Laura Sofía Castro Restrepo'],
    0,
    [90, 86, 88, 88],
    'Apropiación destacada de la evolución del libro y atributos de publicaciones digitales.',
    '2026-10-06 10:05'
  ),
  makeSubmission(
    'sub-l-2',
    ['Laura Sofía Castro Restrepo'],
    1,
    [80, 78, 80],
    'Diagrama de flujo bien estructurado con simbología técnica adecuada.',
    '2026-10-06 10:15'
  ),
  makeSubmission(
    'sub-l-3',
    ['Laura Sofía Castro Restrepo'],
    2,
    [60, 58, 56],
    'Falta evidenciar la retícula constructiva y señalizar los botones interactivos en la pieza editorial.',
    '2026-10-06 10:25'
  ),
  makeSubmission(
    'sub-l-4',
    ['Laura Sofía Castro Restrepo'],
    3,
    [85, 80, 88, 84],
    'Muy buen trabajo de iluminación en la fotografía pintar con luces y fotografía de producto para la campaña.',
    '2026-10-06 10:35'
  ),

  // 4. Mateo Vargas Pardo (4 evidencias: 3 aprobadas, 1 no aprobada)
  makeSubmission(
    'sub-m-1',
    ['Mateo Vargas Pardo'],
    0,
    [64, 66, 65, 65],
    'En el Cuadro Comparativo 2 solo incluiste 2 productos digitales; recuerda que el lineamiento exige mínimo 4.',
    '2026-10-06 10:40'
  ),
  makeSubmission(
    'sub-m-2',
    ['Mateo Vargas Pardo'],
    1,
    [76, 75, 78],
    'Cumple con la relación de productos editoriales y sus medios de salida.',
    '2026-10-06 10:50'
  ),
  makeSubmission(
    'sub-m-3',
    ['Mateo Vargas Pardo'],
    2,
    [86, 84, 85],
    'Excelente propuesta de campaña digital para la agencia Vento con integración fotográfica.',
    '2026-10-06 11:00'
  ),
  makeSubmission(
    'sub-m-4',
    ['Mateo Vargas Pardo'],
    3,
    [85, 82, 86, 84],
    'Alistamiento de equipos y las 4 tipologías fotográficas sustentadas correctamente.',
    '2026-10-06 11:10'
  ),

  // 5. Diego Fernando Ríos Quintero (4 evidencias: 1 aprobada, 3 no aprobadas)
  makeSubmission(
    'sub-d-1',
    ['Diego Fernando Ríos Quintero'],
    0,
    [52, 50, 54, 54],
    'Solo entregaste el primer cuadro comparativo; falta el cuadro de diferencias entre publicaciones digitales y físicas.',
    '2026-10-06 11:15'
  ),
  makeSubmission(
    'sub-d-2',
    ['Diego Fernando Ríos Quintero'],
    1,
    [74, 74, 75],
    'Diagrama de flujo aprobado cumpliendo los criterios básicos del instrumento.',
    '2026-10-06 11:20'
  ),
  makeSubmission(
    'sub-d-3',
    ['Diego Fernando Ríos Quintero'],
    2,
    [64, 68, 55],
    'La pieza para la agencia Vento cuenta con buena fotografía, pero no evidencia uso de retícula ni elementos interactivos.',
    '2026-10-06 11:25'
  ),
  makeSubmission(
    'sub-d-4',
    ['Diego Fernando Ríos Quintero'],
    3,
    [62, 58, 60, 60],
    'Faltó desarrollar la Fase 1 conceptual y sustentar los planos y encuadres de la sesión fotográfica.',
    '2026-10-06 11:30'
  ),

  // 6. Camilo Salazar Mejía (4 evidencias: 2 aprobadas, 2 no aprobadas)
  makeSubmission(
    'sub-s-1',
    ['Camilo Salazar Mejía'],
    0,
    [84, 82, 82, 85],
    'Buena investigación histórica sobre la evolución del libro y comparativa de formatos.',
    '2026-10-06 11:35'
  ),
  makeSubmission(
    'sub-s-2',
    ['Camilo Salazar Mejía'],
    1,
    [64, 62, 63],
    'Debes detallar las características técnicas de cada medio de salida y usar conectores de flujo.',
    '2026-10-06 11:40'
  ),
  makeSubmission(
    'sub-s-3',
    ['Camilo Salazar Mejía'],
    2,
    [64, 65, 58],
    'Revisa la organización de elementos interactivos según el formato de salida.',
    '2026-10-06 11:45'
  ),
  makeSubmission(
    'sub-s-4',
    ['Camilo Salazar Mejía'],
    3,
    [90, 88, 92, 90],
    'Excelente ejecución fotográfica en las 5 tipologías propuestas y rigurosa gestión de color.',
    '2026-10-06 11:50'
  ),
];
