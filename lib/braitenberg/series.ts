export type BraitenbergStatus = 'published' | 'draft' | 'planned';

export type BraitenbergSeriesEntry = {
  slug: string;
  chapter: 'Intro' | number;
  title: string;
  hook: string;
  description: string;
  status: BraitenbergStatus;
};

const entries: BraitenbergSeriesEntry[] = [
  {
    slug: 'intro',
    chapter: 'Intro',
    title: 'Why Braitenberg Still Matters',
    hook: 'Simple sensorimotor loops still explain more than we admit.',
    description:
      'A short opening essay on why Vehicles still matters for AI, robotics, and software.',
    status: 'planned',
  },
  {
    slug: 'vehicle-1-getting-around',
    chapter: 1,
    title: 'Getting Around',
    hook: 'A single sensor and a single motor are enough to trigger stories.',
    description:
      'Restlessness, temperature fields, and the speed with which observers hallucinate intention.',
    status: 'published',
  },
  {
    slug: 'vehicle-2-fear-and-aggression',
    chapter: 2,
    title: 'Fear and Aggression',
    hook: 'Cross one wire and approach becomes avoidance.',
    description:
      'How same-side and crossed excitation create radically different behavior.',
    status: 'planned',
  },
  {
    slug: 'vehicle-3-love',
    chapter: 3,
    title: 'Love',
    hook: 'Inhibitory wiring makes machines linger, orbit, and appear selective.',
    description:
      'Tiny changes in coupling can produce behavior that looks social.',
    status: 'planned',
  },
  {
    slug: 'vehicle-4-values-and-special-tastes',
    chapter: 4,
    title: 'Values and Special Tastes',
    hook: 'Preference lives in the transfer curve.',
    description:
      'How tuned nonlinear responses begin to look like taste and aversion.',
    status: 'planned',
  },
  {
    slug: 'vehicle-5-logic',
    chapter: 5,
    title: 'Logic',
    hook: 'Thresholds are where mechanism starts to look rule-like.',
    description:
      'Simple gates, compound triggers, and the illusion of deliberation.',
    status: 'planned',
  },
  {
    slug: 'vehicle-6-selection-the-impersonal-engineer',
    chapter: 6,
    title: 'Selection, the Impersonal Engineer',
    hook: 'Competence can accumulate without a planner.',
    description:
      'Selection pressure as a search process for viable mechanisms.',
    status: 'planned',
  },
  {
    slug: 'vehicle-7-concepts',
    chapter: 7,
    title: 'Concepts',
    hook: 'Categories can emerge from use before they exist as symbols.',
    description:
      'Concept-like behavior from recurrent structure and selective response.',
    status: 'planned',
  },
  {
    slug: 'vehicle-8-space-things-and-movements',
    chapter: 8,
    title: 'Space, Things, and Movements',
    hook: 'A world model can be implicit in the loop, not explicit in memory.',
    description:
      'How sensorimotor coupling starts to look like spatial understanding.',
    status: 'planned',
  },
  {
    slug: 'vehicle-9-shapes',
    chapter: 9,
    title: 'Shapes',
    hook: 'Form can be inferred from how interaction unfolds over time.',
    description:
      'Shape perception as accumulated relation, not static inspection.',
    status: 'planned',
  },
  {
    slug: 'vehicle-10-getting-ideas',
    chapter: 10,
    title: 'Getting Ideas',
    hook: 'Novelty often looks like recombination before it looks like insight.',
    description:
      'Internal activation, recombination, and the mechanics of idea-like behavior.',
    status: 'planned',
  },
  {
    slug: 'vehicle-11-rules-and-regularities',
    chapter: 11,
    title: 'Rules and Regularities',
    hook: 'Pattern sensitivity is a mechanism before it is a theorem.',
    description:
      'What it means for a simple system to become responsive to regularity.',
    status: 'planned',
  },
  {
    slug: 'vehicle-12-trains-of-thought',
    chapter: 12,
    title: 'Trains of Thought',
    hook: 'Persistence and chaining make sequences feel cognitive.',
    description:
      'How recurring transitions and retained activation begin to look like thought.',
    status: 'planned',
  },
  {
    slug: 'vehicle-13-foresight',
    chapter: 13,
    title: 'Foresight',
    hook: 'Prediction can appear long before explicit planning does.',
    description:
      'Anticipation, delayed effects, and mechanism that feels prospective.',
    status: 'planned',
  },
  {
    slug: 'vehicle-14-egotism-and-optimism',
    chapter: 14,
    title: 'Egotism and Optimism',
    hook: 'Bias is one of the fastest ways to make a system feel human.',
    description:
      'Asymmetric evaluation, self-reference, and observer-friendly distortion.',
    status: 'planned',
  },
];

export function getBraitenbergSeries() {
  return entries.slice();
}

export function getBraitenbergEntry(slug: string) {
  return entries.find((entry) => entry.slug === slug);
}

export function getBraitenbergNeighbors(slug: string) {
  const index = entries.findIndex((entry) => entry.slug === slug);

  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: entries[index - 1],
    next: entries[index + 1],
  };
}

export function getBraitenbergPath(slug: string) {
  return `/essays/braitenberg/${slug}`;
}

export function getBraitenbergLabel(entry: BraitenbergSeriesEntry) {
  return entry.chapter === 'Intro'
    ? 'Introduction'
    : `Vehicle ${entry.chapter}`;
}
