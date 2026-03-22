import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import SelectionLab from '../../../../components/braitenberg/selection-lab';

export const metadata: Metadata = {
  title: 'Vehicle 6: Selection, the Impersonal Engineer',
  description:
    'A Braitenberg-inspired interactive essay about how competence can accumulate through selection rather than design.',
};

export default function VehicleSixPage() {
  return (
    <ArticleShell
      dek="Chapter six shifts the question from how a mechanism behaves to how such a mechanism could be found in the first place. Braitenberg’s answer is selection: competence can accumulate without a planner who understands the result in advance."
      readingTime="9 min read"
      slug="vehicle-6-selection-the-impersonal-engineer"
    >
      <ArticleSection>
        <p>
          Once the vehicles become even slightly richer, the natural question is
          who built them. Braitenberg’s answer is that not every good design
          needs an engineer who understands it as a whole. Selection can do the
          searching.
        </p>
        <p>
          A population only has to vary, confront a world, and keep what
          already works a little better. Over time, that is enough to produce
          mechanisms that look fitted, even when no agent foresaw the fit.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Selection is an impersonal engineer because it can accumulate viable
          structure without representing the final design as a plan.
        </p>
      </Callout>

      <ArticleSection title="Search can be external to the vehicle">
        <p>
          This chapter matters because it prevents us from overloading the
          vehicle itself with explanation. Some of the competence we observe may
          be the result of history rather than online reasoning.
        </p>
        <p>
          That reframes intelligence as a layered story. The present mechanism
          may be simple. The hard part may have happened upstream in the process
          that selected it.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="A population drifts toward the target zone across generations even though no individual agent knows what the target means."
        figure="6a"
        label="Selection pressure"
      >
        <SelectionLab variant="selection" />
      </FigureBlock>

      <ArticleSection title="Good fits need not be understood">
        <p>
          Selection is powerful precisely because it does not require full
          comprehension. It only requires differential retention. That is enough
          to produce designs whose apparent purpose exceeds the understanding of
          any single step that produced them.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Change the target, mutation, and survival rate. The population still adapts because selection only needs a retention rule, not a designer’s blueprint."
        figure="6b"
        label="Open population"
      >
        <SelectionLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
