import type { Metadata } from 'next';

import AbstractCognitionLab from '../../../../components/braitenberg/abstract-cognition-lab';
import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';

export const metadata: Metadata = {
  title: 'Vehicle 11: Rules and Regularities',
  description:
    'A Braitenberg-inspired interactive essay about pattern sensitivity, repeated windows, and how regularities become actionable.',
};

export default function VehicleElevenPage() {
  return (
    <ArticleShell
      dek="Regularity is one of the first bridges from raw events to structure. A system that becomes sensitive to repeated windows starts acting as if it has found a rule, even when it has only stabilized a pattern."
      readingTime="8 min read"
      slug="vehicle-11-rules-and-regularities"
    >
      <ArticleSection>
        <p>
          A rule does not need to begin as an explicit sentence. It can begin as
          a repeated relation that the system starts to privilege. Once some
          windows recur more often than others, the mechanism can treat them as
          stable and act accordingly.
        </p>
        <p>
          This is the step from event to regularity. The system becomes less
          reactive to individual moments and more sensitive to the persistence of
          a pattern across time.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Regularities become rule-like when they start biasing what the system
          expects next. Pattern sensitivity is a mechanism before it is a theorem.
        </p>
      </Callout>

      <ArticleSection title="Repetition creates structure">
        <p>
          Detecting a dominant window is a small achievement, but it is already
          enough to support anticipation, compression, and selective response.
          The rule does not have to be verbalized for it to constrain behavior.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="A recurring window begins to dominate the stream. Once the system privileges that recurrence, it starts behaving as if a rule has been found."
        figure="11a"
        label="Dominant pattern"
      >
        <AbstractCognitionLab mode="regularities" />
      </FigureBlock>

      <ArticleSection title="Noise matters because it tests stability">
        <p>
          A useful regularity is not merely repeated once. It survives enough
          variation to remain worth tracking. That is why later cognitive-seeming
          behavior often depends on finding structure that tolerates interruption.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Increase the window and add noise. The detected regularity changes because the system is trading local certainty against broader structure."
        figure="11b"
        label="Open detector"
      >
        <AbstractCognitionLab mode="regularities" variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
