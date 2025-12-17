# NRUI Model

NRUI is a UI programming model that rejects stateful mutation, time-based lifecycles, and event-driven logic. It treats user input as forked realities and renders purely from immutable histories.

## Constitution
- **C1 No State**: No stored application values. Reality only keeps fork records.
- **C2 No Time**: No lifecycle or ticks; observation is timeless.
- **C3 No Events**: User input creates forks; it does not mutate values.
- **C4 Queries Are Pure**: `Query<T>` is `(RealityContext) => T` with no caching that alters meaning.
- **C5 Observation Is Pure**: `observe(view, reality)` returns UI AST only, never touching the host.
- **C6 Layer Separation**: `core/` is renderer-agnostic; `renderer/` holds all host effects.

## Ontology
- **Reality**: Persistent, immutable chain of fork records. Each fork is `{ id, payload? }` and optional parent link for branching.
- **Fork**: Declaration of a new possible world. Payload contains raw input only.
- **RealityContext**: Read-only API derived from a Reality: `has(id)`, `times(id)`, `occurrences(id)`, `history()`.
- **Query<T>**: Pure function from `RealityContext` to `T`.
- **Observation**: Pure projection `(RealityContext) => UI AST` via `View` functions.
- **UI AST**: Internal structure describing `element`, `text`, or `fragment`, plus optional `forkBind` descriptor interpreted by renderers.
- **Renderer**: Converts UI AST to an output surface; host activation only emits forks.

## Design Notes
- Reality is implemented as a persistent parent chain. Forking yields a new Reality that references its parent and a fork record.
- The DOM renderer interprets `forkBind` descriptors to create new forks on host activation while extracting raw input payloads when requested.
- `explain(view, reality)` wraps context reads to trace which RealityContext operations a view relies on.
