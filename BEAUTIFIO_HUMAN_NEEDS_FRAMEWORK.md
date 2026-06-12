# BEAUTIFIO HUMAN NEEDS FRAMEWORK 1.0

**Date:** 2026-06-11
**Purpose:** Map every feature to established human psychology theory. Identify gaps. Guide future development toward what people actually need, not what is trendy.

---

## SELF DETERMINATION THEORY (Deci & Ryan, 2000)

**Core claim:** Humans thrive when three basic psychological needs are met — Autonomy, Competence, Relatedness.

### What human need does it solve?

The need for intrinsic motivation. People abandon goals not because they lack discipline, but because the activity does not fulfill these three needs. When any need is thwarted, motivation shifts from intrinsic ("I want to") to extrinsic ("I should") or amotivation ("why bother").

### Which Beautifio feature addresses it?

| Need | Beautifio Feature | How |
|------|------------------|-----|
| **Autonomy** (choice, volition) | Dream Discovery (Inspiration page) | The user chooses their own dream. No algorithm decides. No pre-built path is forced. The quiz guides but does not dictate. |
| **Autonomy** | Daily Activities | Activities are suggested, not required. Missing a day has no penalty. The user controls pace. |
| **Competence** (mastery, growth) | Big Win → Small Win progression | Each Small Win completion proves competence. The stage-gated hierarchy (beginner → intermediate → advanced → professional) provides escalating challenge, not escalating pressure. |
| **Competence** | Story Timeline | Looking back at completed wins, reflections, and pivots provides evidence of growth that the user cannot see day-to-day. |
| **Relatedness** (connection, care) | Support pillar (mentors, circles) | Planned: small accountability groups and curated mentor connections. Currently absent (see gaps below). |
| **Relatedness** | Familia (external resources) | Points users to real-world communities — a proxy for connection to people who share their journey. |

### What needs are still missing?

**Relatedness is almost entirely absent in the current build.** The app currently has no meaningful social feature. A user's journey is entirely solitary. There is no way to connect with others on a similar path, no mentor to ask for guidance, no community to share setbacks with.

**Autonomy is strong on dream choice but weak on daily choice.** The 6 daily activities are fully prescribed. The user has no input into what they work on each day. This works for the core audience (who wants structure), but may frustrate users who want to customize their path.

### Future opportunities

- **Opt-in circles.** Small (3-5 person) accountability groups organized by dream type and age range. Time-bounded (8-12 weeks). Topic-specific. No permanent social graph.
- **Mentor matching.** Curated mentors (real people, not AI) who have completed the dream path. 1-on-1 async check-ins. Not chat — structured prompts.
- **Autonomy customization layer.** Let users reorder their 6 daily activities or adjust difficulty once they've completed a Big Win and demonstrated competence.

---

## HOPE THEORY (Snyder, 1991)

**Core claim:** Hope is not an emotion — it is a cognitive process with three components: Goals, Pathways, and Agency. High-hope people can (1) set clear goals, (2) generate multiple pathways to reach them, and (3) maintain the motivation to pursue them.

### What human need does it solve?

The need for direction and persistence in the face of obstacles. Low-hope people see one path; when blocked, they give up. High-hope people see alternatives.

### Which Beautifio feature addresses it?

| Component | Beautifio Feature | How |
|-----------|------------------|-----|
| **Goals** | Dream (north star) + Big Wins (milestones) | The user always has a clear, articulated goal. The dream is the long-term goal; the Big Win is the current sprint. |
| **Pathways** | Big Win → Small Win → Daily Activity hierarchy | Every goal has a concrete path broken down into actions. The user never wonders "how do I get there?" — the path is visible. |
| **Pathways** | Pivot mechanics (Safe Space) | When a pathway is blocked (Big Win fails, dream doesn't fit), alternative futures surface transferable skills. The user sees multiple paths, not a dead end. |
| **Agency** | Daily completion + Story Timeline | Each completed action reinforces "I can do this." The Story Timeline provides retrospective agency — proof that the user has overcome obstacles before. |

### What needs are still missing?

**Pathways generation is currently one-size-fits-all.** Every user with the same dream gets the same Big Win progression. Hope Theory predicts that the ability to generate *personal* pathways is stronger than following prescribed ones. The current system builds pathway skill through consumption, not creation.

**Agency is not explicitly trained.** The app reinforces agency through completion (implicit) but does not teach the user how to generate their own motivation. If the app goes away, the user has not learned to self-generate agency.

### Future opportunities

- **Personal pathway remixing.** Let users reorder, add, or customize Small Wins within a Big Win once they've shown competence. This trains the pathway skill directly.
- **"Past Me" letters.** When a user completes a Big Win, show them a reflection they wrote before starting it. "You didn't think you could do this. Look at you now." Direct agency training.
- **Setback storytelling.** When a user pivots, generate a narrative: "You wanted X. You tried Y. You learned Z. Now you're pursuing W. That's not failure — that's growth." Makes pathway thinking visible.

---

## GROWTH MINDSET (Dweck, 2006)

**Core claim:** People with a growth mindset believe abilities can be developed through effort and learning. People with a fixed mindset believe abilities are innate and static. Mindset is not a personality trait — it is a belief that can be shaped by environment, feedback, and language.

### What human need does it solve?

The need to persist through challenge without internalizing failure as identity. Fixed-mindset people interpret difficulty as "I'm not good at this." Growth-mindset people interpret it as "I'm not good at this *yet*."

### Which Beautifio feature addresses it?

| Growth Mindset Element | Beautifio Feature | How |
|------------------------|------------------|-----|
| **Process praise over person praise** | "You completed X activities this week" vs "You're so smart" | The app never says "you're a natural" or "you're talented." It says "you showed up 5 days this week." |
| **Reframing failure as learning** | Failure/Pivot flow in Safe Space | Questions are "What did you learn?" not "What went wrong?" Transferable skills surface: "You learned [skill] — this helps with [alternative dream]." |
| **"Yet" framing** | Stage-gated Big Wins | Beginner → Intermediate → Advanced implies progression. You are not "not a programmer." You are "not a programmer yet." |
| **Effort as the path to mastery** | 6 daily activities | The system is built on daily effort, not talent. There is no shortcut. The only way forward is showing up. |

### What needs are still missing?

**The app does not actively teach growth mindset language.** It reinforces growth mindset through structure, but does not name it. The user may experience the benefit without understanding the framework — which is fine for engagement but limits transferable life skills.

**Fixed mindset triggers in daily life are not addressed.** The app works within its walls. When the user encounters a fixed-mindset teacher, parent, or peer in the real world, the app has no tool to help them reframe that interaction.

**Praise architecture is good but untested.** The celebration moments (Small Win completion, Big Win completion) have not been reviewed for growth-mindset-compliant language. A poorly worded celebration could accidentally trigger fixed mindset ("You're a natural!").

### Future opportunities

- **Mindset moments.** When the app detects a pattern (user missed 3 days, user kept failing the same activity type), surface a growth-mindset nudge: "This activity is hard. That means you're stretching. Stretching is how you grow."
- **Reframing tool.** A simple tool in Safe Space: user types "I'm bad at [X]" and the app reframes it to "I haven't learned [X] yet. What's one step I can take?"
- **Celebration language audit.** Review all celebration/confetti/success copy against Growth Mindset principles. Replace "You did it!" with "Your practice paid off." Replace "You're amazing" with "You showed up consistently."

---

## PERMA (Seligman, 2011)

**Core claim:** Wellbeing is not the absence of negative emotion — it is the presence of five measurable elements: Positive Emotion, Engagement (flow), Relationships, Meaning, and Accomplishment.

### What human need does it solve?

The need for a holistic definition of wellbeing. Before PERMA, psychology measured happiness as life satisfaction (a single score). PERMA recognizes that a person can have low Positive Emotion but high Meaning and still be thriving.

### Which Beautifio feature addresses it?

| PERMA Element | Beautifio Feature | How |
|---------------|------------------|-----|
| **Positive Emotion** | Reflection (what are you grateful for?) | Daily gratitude practice increases baseline positive emotion over time. |
| **Engagement (flow)** | Daily Activities | 6 focused activities per day create micro-flow states. The user is not multitasking — they are doing one thing at a time. |
| **Relationships** | Support pillar (planned) | Currently absent (see gaps). |
| **Meaning** | Dream (north star) | The entire app is organized around meaning. Every action connects to "why am I doing this?" |
| **Accomplishment** | Small Win + Big Win completions | Discrete, trackable achievements. The Story Timeline is a record of real accomplishment. |

### What needs are still missing?

**Relationships is a PERMA gap.** Three of the five elements are addressed well (Positive Emotion via reflection, Engagement via activities, Meaning via dream, Accomplishment via wins). But Relationships has no current feature. This is the single biggest gap in the app's psychological coverage.

**Positive Emotion is under-designed.** Currently limited to a single gratitude reflection prompt. No savoring, no joy cultivation, no positive reminiscence. The app processes setbacks beautifully (Safe Space) but does not actively cultivate positive emotion.

**Engagement (flow) is assumed but not measured.** The app assumes 6 daily activities create flow, but has no way to know if the user is in flow or bored. Activities that are too easy cause boredom; too hard cause anxiety. Flow lives in the middle.

### Future opportunities

- **Savoring practice.** A weekly prompt: "Pick one good thing that happened this week. Close your eyes and remember it for 30 seconds." Savoring is one of the most evidence-backed positive psychology interventions.
- **Flow calibration.** After each activity, ask "How was this?" (too easy / just right / too hard). Over time, calibrate activity difficulty to keep the user in the flow channel.
- **Relationships (see SDT section).** This is the most important PERMA gap to fill.

---

## BELONGING THEORY (Baumeister & Leary, 1995)

**Core claim:** The need to belong is a fundamental human motivation. People need frequent, positive interactions within a stable framework of ongoing concern for each other's welfare. Thwarted belonging leads to depression, anxiety, and physical health decline.

### What human need does it solve?

The need for social connection — not casual interaction, but *stable, caring relationships* where the person feels valued and understood. This is distinct from Relatedness in SDT (which is broader). Belonging is specifically about feeling *part of something*.

### Which Beautifio feature addresses it?

**Currently: None.** The app has zero belonging features. There is no way to feel like you are part of a community, a cohort, a shared mission, or even a pair.

| Feature | Status | How it could serve belonging |
|---------|--------|------------------------------|
| Mentors | Planned (deleted from legacy) | A mentor relationship is a stable, caring connection. One person who knows your journey and cares about your progress. |
| Circles | Planned (deleted from legacy) | A small group working toward similar dreams creates belonging. Shared struggle + shared progress = belonging. |
| Familia | Not built | A directory helps the user access real-world communities, which is the source of belonging — but the app itself does not provide it. |

### What needs are still missing?

**Everything.** This is the largest psychological gap in the product. Beautifio is a solo experience in a species that survived through connection. The Constitution explicitly prohibits social media mechanics — but social mechanics and belonging are not the same thing. The app has correctly rejected toxic social features but has not yet built healthy ones.

**Key risk:** A user processing a setback alone, with no one to share it with, may abandon the app precisely when they need support most. Safe Space provides internal tools but not human connection.

### Future opportunities

- **Alumni connection.** When a user completes a Big Win, offer to connect them with someone starting that Big Win. Asynchronous, structured, opt-in. "You were where they are 3 months ago. Want to share one thing you learned?"
- **Dream cohorts.** Users who start the same dream within the same month are placed in a cohort. No chat — shared timeline visibility. "5 other people started this dream this month. You're not alone." The user can opt to share progress (anonymously) with the cohort.
- **Setback solidarity.** When a user marks a Big Win as failed, show: "3 other people in your dream found this Big Win challenging. You are not failing alone." Anonymized, aggregate — no personal data exposed.
- **Family sharing (informed consent).** For younger users (13-17), an optional parent/guardian connection. The parent sees summary progress (not daily activities) — a dashboard of "your child is engaged and growing." This is not surveillance; this is support scaffolding.

**Critical constraint:** All belonging features must be opt-in, private-by-default, and avoid any mechanic that could create social comparison, popularity pressure, or performance anxiety. The Constitution's prohibition on social media mechanics is absolute. Belonging must never become performative.

---

## IKIGAI (Mitsuhashi, traditional)

**Core claim:** A meaningful life sits at the intersection of four questions: What you love (passion), What you are good at (profession), What the world needs (mission), and What you can be paid for (vocation). The overlap is *ikigai* — reason for being.

### What human need does it solve?

The need for existential meaning — not just happiness or accomplishment, but a coherent answer to "Why am I here?" Ikigai provides a framework for that answer that is accessible, visual, and non-denominational.

### Which Beautifio feature addresses it?

| Ikigai Element | Beautifio Feature | How |
|----------------|------------------|-----|
| **What you love** | Dream Discovery Quiz (passion questions) | The inspiration process asks what the user enjoys, what excites them, what they would do for free. |
| **What you are good at** | Skill accumulation through daily activities | The journey builds demonstrable skills. The Story Timeline makes them visible. |
| **What the world needs** | Dream categories (implicit) | Dreams like "Social Worker," "Environmental Activist," "Teacher" directly serve the world. But the app does not explicitly frame any dream this way. |
| **What you can be paid for** | Career dreams (implicit) | Many dreams are career-oriented (entrepreneur, programmer, designer). But the app does not explicitly map every dream to economic viability. |

### What needs are still missing?

**The ikigai framework is not named or visualized.** The app's dream structure implicitly covers all four quadrants, but no feature helps the user find their *overlap*. A user could pursue a dream they love but does not pay, and never be prompted to consider economic sustainability.

**"What the world needs" is not explicitly addressed.** The app has no framing around social contribution, legacy, or service. For the user who wants to make a difference, the app does not help them connect their dream to a need in the world.

**Economic viability is not addressed.** For some users (especially older teens and young adults), the question "Can I make a living doing this?" is critical. The app is silent on this.

**There is no "ikigai check-in."** The concept of periodically revisiting the four questions to see if they still align is missing. Dreams change; the ikigai intersection shifts. The app only checks alignment at dream selection, not during the journey.

### Future opportunities

- **Ikigai visualization.** A simple radar chart or Venn diagram in the Profile or Inspiration page. User rates themselves on the four dimensions. The overlap area is highlighted. Re-do this every 6 months.
- **Mission framing.** Add "How does this dream help others?" as a reflection prompt periodically. Not required — but available for users who want meaning beyond personal growth.
- **Economic pathway.** For career-oriented dreams, add a "Reality Check" Big Win: research salaries, required qualifications, job market in your area. This is practical, not discouraging. Users can opt in.
- **Quarterly ikigai review.** Prompt: "Your dream was [X]. Do you still love it? Are you getting better? Is it helping anyone? Can it sustain you?" Surface drift early so pivots are intentional, not crisis-driven.

---

## RESILIENCE THEORY (Masten, 2001; Bonanno, 2004)

**Core claim:** Resilience is not a personality trait — it is a set of processes and resources that can be built. The key factors are: positive relationships, problem-solving skills, self-regulation, meaning-making, and access to resources. Resilience is ordinary, not extraordinary.

### What human need does it solve?

The need to recover from adversity. Not to avoid it, not to be "tough" — but to bend without breaking, to learn from the experience, and to emerge with unchanged or increased capability.

### Which Beautifio feature addresses it?

| Resilience Factor | Beautifio Feature | How |
|-------------------|------------------|-----|
| **Problem-solving skills** | Big Win → Small Win decomposition | The user learns to break large problems into manageable pieces. This is the foundational skill of resilience. |
| **Self-regulation** | Daily activities (consistent practice) | Showing up daily, even for 5 minutes, builds self-regulation muscle. The user learns to act despite mood. |
| **Meaning-making** | Reflection (what did I learn?) + Safe Space (failure processing) | Every setback is processed through meaning-making questions. "What did I learn?" is the core resilience question. |
| **Access to resources** | Familia (planned) | Curated directory of real-world support resources. Currently absent. |
| **Positive relationships** | Support pillar (planned) | Currently absent (consistent gap). |

### What needs are still missing?

**Positive relationships — the #1 predictor of resilience — is missing.** Masten's research is clear: the single most protective factor for a child or young adult is a stable, caring relationship with at least one competent adult. The app has no way to provide or facilitate this.

**Self-regulation is practiced but not taught.** The app structures daily practice but does not help the user understand *why* showing up matters for resilience. The skill is built implicitly but the user may not recognize it as a transferable life skill.

**Problem-solving through adversity is reactive, not proactive.** Safe Space activates *after* a setback. The user learns to process failure but does not practice resilience in low-stakes scenarios before the real test comes.

**Access to resources (Familia) does not exist yet.** Resilience research consistently shows that knowing where to find help is itself a protective factor. Not having this feature means the app cannot even point users toward help.

### Future opportunities

- **Resilience narrative generation.** When the user completes a Big Win or navigates a pivot, generate a "Resilience Card": "You faced [X]. You did [Y]. You learned [Z]. You are more capable than you were before." This text is stored in the Story Timeline and becomes a library the user can draw from during future setbacks.
- **Low-stakes failure practice.** Periodic optional challenges: "Try something you'll probably fail at today. Write down what you learned." Normalizes failure as practice for the big moments.
- **Safe Space expansion — crisis protocol.** For moments when the app detects high distress (user language analysis with explicit opt-in), surface resources: crisis hotlines, mental health services, Familia entry. The app does NOT provide therapy but can point toward help.
- **The "Ordinary Magic" framing.** Masten calls resilience "ordinary magic" because it comes from ordinary resources, not extraordinary heroism. Surfacing this to the user — "You don't need to be a hero. You just need to do one small thing today." — could be deeply reassuring.

---

## SUMMARY: GAPS ACROSS ALL THEORIES

| Gap | Theories Affected | Current Status | Priority |
|-----|------------------|---------------|----------|
| Social connection (healthy, non-toxic belonging) | SDT (Relatedness), PERMA (Relationships), Belonging (core), Resilience (relationships) | **Absent** | CRITICAL |
| Positive emotion cultivation (savoring, joy) | PERMA (Positive Emotion) | **Weak** (only gratitude prompt) | HIGH |
| Self-regulation *teaching* (not just practice) | Resilience (self-regulation) | **Implicit only** | MEDIUM |
| Economic / practical pathway for dreams | Ikigai (vocation) | **Absent** | MEDIUM |
| Flow calibration (activity difficulty tuning) | PERMA (Engagement) | **Absent** | MEDIUM |
| Growth mindset language naming | Growth Mindset | **Implicit only** | LOW |
| Proactive resilience practice | Resilience | **Absent** | LOW |
| Ikigai visualization / quarterly review | Ikigai | **Absent** | LOW |
| Crisis protocol (mental health resources) | Resilience (access to resources) | **Absent** | HIGH (if user distress is detected) |

---

## THE GOLDEN THREAD

Across all seven theories, a single pattern emerges:

> Beautifio is excellent at **structure, meaning, and reflection** but absent in **connection, community, and shared experience.**

The app builds a room of your own (Constitution) — and that is exactly right for the core daily practice. But no one thrives in isolation forever. The belonging gap is not a bug — it is the next frontier.

When Beautifio adds healthy, opt-in, non-performative connection features, it will fulfill not one but five of these seven theoretical frameworks fully. Until then, the app excels at the individual half of human flourishing and neglects the relational half.

**The next feature should be belonging. Not social media. Belonging.**
