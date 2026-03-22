import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import VehicleOneLab from '../../../../components/braitenberg/vehicle-one-lab';
import VehicleTwoLab from '../../../../components/braitenberg/vehicle-two-lab';

export const metadata: Metadata = {
  title: 'Why Braitenberg Still Matters',
  description:
    'An introduction to the Braitenberg series and why simple sensorimotor mechanisms still matter for software, AI, and robotics.',
};

export default function BraitenbergIntroPage() {
  return (
    <ArticleShell
      dek="Braitenberg's book keeps surviving contact with new fields because its central claim is still uncomfortable: behavior that looks rich, intentional, or even emotional can emerge from mechanisms that are almost embarrassingly small."
      readingTime="8 min read"
      slug="intro"
    >
      <ArticleSection>
        <p>
          <i>Vehicles: Experiments in Synthetic Psychology</i>{' '}
          is often treated
          like a charming classic from an earlier period of cybernetics. That
          reading understates it. Braitenberg&apos;s real argument is not quaint.
          It is a hard constraint on how we talk about minds, machines, and the
          systems we build.
        </p>
        <p>
          His vehicles are deliberately minimal bodies placed in equally minimal
          worlds. A few sensors, a few motors, a small field, and a simple
          coupling rule are enough to produce motion that observers immediately
          describe in psychological language. They say the vehicle is curious,
          timid, angry, attached, selective. Braitenberg&apos;s point is that the
          mechanism did not have to become psychologically rich for the story to
          appear.
        </p>
      </ArticleSection>

      <Callout label="Core claim">
        <p>
          Apparent complexity arrives earlier than intuition expects. If a path
          unfolds coherently enough in the world, observers start supplying
          motives long before the underlying system deserves them.
        </p>
      </Callout>

      <ArticleSection title="Why this still matters">
        <p>
          The lesson is still live because we continue to narrate behavior at
          the wrong level. In AI, robotics, and software more broadly, it is
          tempting to explain systems in terms of goals, preferences, internal
          models, or reasoning. Sometimes that is warranted. Often it is not.
          Often the more decisive explanation is architectural: what is coupled
          to what, how quickly, and under what environmental conditions.
        </p>
        <p>
          Braitenberg gives us a discipline for resisting premature psychology.
          Before we say a system understands, prefers, fears, or plans, we
          should ask what simpler mechanism could already account for the
          behavior we are seeing.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="The smallest loop already feels larger than it is. One sensor, one motor, and a scalar field are enough to make trajectories look temperamental."
        figure="0a"
        label="The threshold is low"
      >
        <VehicleOneLab variant="bare" />
      </FigureBlock>

      <ArticleSection title="The series is not a rewrite of the book">
        <p>
          This series does not try to paraphrase Braitenberg chapter by chapter.
          It translates the mechanisms into interactive plates and modern
          language. The aim is to preserve the force of the original insight
          while making the structure visible. The figures are not decorative.
          They are the argument.
        </p>
        <p>
          The first entries stay close to the canonical vehicles because those
          chapters establish the grammar of the whole project: simple bodies,
          simple worlds, and large interpretive consequences. Later chapters
          move toward selection, representation, concepts, prediction, and
          thought-like sequences. By then the mechanisms become richer, but the
          discipline is the same.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="A single crossover flips retreat into pursuit. The signal does not change. The body does not change. Only the routing changes, yet the observer reading changes with it."
        figure="0b"
        label="Architecture first"
      >
        <VehicleTwoLab variant="comparison" />
      </FigureBlock>

      <Callout label="How to read these essays">
        <p>
          Treat the emotional labels as observer-level shorthand, not literal
          explanations. The useful question is always what structure in the
          mechanism made that label seem plausible in the first place.
        </p>
      </Callout>

      <ArticleSection title="What comes next">
        <p>
          The opening articles focus on the cleanest demonstrations. Vehicle 1
          shows how quickly motion alone becomes interpretable. Vehicle 2 shows
          how a tiny change in coupling can invert the apparent character of the
          same body. Vehicle 3 and beyond extend that logic into inhibition,
          preference, selection, concept formation, and increasingly cognitive
          readings.
        </p>
        <p>
          If the series works, it should make two things harder to forget. First,
          seemingly rich behavior does not guarantee a rich internal story.
          Second, small mechanisms are worth taking seriously precisely because
          they so often sit underneath the narratives we would rather tell.
        </p>
      </ArticleSection>
    </ArticleShell>
  );
}
