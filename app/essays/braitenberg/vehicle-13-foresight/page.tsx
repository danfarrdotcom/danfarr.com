import type { Metadata } from 'next';

import AbstractCognitionLab from '../../../../components/braitenberg/abstract-cognition-lab';
import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';

export const metadata: Metadata = {
  title: 'Vehicle 13: Foresight',
  description:
    'A Braitenberg-inspired interactive essay about prediction, leading traces, and how anticipation can arise from small mechanisms.',
};

export default function VehicleThirteenPage() {
  return (
    <ArticleShell
      dek="Foresight looks like a high cognitive achievement, but Braitenberg’s sequence suggests a smaller origin. Anticipation can emerge when an internal trace starts running slightly ahead of the world it tracks."
      readingTime="8 min read"
      slug="vehicle-13-foresight"
    >
      <ArticleSection>
        <p>
          Prediction is often treated as a sharp divide between reactive and
          cognitive systems. Braitenberg narrows that divide. A system can begin
          to look foresighted as soon as an internal trajectory gets even a
          little ahead of present input.
        </p>
        <p>
          That lead does not have to be perfect. It only has to be structured
          enough to bias action before the world fully arrives.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Foresight begins when the mechanism carries a leading trace rather than
          merely echoing the present. Prediction can therefore appear long before
          explicit planning does.
        </p>
      </Callout>

      <ArticleSection title="A small lead changes the reading">
        <p>
          Once the predicted line starts to precede the actual one, the system
          no longer looks purely reactive. The observer begins to attribute
          anticipation, even if the underlying machinery is still little more
          than a lagged coupling with memory.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="The dashed trace runs slightly ahead of the solid one. That lead is enough to make the mechanism look prospective rather than merely reactive."
        figure="13a"
        label="Leading trace"
      >
        <AbstractCognitionLab mode="foresight" />
      </FigureBlock>

      <ArticleSection title="Prediction is only useful if it stays coupled">
        <p>
          A useful forecast cannot drift too far from the world. The point is
          not fantasy but actionable anticipation. That is why horizon and drag
          matter together: one sets the lead, the other sets how tightly the
          forecast remains tethered.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Tune the prediction horizon and drag. The mechanism crosses from anticipation into distortion when its leading trace stops tracking the world closely enough."
        figure="13b"
        label="Open prediction"
      >
        <AbstractCognitionLab mode="foresight" variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
