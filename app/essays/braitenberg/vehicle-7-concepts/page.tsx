import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import ConceptsLab from '../../../../components/braitenberg/concepts-lab';

export const metadata: Metadata = {
  title: 'Vehicle 7: Concepts',
  description:
    'A Braitenberg-inspired interactive essay about categories, prototypes, and concept-like behavior from selective response.',
};

export default function VehicleSevenPage() {
  return (
    <ArticleShell
      dek="Concepts do not have to begin as explicit words inside a head. In Braitenberg’s framing, they can begin as stable regions of selective response: some stimuli fall together because the mechanism treats them together."
      readingTime="9 min read"
      slug="vehicle-7-concepts"
    >
      <ArticleSection>
        <p>
          The temptation is to think a concept appears only when a system can
          name it. Braitenberg pushes earlier. If a mechanism groups situations,
          responds similarly across them, and draws boundaries that matter for
          action, something concept-like is already in play.
        </p>
        <p>
          This does not mean the concept is linguistically explicit. It means
          the system’s organization already carves the world into kinds.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          A concept can begin as a stable pattern of inclusion and exclusion. If
          the mechanism repeatedly treats different cases as the same kind of
          thing, it has already acquired a practical category.
        </p>
      </Callout>

      <ArticleSection title="Categories can be built from prototypes">
        <p>
          One way to see this is through prototypes. Stimuli get assigned not
          because they match a verbal definition, but because they lie nearer to
          one response center than another. Shift the prototypes and the concept
          boundary shifts with them.
        </p>
        <p>
          That is enough to make concept formation feel less mysterious. The
          mechanism does not need to start with a symbolic taxonomy. It can
          start by responding selectively in a structured space.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Move the response centers and the category boundary moves too. Concept-like behavior can emerge from selective response in a shared space."
        figure="7a"
        label="Prototype boundary"
      >
        <ConceptsLab variant="boundary" />
      </FigureBlock>

      <ArticleSection title="Concepts stay tied to use">
        <p>
          The practical point is that categories are valuable because they guide
          what comes next. A concept is useful not because it exists in the
          abstract, but because it makes some actions available and others
          unavailable.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Adjust prototype positions and sharpness. The category structure changes continuously because the concept is still embedded in the response geometry."
        figure="7b"
        label="Open concept space"
      >
        <ConceptsLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
