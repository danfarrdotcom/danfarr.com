# Vehicles, Translated

Implementation brief for a Braitenberg-inspired interactive article series on `danfarr.com`.

## Goal

Create a flagship series of interactive essays that takes each chapter in _Vehicles: Experiments in Synthetic Psychology_ and reinterprets its core mechanism through original writing and browser-based simulations.

This should feel like a native continuation of the existing interactive essays on the site, not a separate publishing system.

## Product Decision

Use the existing `scribbles` pattern as the primary publication format.

Reasons:

- The current Notion-backed article route is good for static essays, but it does not support tightly integrated interactive figures.
- The existing `scribbles` pages already establish the right format: a strong conceptual thesis, dense original prose, and multiple simulations embedded inline.
- A Braitenberg series will benefit from a shared simulation engine and reusable article shell rather than a block renderer.

## Audience

- Engineers who like cybernetics, AI, robotics, and distributed systems
- Technical readers who want conceptual depth without academic framing
- Curious generalists who enjoy interactive explanations more than formal textbooks

## Editorial Promise

Each entry should do four things:

1. State the original mechanism clearly.
2. Translate it into modern computational language.
3. Let the reader manipulate the mechanism directly.
4. Show how complexity emerges from very small changes in wiring, state, or environment.

These should be original essays and original simulations. Avoid chapter-by-chapter paraphrase. Use only brief quotation where necessary.

## Series Shape

### Core series

- `Intro`: why Braitenberg still matters
- `Vehicle 1`: Getting Around
- `Vehicle 2`: Fear and Aggression
- `Vehicle 3`: Love
- `Vehicle 4`: Values and Special Tastes
- `Vehicle 5`: Logic
- `Vehicle 6`: Selection, the Impersonal Engineer
- `Vehicle 7`: Concepts
- `Vehicle 8`: Space, Things, and Movements
- `Vehicle 9`: Shapes
- `Vehicle 10`: Getting Ideas
- `Vehicle 11`: Rules and Regularities
- `Vehicle 12`: Trains of Thought
- `Vehicle 13`: Foresight
- `Vehicle 14`: Egotism and Optimism

### Recommended launch order

- `Intro`
- `Vehicle 1`
- `Vehicle 2`
- `Vehicle 3`
- `Vehicle 4`

This batch gives the fastest payoff because the behaviors are visible, simulator-friendly, and easy to explain without heavy internal state.

## Routing Plan

Add a dedicated series area instead of mixing these into one-off scribbles.

### Proposed routes

- `app/essays/braitenberg/page.tsx`
- `app/essays/braitenberg/intro/page.tsx`
- `app/essays/braitenberg/vehicle-1-getting-around/page.tsx`
- `app/essays/braitenberg/vehicle-2-fear-and-aggression/page.tsx`
- `app/essays/braitenberg/vehicle-3-love/page.tsx`
- `app/essays/braitenberg/vehicle-4-values-and-special-tastes/page.tsx`

Continue this route pattern for vehicles 5 through 14.

### Why a nested route

- Keeps the series coherent as a body of work
- Makes it easy to add series navigation, progress state, and a landing page
- Avoids cluttering `app/essays/` with 15 sibling entries

## File Structure

Recommended initial structure:

```text
app/
  scribbles/
    braitenberg/
      page.tsx
      intro/
        page.tsx
      vehicle-1-getting-around/
        page.tsx
      vehicle-2-fear-and-aggression/
        page.tsx
      vehicle-3-love/
        page.tsx
      vehicle-4-values-and-special-tastes/
        page.tsx
components/
  braitenberg/
    article-shell.tsx
    figure-block.tsx
    control-row.tsx
    series-nav.tsx
    series-card.tsx
    callout.tsx
lib/
  braitenberg/
    content.ts
    series.ts
    engine.ts
    fields.ts
    vehicles.ts
    presets.ts
```

## Shared Component Plan

### `article-shell.tsx`

Reusable frame for:

- title
- dek
- reading time
- series label
- previous and next links
- optional intro note

### `figure-block.tsx`

Reusable figure wrapper for:

- figure number
- figure label
- canvas area
- short explanatory caption
- optional controls

### `control-row.tsx`

Simple sliders and toggles with consistent formatting across figures.

### `series-nav.tsx`

Navigation for:

- previous entry
- next entry
- return to series index

### `series-card.tsx`

Landing-page cards for each entry with:

- title
- one-line hook
- status such as `planned`, `draft`, `published`

### `callout.tsx`

Shared block for:

- key concept
- implementation note
- modern parallel
- warning about over-interpreting the metaphor

## Engine Plan

Build one reusable simulation engine for vehicles 1 through 4 before writing one-off article code.

### Engine responsibilities

- maintain world state
- place sources and obstacles
- update sensors
- compute motor output from wiring
- advance vehicle movement
- expose parameters for interactive controls
- render to canvas

### Initial engine model

Support:

- `Vehicle`: position, heading, velocity, radius
- `Sensor`: relative position, orientation, modality, sensitivity
- `Motor`: side, gain, saturation
- `Connection`: sensor-to-motor edge with sign and gain
- `Field`: scalar source map such as light, heat, or attractor intensity
- `World`: dimensions, obstacles, friction, noise

### Minimum API sketch

```ts
type ConnectionSign = 'excitatory' | 'inhibitory';

type BraitenbergSensor = {
  id: string;
  angleOffset: number;
  distance: number;
  gain: number;
};

type BraitenbergMotor = {
  id: 'left' | 'right' | 'single';
  gain: number;
  min: number;
  max: number;
};

type BraitenbergConnection = {
  sensorId: string;
  motorId: string;
  sign: ConnectionSign;
  weight: number;
};

type BraitenbergPreset = {
  sensors: BraitenbergSensor[];
  motors: BraitenbergMotor[];
  connections: BraitenbergConnection[];
  world: WorldConfig;
  vehicle: VehicleConfig;
};
```

The first version does not need to model every later chapter. It only needs enough structure to cover:

- one-sensor one-motor behavior
- same-side versus crossed connections
- excitatory versus inhibitory wiring
- tunable field strength, friction, and noise

## Content Metadata Plan

Add a single source of truth for the series.

### `lib/braitenberg/series.ts`

Store:

- slug
- chapter number
- title
- short hook
- status
- previous slug
- next slug

This keeps navigation and landing-page cards stable without hand-editing multiple files.

## Editorial Template

Every article should use the same narrative skeleton.

### Section order

1. Hook
2. What Braitenberg is showing
3. Why it still matters
4. First interactive figure
5. Parameter variation
6. Modern computational parallel
7. Open sandbox
8. What to notice
9. Next in series

### Voice

- precise, unsentimental, interpretive
- modern terminology where it clarifies
- no inflated claims about intelligence
- strong emphasis on observer over-attribution

## Visual Direction

Keep continuity with existing scribbles, but make the Braitenberg series visually distinct.

### Recommended treatment

- pale technical background rather than pure white
- restrained diagram labels
- simulation canvases with strong contrast
- compact control rows under figures
- consistent figure numbering across the series

The series should feel like a lab notebook, not a blog theme.

## Vehicle 1 Production Brief

### Working title

`Vehicle 1: Restlessness in a Temperature Field`

### Core claim

The smallest possible sensorimotor loop already invites psychological interpretation.

### Reader takeaway

Readers should leave understanding that apparent behavior can emerge from nothing more than:

- one sensor
- one motor
- one field
- friction
- a little noise

### Page structure

#### Opening hook

Possible opening:

> A machine with one sensor and one motor should not feel alive. Braitenberg's point is that it only takes a few seconds for an observer to start inventing motives anyway.

#### Section 1: The mechanism

Explain:

- one sensor measures scalar intensity
- one motor speed is proportional to sensed intensity
- movement direction is fixed unless perturbed
- friction and asymmetry create trajectories that look purposeful

#### Figure 1: Bare mechanism

Show:

- a single vehicle in a scalar field
- no toggles except start and reset
- optional source marker

Caption focus:

- more signal means more speed, not more intelligence

#### Section 2: Why it looks alive

Discuss:

- drift
- overshoot
- environmental asymmetry
- the observer's habit of projecting intention onto motion

#### Figure 2: Friction and noise

Controls:

- friction
- perturbation noise
- field intensity

What the reader should notice:

- slightly different physical assumptions produce different "temperaments"

#### Section 3: Modern translation

Map the chapter to:

- reactive control loops
- policy without representation
- local coupling between perception and action
- why simple agents can still be behaviorally rich

#### Figure 3: Draw the world

Allow:

- moving the source
- adding warm and cold regions
- resetting the vehicle orientation

Purpose:

- make the environment visibly co-author the behavior

#### Sandbox

Expose:

- source position
- noise
- friction
- sensor gain
- motor gain

Optional:

- trail rendering to make drift legible

#### Closing

Land on:

- the vehicle is not "seeking" or "avoiding" in any rich sense
- but the appearance of character arrives far earlier than intuition expects

### Vehicle 1 implementation notes

- Keep the sim visually minimal
- Make parameter effects large enough to feel immediately
- Avoid overcrowding with controls
- Favor one convincing mechanism over a wide feature surface

## First Engineering Milestone

### Scope

Ship the series foundation and the first article.

### Includes

- series landing page
- shared article shell
- shared figure block
- `lib/braitenberg/series.ts`
- `lib/braitenberg/engine.ts`
- `Vehicle 1` page with 3 figures and 1 sandbox
- homepage link to the series landing page

### Excludes

- Notion integration
- analytics work
- search
- progress persistence
- vehicles 5 through 14

## Second Engineering Milestone

### Scope

Extend the engine for vehicles 2 through 4.

### Includes

- same-side and crossed two-motor setups
- excitatory and inhibitory wiring
- preset switching
- shared controls for connection sign and weight
- 3 additional published entries

## Risks

### Editorial risk

The series can drift into summary rather than interpretation.

Mitigation:

- each article must make one strong modern claim
- each figure must teach one specific mechanism

### Product risk

Building each simulation ad hoc will create maintenance debt fast.

Mitigation:

- invest in the shared engine before publishing more than one vehicle

### Scope risk

Vehicles 7 through 14 may require more internal state and less visually obvious behavior.

Mitigation:

- do not overdesign for later chapters yet
- build only enough abstraction for vehicles 1 through 4 in the first pass

## Recommended Immediate Next Steps

1. Add the series metadata file and landing page.
2. Build the shared article shell and figure block.
3. Implement the first pass of the Braitenberg engine.
4. Draft and publish `Vehicle 1`.
5. Reuse the engine for `Vehicle 2` and `Vehicle 3` before expanding abstraction further.

## Notes For Future Companion Posts

If companion content is published on other sites, keep it short and derivative of the main essay:

- one narrow idea from the article
- one still image or short clip from a simulation
- clear link back to the canonical `danfarr.com` version

Do not split the main interactive experience across multiple sites.
