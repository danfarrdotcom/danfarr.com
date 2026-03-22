import type { Metadata } from 'next';

import AbstractCognitionLab from '../../../../components/braitenberg/abstract-cognition-lab';
import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';

export const metadata: Metadata = {
  title: 'Vehicle 12: Trains of Thought',
  description:
    'A Braitenberg-inspired interactive essay about chained states, persistence, and why sequential activation can look cognitive.',
};

export default function VehicleTwelvePage() {
  return (
    <ArticleShell
      dek="Thought starts to look sequential when activation no longer vanishes immediately. If one state persists long enough to bias the next, a train can emerge without an inner narrator."
      readingTime="8 min read"
      slug="vehicle-12-trains-of-thought"
    >
      <ArticleSection>
        <p>
          A single act is easy to describe mechanically. A train of thought
          seems harder because it appears to require continuity. Braitenberg’s
          move is to let activation persist and chain.
        </p>
        <p>
          Once a state lingers long enough to influence what comes next, the
          system starts producing ordered sequences rather than isolated
          reactions. That ordering is already enough to look thought-like.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Trains of thought need persistence more than they need symbolism. A
          chain of retained activation can already look like an unfolding inner
          sequence.
        </p>
      </Callout>

      <ArticleSection title="Persistence is the bridge">
        <p>
          The crucial property is not just transition but overlap. If one state
          remains partly alive while another rises, the sequence acquires memory.
          That memory is enough to make the chain directional and coherent.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="A train appears when neighboring states overlap in time instead of replacing one another instantaneously."
        figure="12a"
        label="Persistent chain"
      >
        <AbstractCognitionLab mode="trains" />
      </FigureBlock>

      <ArticleSection title="Sequence can feel internal very quickly">
        <p>
          The observer does the rest. Once the chain becomes orderly, we start
          describing it in mental vocabulary: one thought leading to another,
          one state preparing the next. The underlying mechanism can still be a
          small state process with persistence.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Tune persistence and advance the chain. The sequence changes because the overlap structure changes, not because a larger intellect appeared."
        figure="12b"
        label="Open chain"
      >
        <AbstractCognitionLab mode="trains" variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
