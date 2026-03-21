import type { Metadata } from 'next';

import ArticleShell from '../../../../components/braitenberg/article-shell';
import ArticleSection from '../../../../components/braitenberg/article-section';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import VehicleOneLab from '../../../../components/braitenberg/vehicle-one-lab';

export const metadata: Metadata = {
  title: 'Vehicle 1: Getting Around',
  description:
    'A Braitenberg-inspired interactive essay about how one sensor, one motor, and a scalar field can already look alive.',
};

export default function VehicleOnePage() {
  return (
    <ArticleShell
      dek="A machine with one sensor and one motor should not feel alive. Braitenberg's trick is that it does not take much motion before an observer starts inventing motives anyway."
      readingTime="9 min read"
      slug="vehicle-1-getting-around"
    >
      <ArticleSection>
        <p>
          The first Braitenberg vehicle is almost offensively small. It does not
          store a map. It does not classify the world. It does not decide
          between alternatives. It only couples one sensor to one motor and
          exposes that loop to a field.
        </p>
        <p>
          That minimality is the point. Once the sensor reading modulates speed,
          and once the world is even slightly uneven, the path begins to look
          like temperament. It rushes, hesitates, overshoots, lingers, and
          rebounds. The mechanism is trivial. The interpretation is not.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Vehicle 1 is not a study of intelligence. It is a study of how fast
          observers project intelligence onto movement. One scalar reading and
          one actuator already generate enough behavior for a story to begin.
        </p>
      </Callout>

      <ArticleSection title="One loop, no steering">
        <p>
          In this first figure, warmer regions simply make the motor drive
          harder. The heading only changes because of drift and wall contact.
          That means any appearance of searching or curiosity is already being
          manufactured by the interaction between body and environment, not by a
          hidden decision process.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="More signal means more speed. The vehicle does not know where the warm region is, and it never turns toward it on purpose."
        figure="1a"
        label="Single loop"
      >
        <VehicleOneLab variant="bare" />
      </FigureBlock>

      <ArticleSection title="Temperament is often physics in disguise">
        <p>
          The fastest way to make the same system look like a different
          personality is not to give it memory. It is to change the physical
          assumptions around it. Slightly more friction makes motion look
          reluctant. Slightly more noise makes it look nervous. Increase field
          strength and the same vehicle starts to feel driven.
        </p>
        <p>
          This is a useful correction for modern software too. Behavior that
          gets described as preference, intent, or even policy is often the side
          effect of response curves, latency, damping, and environmental
          structure.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Tune friction, noise, and field strength. The wiring does not change, but the character reading does."
        figure="1b"
        label="Parameter variation"
      >
        <VehicleOneLab variant="temperament" />
      </FigureBlock>

      <Callout label="Modern translation">
        <p>
          Vehicle 1 is a reactive agent before the term existed. It is policy
          without representation. The agent does not carry a world model around.
          The world is read directly at the sensor and fed back into action.
        </p>
      </Callout>

      <ArticleSection title="The environment co-authors the behavior">
        <p>
          If you only watch the body, it is easy to over-credit the vehicle. If
          you move the field around, the illusion loosens. The route is partly a
          property of the mechanism and partly a property of what the world is
          offering it to read.
        </p>
        <p>
          In the editor below, move the warm source, add cold pockets, or erase
          one. The same loop behaves differently because the world is different,
          not because the vehicle became smarter.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Click the canvas to edit the field. This makes the environment visible as part of the computation."
        figure="1c"
        label="Rearranged field"
      >
        <VehicleOneLab variant="editor" />
      </FigureBlock>

      <ArticleSection title="Open sandbox">
        <p>
          The full loop is exposed here: source layout, field strength, sensor
          gain, motor gain, trail, and run reset. This is not a big simulator
          because it does not need to be. Braitenberg&apos;s point survives
          contact with the browser precisely because the mechanism stays small.
        </p>
        <p>
          What matters is that the threshold for apparent psychology is lower
          than intuition expects. The machine is not seeking, fearing, or
          preferring in any rich sense. We are reading those things into the
          motion because we are built to do that.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Use the sandbox to push the simple loop until the behavior stops feeling accidental and starts feeling interpretable."
        figure="1d"
        label="Open plate"
      >
        <VehicleOneLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
