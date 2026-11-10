# Components: atomic design

Atomic design (Brad Frost) splits UI into levels. Each level is built **only** from lower levels, so it's clear where to look and where to add.

```
atoms        components/ui/         domain-agnostic, 1 HTML element + styles
molecules    components/molecules/  a few atoms = one function (code block, card)
organisms    components/viz/        self-contained sections: visualizations, nav, hero
             components/site/
             components/lesson/
templates    components/site/Slide  board skeleton
pages        app/**/page.tsx        only compose organisms + content
```

## Atoms (`components/ui`)

| Component | When |
|---|---|
| `Badge` (`tone`: neutral/brand/hit/miss/focus) | status, activity type, short label |
| `Button` (`variant`: primary/ghost, `asChild`) | action; `asChild` + `<Link>`/`<a>` for navigation (Radix Slot) |
| `Panel` | every "glass" rectangle: card, window, visualization background |
| `Eyebrow` | section overline, always mono and uppercase |
| `Kbd` | keyboard shortcut |
| `Tex` | LaTeX formula rendered by KaTeX at build time; `display` for a block formula |

## Molecules (`components/molecules`)

| Component | When |
|---|---|
| `SectionHeading` | **every** section starts with it |
| `CodeBlock` (async, server) | code; `highlight={[n]}` marks lines (1-based) |
| `CodeTabs` | same example in several variants (Radix Tabs, pill with `layoutId`) |
| `Terminal` | cell output; lines appear on entering viewport; `wrap={false}` for tables |
| `Callout` (`insight` / `warning`) | one takeaway or one pitfall; max 1 per slide |
| `Formula` | formula in a panel with a symbol legend: `<Formula tex={String.raw`…`} legend={[[sym, text]]} />` |
| `LessonCard` | lesson tile on the home page |
| `StableHeight` | reserves the height of the tallest variant at the current width (variants rendered invisibly in the same grid cell); `fill` / `hug` / `overlay`; use instead of fixed `h-*` wherever content changes per step, tab or selection |
| `StableSteps` | wraps a step animation and renders invisible copies forced to chosen steps (default last, via `ForcedStepContext` in `useStepper`); reserves the height of growing animations without changing their code |
| `CypherCode` | Cypher with client-side highlighting; `mark` highlights fragments for animation steps, `lines` whole lines, `wrap` for narrow cards |
| `JsonBlock` | multi-line JSON or code in a narrow card: wrapped lines keep their indent; optional highlighted fragment |
| `Markdown` | repo README in site style (single source of truth) |
| `notebook/NotebookView` | `.ipynb` section by section: markdown, code, saved outputs, plots |
| `StepControls` + `lib/useStepper.ts` | step-by-step animation (pass `labels` = all step descriptions so the label keeps the height of the longest): `const s = useStepper(total, { autoplay?, interval? })` → `{ ref, step, total, playing, next, prev, go, reset, toggle }`; `<div ref={s.ref}>` + `<StepControls stepper={s} label={…} slider? />`. Starts on Play or a manual step (default; DESIGN.md: no autoplay); `autoplay: true` plays once on entering view and any manual step stops it, reduced motion shows the last step; `slider` replaces dots for long processes |
| `StickySteps` | `StepControls` stuck under the navbar while the panel is visible (`<StickySteps stepper={s} … />`, takes `s.ref` itself). Use for animations taller than the viewport; the step description lives in the bar (highlighted, fixed two-line height) |

## Organisms

| Component | Shows |
|---|---|
| `viz/SamplingViz` | generation: temperature → top-k → top-p → sampling, table of successive generations |
| `viz/TokenizerViz` | text split by a real tokenizer (Radix ToggleGroup) |
| `viz/EmbeddingSpace` | words in 2D, toggle: t-SNE projection / radial view (distance from the selected word = 1 − cos); neighbors computed on full vectors |
| `viz/VectorSpace3D` | two vectors in 3D (orthographic, rotating camera) and four measures: cosine, dot, L2, L1 |
| `viz/VectorSearchViz` | query → scan all vectors → top-k (computed live) |
| `viz/ContextSpace` | cat / dog / kitten in contexts, two models; triangle with exact distances (law of cosines) |
| `viz/MiniGraph` | knowledge graph drawn edge by edge, highlighted answer path |
| `viz/HeroConstellation` | home hero decoration from real embeddings |
| `viz/GradingBar` | 100 points as a segmented bar |
| `viz/ChunkingViz` | real document split by RecursiveCharacterTextSplitter: chunk_size slider, overlap toggle; overlapping text has a two-colour background (top: previous chunk, bottom: next) |
| `viz/QuerySpaceViz` | question → embedding → point among 60 chunks (t-SNE) → top-k neighbours |
| `viz/ChromaRecordsViz` | Chroma record fields, distance sort, `where` filter dims outdated records |
| `viz/RagPipelineViz` | RAG step by step: question → embedding → top-k with metadata filter → prompt → answer (from notebook output) |
| `viz/PromptBuildViz` | RAG prompt assembled chunk by chunk with token counter |
| `viz/TfIdfViz` | TF-IDF worked example: three short documents, one query, tf / df → idf / sum table computed in code |
| `viz/Bm25StepsViz` | BM25 step by step: tokenization with 6-char stemming, IDF, per-word score sum |
| `viz/HybridRankViz` | vector / BM25 / RRF rankings of one query side by side; exports `QueryToggle`, `RankRow`, `GOLD` |
| `viz/RrfStepsViz` | two rankings → 1/(60+pos) → fused order |
| `viz/RerankViz` | 10 hybrid candidates reordered by a cross-encoder, with rank deltas |
| `viz/EvalMetricsViz` | hit@1 and MRR accumulated question by question for 4 methods |
| `viz/JudgeViz` | LLM judge verdicts F/C incl. control cases |
| `viz/ReplayFlow` | shared skeleton: replays a saved agent run step by step (token moves between diagram nodes, event log on the right, Play/step controls); parallel nodes via `FlowEvent.also`, dashed conditional edges, optional per-node width `w` |
| `viz/AgentLoopViz` | ReAct loop question → thinking → action → observation → back to thinking → answer, replayed from the `web:react` output (or any `parseReact` events via `events`) |
| `viz/ChainViz` | LangChain chain as a fixed row of steps, no branches or loop |
| `viz/GraphRunViz` | LangGraph `__start__` → model ⇄ tools → `__end__`, state message count, replayed from `graph.stream` |
| `viz/ContextGrowthViz` | prompt tokens per agent call as stacked bars (tool defs, system, question, tool calls, tool results) |
| `viz/RagVsAgenticViz` | classic RAG (always one search) vs agentic RAG (model decides queries) on three questions |
| `viz/ToolCallAnatomyViz` | one tool call step by step: tool schema → model `tool_calls` → app executes → `role=tool` message, matching id highlighted |
| `viz/ParallelCallsViz` | several tool calls in one model response, results sent back together; `web:parallel` |
| `viz/HarnessViz` | agent harness around the model; `react()` steps highlight diagram part and code lines |
| `viz/MemoryViz` | same scenario twice with two `thread_id`s: checkpointer only, then with a store between the threads |
| `viz/ExtractionViz` | CV text → highlighted entities → nodes → edges → whole graph from all CVs, step by step |
| `viz/TalentGraph` | TalentMatch graph; Cypher query executed step by step, click a node for neighbors |
| `viz/TableVsGraph` | „who worked with Anna” step by step as SQL JOINs over tables and as Cypher over the small graph |
| `viz/SmallGraph` | atom: the small graph from `web:cypher-create` with node/edge properties; active elements, result rings, `compact` for narrow columns |
| `viz/GraphModelViz` | the same small graph as graph, as relational tables, and as a SQL-vs-Cypher query; all views stacked in one grid cell so switching never changes height |
| `viz/CypherNotationViz` | Cypher notation of each node and relation (variable, label, type, properties, direction), then the whole CREATE |
| `viz/CypherSyntaxViz` | list of Cypher examples from `web:cypher-syntax`; each runs clause by clause on the small graph, last step shows the saved result |
| `viz/MatchQueryViz` | long RFP matching query clause by clause with intermediate rows (collect, list comprehension, met/available, filter, result) |
| `viz/RagCompareViz` | same question in RAG, structured RAG (metadata filter + vectors) and agentic GraphRAG: what each system saw and its answer, fixed-height columns |
| `viz/DedupViz` | raw entity names merging into canonical nodes (layoutId) |
| `viz/McpIntroViz` | `McpWhyViz` (M×N integrations → M+N with MCP, stepwise) and `McpArchitectureViz` (host, clients, local/remote servers, static) |
| `viz/McpMessagesViz` | JSON-RPC sequence (initialize → tools/list → tools/call) replayed from the notebook log, step explanation + formatted JSON |
| `viz/ActorSequence`, `ModeSequence` | participants as columns, steps as arrows; `ModeSequence` keeps all variants in one grid cell (same card size), optional external `value`; used by `McpFlows` (primitives, transport, security) |
| `viz/ArchitecturesViz` | supervisor, handoff, orchestrator–workers, writer–critic as LangGraph graphs (`ReplayFlow`, dashed conditional edges), replayed from saved runs |
| `viz/CostCompareViz` | static boxplots per architecture (calls, tokens, time), dots = runs coloured by correctness |
| `viz/internals/NetworkDiagram` | molecule: decoder schema text → tokens → embedding → N blocks → output; `links`, `lit` (animation), `moe` variant |
| `viz/internals/BpeViz` | BPE trained on a paragraph (tokens grow, vocab with IDs), then encoding a new text token by token; GPT-2 tokens of the prompt |
| `viz/internals/RopeViz` | RoPE on a prompt token's embedding: 4 pairs, angle = position · θ, cos/sin table |
| `viz/internals/QkvViz` | one attention head step by step: X, W_Q/W_K/W_V (fixed), Q/K/V, scores, softmax, P·V |
| `viz/internals/AttentionViz` | real attention weights of 3 heads, clickable query token, causal mask |
| `viz/internals/BlockViz` | transformer block parts (LayerNorm, attention, residual, MLP) and layer specialization |
| `viz/internals/ResidualViz` | residual stream heatmap per layer, per-layer change, logit lens of last token |
| `viz/internals/TrainingViz` | small char-level GPT training: loss curve and samples per step |
| `viz/internals/GenerationViz` | generation rounds animated on NetworkDiagram, top-5 distribution, greedy append |
| `viz/internals/MoeViz` | Mixture of Experts: router top-2 of 8 experts per token (illustrative weights) |
| `viz/internals/GemmaEViz` | Gemma „E”: Per-Layer Embeddings off the accelerator, MatFormer nested widths |
| `viz/SkillathonTimer` | 90-min skillathon timeline: current phase, countdown, keys S/N/P/R (projector during class) |
| `viz/SkillAnatomy` | SKILL.md split into parts; selecting one explains it and when it enters the agent context |
| `viz/EncryptedBrief` | Markdown encrypted in the repo (PBKDF2 + AES-GCM), decrypted in the browser with a password given in class; password not stored (hidden again after reload) |
| `site/SiteNav`, `site/Breadcrumbs`, `site/Slide`, `site/PresenterKeys`, `site/BackgroundMesh` | page frame, breadcrumbs, keyboard navigation |
| `lesson/HeroTitle` | opening title with word animation |

## Writing a component

- Comment above it: **level + one sentence on its purpose** (`/** Molekuła: … */`, comments in Polish).
- `"use client"` only when state, effects or motion are needed. `CodeBlock` and pages stay server components.
- Minimal props. Instead of 10 flags, make a second component.
- Join classes with `cn()` from `lib/cn.ts`. Accept `className` for outside positioning.
- `lib/useMediaQuery.ts`: `useNarrow()` (phone layout of SVG visualizations). `lib/labelLayout.ts`: `layoutLabels()` places point labels without overlaps.
- Interactions (slider, toggle, tabs, tooltip, dialog) always via a **Radix** primitive for free keyboard accessibility.
