import type { Metadata } from 'next';

import ArticleShell from '../../../../components/braitenberg/article-shell';
import ArticleSection from '../../../../components/braitenberg/article-section';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import VehicleTwoLab from '../../../../components/braitenberg/vehicle-two-lab';

export const metadata: Metadata = {
  title: 'Vehicle 2: Fear and Aggression',
  description:
    'A Braitenberg-inspired interactive essay about how two sensors and one crossed wire can flip retreat into attack.',
};

export default function VehicleTwoPage() {
  return (
    <ArticleShell
      dek="Chapter two is where Braitenberg stops looking merely clever and starts looking dangerous. The mechanism is still tiny, but now one change in wiring is enough to make the same body read as timid or violent."
      readingTime="10 min read"
      slug="vehicle-2-fear-and-aggression"
    >
      <ArticleSection>
        <p>
          Vehicle 1 never had to choose a direction. It sped up or slowed down,
          and the environment supplied the rest. Vehicle 2 adds direction by
          splitting the interface in two. There is a left sensor, a right
          sensor, a left motor, and a right motor. That is enough to create
          approach and avoidance.
        </p>
        <p>
          The important thing is that nothing like fear or aggression is stored
          inside the vehicle. The interpretation comes from the path. We watch a
          body veer away from a source and call it timid. We watch the same body
          drive toward it and call it hostile. The story changes because the
          wiring changes.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Vehicle 2 is Braitenberg&apos;s cleanest demonstration that
          architecture matters more than the vocabulary we project onto it. The
          same light, the same body, and the same excitatory signal can look
          like either retreat or attack depending on which wheel receives the
          stronger push.
        </p>
      </Callout>

      <ArticleSection title="One crossover changes the whole behavior">
        <p>
          In the direct arrangement, the left sensor drives the left wheel and
          the right sensor drives the right wheel. The side closest to the light
          accelerates first, which makes the body swing away from the source. In
          the crossed arrangement, each sensor drives the opposite wheel. Now
          the brighter side pulls the body inward instead.
        </p>
        <p>
          This is the same positive signal in both cases. Only the routing
          changes. Yet the resulting motion reads like a change in character.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Direct excitation produces retreat. Crossed excitation produces pursuit. The mechanism differs by one crossover, but the observer reading flips completely."
        figure="2a"
        label="Direct and crossed excitation"
      >
        <VehicleTwoLab variant="comparison" />
      </FigureBlock>

      <ArticleSection title="The emotion is in the geometry">
        <p>
          Braitenberg names these vehicles in emotional language because the
          trajectories invite it. The direct vehicle seems cautious because it
          backs away from intensity. The crossed vehicle seems aggressive
          because it not only approaches the source but speeds up as the source
          grows stronger.
        </p>
        <p>
          The useful correction is that the emotion is not in the code. It is
          in the geometry between sensor placement, wheel speed, and the shape
          of the field.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Flip between fear and aggression while keeping the source fixed. The body reads differently because the sensor-to-motor mapping changed, not because a new motive appeared."
        figure="2b"
        label="Wiring toggle"
      >
        <VehicleTwoLab variant="wiring" />
      </FigureBlock>

      <Callout label="Modern translation">
        <p>
          This is still a lesson for software and AI. We often narrate behavior
          at the level of intent when the more decisive level is architecture:
          what gets coupled to what, how quickly, and with what asymmetry.
          Small routing decisions create large interpretive differences.
        </p>
      </Callout>

      <ArticleSection title="The source does not dictate the story by itself">
        <p>
          The light source matters, but not by issuing commands. It only shapes
          a gradient. What the body does with that gradient depends on the
          coupling. Move the light and the paths change. Keep the light still
          and switch the wiring and the narrative changes just as much.
        </p>
        <p>
          Drag the source across the plate below. Try the same location in both
          modes. One vehicle seems to keep its distance. The other behaves as if
          it has found something to attack.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Move the light source across the plate. The direct vehicle tends to peel away from the brighter side, while the crossed vehicle bends toward it."
        figure="2c"
        label="Moved source"
      >
        <VehicleTwoLab variant="field" />
      </FigureBlock>

      <ArticleSection title="Open plate">
        <p>
          The full plate is still small on purpose. There is one source, two
          sensors, two motors, and a handful of parameters. That is enough to
          create motion that looks expressive. If the vehicle feels alive, it is
          because our threshold for reading agency into trajectories is very
          low.
        </p>
        <p>
          Use the controls to tune gain and field strength, switch between the
          two wiring schemes, and move the source around. The lesson does not
          change: what looks like temperament often begins as a coupling
          diagram.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Use the full plate to tune the coupling. Fear and aggression here are observer-level descriptions laid on top of a very small dynamical system."
        figure="2d"
        label="Open plate"
      >
        <VehicleTwoLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
