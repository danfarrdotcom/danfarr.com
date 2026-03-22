import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import SpaceLab from '../../../../components/braitenberg/space-lab';

export const metadata: Metadata = {
  title: 'Vehicle 8: Space, Things, and Movements',
  description:
    'A Braitenberg-inspired interactive essay about how spatial understanding can emerge from accumulated sensorimotor traces.',
};

export default function VehicleEightPage() {
  return (
    <ArticleShell
      dek="Braitenberg’s spatial chapter asks how a creature might come to act as if it knows a world without first storing a clean geometric map of it. The answer begins in movement and accumulation."
      readingTime="9 min read"
      slug="vehicle-8-space-things-and-movements"
    >
      <ArticleSection>
        <p>
          Space can look mysterious if we imagine it arriving all at once as an
          internal picture. Braitenberg’s alternative is more grounded.
          Movement through the world leaves traces. Repeated traces can stabilize
          into something map-like.
        </p>
        <p>
          The important shift is that representation no longer has to be a
          detached photograph of the environment. It can be an accumulated
          result of sensorimotor history.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Spatial knowledge can be implicit in the loop. A system may behave as
          if it knows a layout because repeated movement has already deposited a
          usable structure internally.
        </p>
      </Callout>

      <ArticleSection title="Movement writes the map">
        <p>
          As the vehicle moves, what matters is not just its current signal but
          the way successive signals line up. A path through the world can leave
          behind an internal occupancy picture that is much coarser than a map
          and still useful enough to guide behavior.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="The world trace on the left gradually deposits a coarse internal occupancy structure on the right. Spatial understanding begins as accumulated relation."
        figure="8a"
        label="Trace and map"
      >
        <SpaceLab variant="trace" />
      </FigureBlock>

      <ArticleSection title="Things and movements are inseparable at first">
        <p>
          Early spatial understanding is usually tied to possible actions. A
          thing is not only a shape occupying a place; it is also an obstruction,
          an attractor, a route around, a source of changing signals over time.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Vary the sensor extent and memory. The internal picture changes because space is being learned through action, not copied all at once."
        figure="8b"
        label="Open spatial trace"
      >
        <SpaceLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
