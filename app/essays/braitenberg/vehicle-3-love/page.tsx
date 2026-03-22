import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import VehicleThreeLab from '../../../../components/braitenberg/vehicle-three-lab';

export const metadata: Metadata = {
  title: 'Vehicle 3: Love',
  description:
    'A Braitenberg-inspired interactive essay about inhibitory coupling, attraction, and why slowing down can look like attachment.',
};

export default function VehicleThreePage() {
  return (
    <ArticleShell
      dek="Vehicle 3 changes the sign of the coupling. The vehicle is no longer excited by the signal. It is inhibited by it. That small reversal is enough to make one wiring pattern look tender and another look exploratory."
      readingTime="10 min read"
      slug="vehicle-3-love"
    >
      <ArticleSection>
        <p>
          Vehicle 2 made the body look emotional by deciding where to turn.
          Vehicle 3 adds a second twist: stronger signal no longer means more
          speed. It means less. As the light grows stronger, the motors slow
          down.
        </p>
        <p>
          Once again, the interpretive jump is immediate. A vehicle that turns
          toward the source and then slows to a stop beside it looks attached.
          A vehicle that turns away whenever the source grows too strong but
          regains speed as it leaves looks restless, picky, or exploratory. The
          behavior feels richer than the mechanism because the slowing matters
          as much as the steering.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          Love in Braitenberg&apos;s sense is not a feeling hidden inside the
          machine. It is the visible consequence of inhibitory coupling: the
          vehicle turns toward what it likes, then loses speed as it arrives.
        </p>
      </Callout>

      <ArticleSection title="Approach plus braking looks like attachment">
        <p>
          With direct inhibitory wiring, the brighter side slows its own wheel
          first. That turns the body toward the source. But the same mechanism
          also reduces overall speed as both sensors saturate. The result is a
          trajectory that approaches and then settles.
        </p>
        <p>
          Cross the same inhibitory wires and the story changes. Now the body
          peels away from strong signal, speeds back up as the light weakens,
          and ends up roaming. The field is the same. The body is the same. The
          only real change is which wheel gets slowed.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Direct inhibition produces a loving approach: turn inward, then slow near the source. Crossed inhibition produces an explorer that keeps escaping and returning."
        figure="3a"
        label="Direct and crossed inhibition"
      >
        <VehicleThreeLab variant="comparison" />
      </FigureBlock>

      <ArticleSection title="Love is geometry with damping">
        <p>
          The crucial addition here is braking. In Vehicle 2, closing in on the
          source often made the aggressive vehicle feel more intense because it
          sped up on the way in. In Vehicle 3, closing in makes the loving
          vehicle gentler because it loses speed on the way in.
        </p>
        <p>
          That change is enough to make the motion look selective or even
          affectionate. But the right explanation is still mechanical. The
          source is not desired in any rich sense. It is simply the place where
          the turning and the slowing happen to reinforce each other.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Switch between love and exploration while holding the source fixed. The direct vehicle tends to settle near the light. The crossed vehicle keeps slipping away from it."
        figure="3b"
        label="Wiring toggle"
      >
        <VehicleThreeLab variant="wiring" />
      </FigureBlock>

      <Callout label="Modern translation">
        <p>
          Systems often look more intentional when inhibition enters the loop.
          Slowing, pausing, lingering, and withholding action are easy for
          observers to read as judgment or attachment, even when they are just
          consequences of how strong signals suppress output.
        </p>
      </Callout>

      <ArticleSection title="The environment still co-authors the behavior">
        <p>
          The field still matters because it shapes where slowing begins and how
          sharply the path bends. Move the source and the loving vehicle settles
          somewhere else. Move it again and the explorer begins wandering along
          a different orbit.
        </p>
        <p>
          Drag the light across the plate below. Try both modes in the same
          location. The contrast is clearest when the geometry is held constant:
          one vehicle keeps trying to stay with the source, while the other
          keeps finding reasons to leave it.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Move the light source across the plate. Direct inhibition keeps trying to settle at the source, while crossed inhibition keeps converting strong signal into escape."
        figure="3c"
        label="Moved source"
      >
        <VehicleThreeLab variant="field" />
      </FigureBlock>

      <ArticleSection title="Open plate">
        <p>
          The full plate stays small on purpose: one source, two sensors, two
          motors, inhibitory coupling, and a few tunable parameters. That is
          enough to produce motion that people quickly describe in relational
          language.
        </p>
        <p>
          Use the controls to tune gain and field strength, switch between the
          two wiring schemes, and move the source around. The lesson stays the
          same. Attachment, selectivity, and curiosity can all begin as local
          dynamics long before they deserve a larger psychological story.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Use the full plate to tune inhibitory coupling. Love and exploration here are observer-level readings of how braking and turning interact around a source."
        figure="3d"
        label="Open plate"
      >
        <VehicleThreeLab variant="sandbox" />
      </FigureBlock>
    </ArticleShell>
  );
}
