import type { Metadata } from 'next';

import ArticleSection from '../../../../components/braitenberg/article-section';
import ArticleShell from '../../../../components/braitenberg/article-shell';
import Callout from '../../../../components/braitenberg/callout';
import FigureBlock from '../../../../components/braitenberg/figure-block';
import ResponseCurveLab from '../../../../components/braitenberg/response-curve-lab';

export const metadata: Metadata = {
  title: 'Vehicle 4: Values and Special Tastes',
  description:
    'A Braitenberg-inspired interactive essay about response curves, preferred bands, and how values can be built from simple transfer functions.',
};

export default function VehicleFourPage() {
  return (
    <ArticleShell
      dek="By chapter four, Braitenberg has stopped changing the body and started changing the transfer function. Values, tastes, and aversions can all be made to appear by reshaping how the same signal turns into action."
      readingTime="9 min read"
      slug="vehicle-4-values-and-special-tastes"
    >
      <ArticleSection>
        <p>
          Vehicles 1 through 3 taught the basic trick: alter the coupling and
          the path changes enough to invite a new interpretation. Vehicle 4
          makes the next move. Instead of asking which sensor drives which
          motor, it asks how much a given signal should matter at all.
        </p>
        <p>
          The answer is a response curve. Some vehicles respond broadly. Some
          have a narrow preferred band. Some are drawn toward moderate intensity
          but avoid extremes. That is already enough to make them look as if
          they have values.
        </p>
      </ArticleSection>

      <Callout label="Key idea">
        <p>
          A taste can be implemented as a curve before it is implemented as a
          symbol. If the same world produces different action because the
          transfer function is shaped differently, observers start talking about
          preference.
        </p>
      </Callout>

      <ArticleSection title="Taste lives in the curve">
        <p>
          The same stimulus can excite one vehicle, leave another indifferent,
          and repel a third. Nothing about the world changed. The only change is
          the shape of the mapping between signal intensity and output.
        </p>
        <p>
          This is important because it relocates value from high-level judgment
          to low-level response. The vehicle does not have to represent a rule
          like “prefer warmth but not too much warmth.” It only needs a curve
          that behaves that way.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="The same signal can produce a broad liking, a narrow special taste, or an outright aversion depending on the response curve."
        figure="4a"
        label="Transfer profiles"
      >
        <ResponseCurveLab variant="profiles" />
      </FigureBlock>

      <ArticleSection title="Values can be narrow, local, and mechanical">
        <p>
          Special tastes appear when the preferred zone becomes narrow. The
          vehicle is not generally attracted to a kind of input. It is attracted
          to a particular band. Outside that band it slows, ignores, or avoids.
        </p>
        <p>
          That narrowness matters because it explains how behavior can look
          choosy without becoming abstract. Selectivity can emerge from a local
          tuning function long before it becomes an explicit category.
        </p>
      </ArticleSection>

      <FigureBlock
        caption="Move the preferred band, tighten it, flatten it, or invert it. The resulting behavior changes because value is encoded in the transfer function itself."
        figure="4b"
        label="Special tastes"
      >
        <ResponseCurveLab variant="sandbox" />
      </FigureBlock>

      <Callout label="Modern translation">
        <p>
          A large amount of what we call preference in software is really
          response shaping: thresholds, saturations, penalties, floor values,
          and preferred operating bands. The vocabulary becomes psychological
          only after the curve has already done its work.
        </p>
      </Callout>
    </ArticleShell>
  );
}
