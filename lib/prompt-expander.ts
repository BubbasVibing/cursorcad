/**
 * Prompt Expander — transforms short user inputs into full geometric briefs.
 *
 * Pipeline:
 * 1. Detect and convert imperial measurements to metric (mm)
 * 2. Inject geometric detail constraints based on part type keywords
 */

// ── Imperial → Metric conversion ────────────────────────────────────────────

const INCH_PATTERN = /(\d+(?:\.\d+)?)\s*(?:inch|inches|in\b|")/gi;
const FOOT_PATTERN = /(\d+(?:\.\d+)?)\s*(?:foot|feet|ft\b|')/gi;

function convertImperialToMetric(input: string): { text: string; converted: boolean; extractedMM: number[] } {
  const extractedMM: number[] = [];
  let converted = false;

  let text = input.replace(INCH_PATTERN, (match, num) => {
    const mm = parseFloat(num) * 25.4;
    extractedMM.push(mm);
    converted = true;
    return `${num} inch (${mm.toFixed(1)}mm)`;
  });

  text = text.replace(FOOT_PATTERN, (match, num) => {
    const mm = parseFloat(num) * 304.8;
    extractedMM.push(mm);
    converted = true;
    return `${num} foot (${mm.toFixed(1)}mm)`;
  });

  return { text, converted, extractedMM };
}

// ── Geometric detail injection ──────────────────────────────────────────────

interface PartKeywords {
  keywords: string[];
  constraints: string;
}

const PART_TYPES: PartKeywords[] = [
  {
    keywords: ['clamp', 'pipe clamp', 'repair clamp', 'hose clamp', 'c-clamp'],
    constraints: [
      'Geometric requirements for clamp:',
      '- Bore diameter must match the pipe/hose outer diameter',
      '- Wall thickness: minimum 5mm for structural integrity',
      '- Flange width: at least 15mm on each side of the gap opening',
      '- Bolt holes: 2-4 holes through the flanges, typically 4mm radius',
      '- C-shape gap: 8-12mm opening width',
      '- Boolean overlap: all cutting geometry must use PARAMS.overlap',
      '- Use segments: 48 for main shell cylinder',
    ].join('\n'),
  },
  {
    keywords: ['bracket', 'mounting bracket', 'handrail bracket', 'wall bracket', 'l-bracket', 'angle bracket'],
    constraints: [
      'Geometric requirements for bracket:',
      '- L-shape construction: vertical plate + horizontal plate',
      '- Plate thickness: minimum 5mm',
      '- Add a gusset/brace between the two plates for structural support',
      '- Bolt hole pattern: at least 2 holes per plate face',
      '- Bolt holes typically 3-5mm radius',
      '- Boolean overlap: all cutting geometry must use PARAMS.overlap',
    ].join('\n'),
  },
  {
    keywords: ['housing', 'junction box', 'enclosure', 'box', 'case', 'casing'],
    constraints: [
      'Geometric requirements for housing/enclosure:',
      '- Hollow interior created by subtracting a smaller cuboid from the outer shell',
      '- Wall thickness: minimum 3mm on all sides',
      '- Lid lip: 2-3mm raised rim around the top opening',
      '- Conduit/cable holes on at least one side wall',
      '- Conduit holes typically 10-15mm radius',
      '- Boolean overlap: all cutting geometry must use PARAMS.overlap',
    ].join('\n'),
  },
  {
    keywords: ['clip', 'cable clip', 'wire clip', 'cable management', 'snap clip', 'retention clip'],
    constraints: [
      'Geometric requirements for clip:',
      '- Channel opening (snap-fit gap) at the top: 10-15mm width',
      '- Wall thickness around the channel: minimum 3mm',
      '- Flat mounting base at the bottom with screw holes',
      '- Mounting holes: 2-3mm radius, at least 2 holes',
      '- Channel diameter must match cable/pipe diameter',
      '- Boolean overlap: all cutting geometry must use PARAMS.overlap',
      '- Use segments: 48 for clip body cylinder',
    ].join('\n'),
  },
  {
    keywords: ['collar', 'pipe collar', 'shaft collar', 'ring', 'flange collar'],
    constraints: [
      'Geometric requirements for collar:',
      '- Inner radius must match the pipe/shaft outer radius exactly',
      '- Wall thickness: minimum 4mm',
      '- Mounting tab extending outward with bolt holes',
      '- Tab bolt holes: 3-4mm radius',
      '- Boolean overlap: all cutting geometry must use PARAMS.overlap',
      '- Use segments: 48 for collar body cylinders',
    ].join('\n'),
  },
  {
    keywords: ['saddle', 'conduit saddle', 'pipe saddle', 'pipe support'],
    constraints: [
      'Geometric requirements for saddle:',
      '- Half-round channel to cradle the pipe',
      '- Flat base with mounting holes on each side',
      '- Channel radius matches pipe outer diameter',
      '- Base width: pipe diameter + 20mm minimum per side',
      '- Mounting holes: 3-4mm radius',
      '- Boolean overlap: all cutting geometry must use PARAMS.overlap',
    ].join('\n'),
  },
];

function injectGeometricDetail(input: string): string | null {
  const lower = input.toLowerCase();

  for (const partType of PART_TYPES) {
    for (const keyword of partType.keywords) {
      if (lower.includes(keyword)) {
        return partType.constraints;
      }
    }
  }

  return null;
}

// ── Main export ─────────────────────────────────────────────────────────────

export interface ExpandedPrompt {
  text: string;
  extractedMM: number[];
  wasExpanded: boolean;
}

export function expandPrompt(userInput: string): ExpandedPrompt {
  // Step 1: Convert imperial to metric
  const { text: metricText, converted, extractedMM } = convertImperialToMetric(userInput);

  // Step 2: Inject geometric constraints by part type
  const constraints = injectGeometricDetail(metricText);

  if (!converted && !constraints) {
    return { text: userInput, extractedMM: [], wasExpanded: false };
  }

  let expanded = metricText;
  if (constraints) {
    expanded += `\n\n${constraints}`;
  }

  return { text: expanded, extractedMM, wasExpanded: true };
}
