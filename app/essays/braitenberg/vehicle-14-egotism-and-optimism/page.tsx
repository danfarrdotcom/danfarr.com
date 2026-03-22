import type { Metadata } from 'next';

import AbstractCognitionLab from '../../../../components/braitenberg/abstract-cognition-lab';
import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';

export const metadata: Metadata = {
  title: 'Vehicle 14: Egotism and Optimism',
  description:
    'A Braitenberg-inspired interactive essay about asymmetric evaluation, self-bias, and why small distortions can look deeply human.',
};

export default function VehicleFourteenPage() {
  return (
    <ArticleShell
      dek="The closing chapter turns to bias. A mechanism that evaluates the same evidence differently depending on whose prospects are at stake can look recognizably human very quickly."
      readingTime="8 min read"
      slug="vehicle-14-egotism-and-optimism"
    >
      <ArticleSection>
        <p>
          Bias is a powerful chapter to end on because it shows how little
          asymmetry is required for personality to appear. The same evidence can
          be weighted differently for self and world, for gains and losses, for
          present and future.
        </p>
        <p>
          Once those distortions stabilize, the system stops looking neutral. It
          begins to look hopeful, defensive, self-favoring, or naïve.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Optimism and egotism can be implemented as evaluation asymmetries. They
          need not begin as explicit beliefs; they can begin as small systematic
          distortions in how evidence is scored.
        </p>
      </Callout>

      <ArticleSection title="The same world can be scored twice">
        <p>
          If a mechanism rates identical evidence one way for itself and another
          way for everything else, the observer starts supplying character. The
          body no longer looks merely adaptive. It looks partial.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="The same evidence supports different totals depending on how positively the system weights gains. That alone is enough to make the evaluation look optimistic."
        figure="14a"
        label="Asymmetric scoring"
      >
        <AbstractCognitionLab mode="bias" />
      </FigureBlock>

      <ArticleSection title="Small distortions are psychologically expensive">
        <p>
          The reason this matters is that human-seeming qualities often require
          very little. A small asymmetry, applied consistently, can dominate the
          observer’s reading of the whole system.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Tune optimism and egotism. The same evidence begins to support a different self-story because the evaluation rule itself has changed."
        figure="14b"
        label="Open evaluator"
      >
        <AbstractCognitionLab mode="bias" variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
