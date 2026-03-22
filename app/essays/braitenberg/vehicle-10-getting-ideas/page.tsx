import type { Metadata } from 'next';

import AbstractCognitionLab from '../../../../components/braitenberg/abstract-cognition-lab';
import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';

export const metadata: Metadata = {
  title: 'Vehicle 10: Getting Ideas',
  description:
    'A Braitenberg-inspired interactive essay about recombination, novelty, and the mechanics of idea-like behavior.',
};

export default function VehicleTenPage() {
  return (
    <ArticleShell
      dek="By chapter ten, Braitenberg is pushing toward mental novelty. The challenge is to explain how new combinations can appear without smuggling in a homunculus who already knows which ideas are worth having."
      readingTime="8 min read"
      slug="vehicle-10-getting-ideas"
    >
      <ArticleSection>
        <p>
          Ideas look mysterious when they are treated as spontaneous
          appearances. Braitenberg’s move is to demystify them by pulling them
          back toward combinatorics. Newness can emerge because older fragments
          get recombined under slightly different constraints.
        </p>
        <p>
          That does not make the result trivial. It only changes where the work
          is happening. The interesting question becomes which fragments are
          available, how they are selected, and what biases shape their
          recombination.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Idea-like behavior can begin as recombination plus selection. Novelty
          does not have to arrive ex nihilo to feel like insight.
        </p>
      </Callout>

      <ArticleSection title="Newness is often structured reuse">
        <p>
          The system does not have to invent from nothing. It can combine traces,
          maps, gates, and memories into fresh arrangements. That is often enough
          for observers to describe the result as a new idea.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Candidate ideas appear as recombinations of existing fragments. Novelty depends on which combinations are permitted and how strongly they are preferred."
        figure="10a"
        label="Recombination"
      >
        <AbstractCognitionLab mode="ideas" />
      </FigureBlock>

      <ArticleSection title="Insight still depends on bias">
        <p>
          Even recombination requires a bias toward some combinations over
          others. That bias can be weak and local, but it is what stops the
          space of possible mixtures from collapsing into noise.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Tune novelty and coherence. Idea generation changes because the system is weighting different fragments and arrangements differently."
        figure="10b"
        label="Open recombination"
      >
        <AbstractCognitionLab mode="ideas" variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
