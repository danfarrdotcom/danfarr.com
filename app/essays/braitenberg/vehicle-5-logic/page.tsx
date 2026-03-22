import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import LogicLab from '../../../../components/braitenberg/logic-lab';

export const metadata: Metadata = {
  title: 'Vehicle 5: Logic',
  description:
    'A Braitenberg-inspired interactive essay about thresholds, gates, and how mechanism starts to look rule-like.',
};

export default function VehicleFivePage() {
  return (
    <ArticleShell
      dek="Logic enters the series when continuous signals are forced through thresholds and compound triggers. Rule-like behavior does not have to appear all at once; it can emerge from small arrangements of gates."
      readingTime="9 min read"
      slug="vehicle-5-logic"
    >
      <ArticleSection>
        <p>
          Braitenberg does not treat logic as a magical threshold where machines
          suddenly become abstract. He treats it as a construction problem. Once
          you can combine signals, threshold them, and let one condition gate
          another, behavior begins to look rule-like.
        </p>
        <p>
          That matters because observers often describe the result as reasoning.
          But the mechanism can still be very small. The system may only be
          adding, clipping, and switching.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Logic is one of the fastest ways for mechanism to acquire the surface
          of deliberation. A few thresholds and compound triggers can already
          make the output read as conditional judgment.
        </p>
      </Callout>

      <ArticleSection title="Thresholds are proto-rules">
        <p>
          A weighted sum plus a threshold is already a primitive decision
          device. Below the line, nothing happens. Above the line, the system
          acts. That is enough to make inputs feel like reasons.
        </p>
        <p>
          Once several inputs are present, the difference between a gate and a
          sum becomes important. Is the system acting because both conditions
          hold, because either does, or because one excludes the other? Those
          distinctions are exactly what logic makes crisp.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="The same inputs can be interpreted as a thresholded sum or as a discrete gate. Rule-like behavior begins when the output stops varying smoothly and starts switching."
        figure="5a"
        label="Threshold and gate"
      >
        <LogicLab variant="gates" />
      </FigureBlock>

      <ArticleSection title="Deliberation can be compiled from switches">
        <p>
          The mistake is to imagine that conditional behavior requires a fully
          formed symbolic reasoner. Often it only requires a small circuit that
          compounds and suppresses signals in the right places.
        </p>
        <p>
          This is why logic matters in the Braitenberg sequence. It marks the
          point where interpretation starts to move from temperament toward
          procedure. The behavior begins to look as if the system is following
          rules, even when it is only following a circuit.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Tune the weights and threshold while toggling the inputs. Small changes in circuit structure make the behavior read as a different procedure."
        figure="5b"
        label="Open gate"
      >
        <LogicLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
