# NRUI Core

NRUI is a new UI programming model that treats user input as forks in Reality instead of mutations or events. It ships a renderer-agnostic core, a DOM renderer, and minimal examples that respect the NRUI constitution.

## Model
See [MODEL.md](MODEL.md) for the constitution, ontology, and design notes.

## Structure
- `core/`: reality chain, queries, UI AST, observation utilities.
- `renderer/`: DOM interpreter for UI AST with fork bindings.
- `examples/`: small snippets demonstrating forked realities.
- `tests/`: deterministic and purity-focused checks.

## Getting Started
```bash
npm install
npm test
```

To render, pair a `View` with a `Reality` and hand the resulting UI AST to `renderDOM` with a fork emitter:
```ts
import { createReality, forkReality } from './core/reality';
import { observe } from './core/observe';
import { renderDOM } from './renderer/dom';
import { element, text } from './core/ui';

const view = (context) =>
  element('button', [text(`clicks: ${context.times('click')}`)], {
    forkBind: { id: 'click', activation: 'click' },
    props: { attributes: { type: 'button' } },
  });

const reality = forkReality(createReality(), 'click');
const ui = observe(view, reality);
renderDOM(document.getElementById('app')!, ui, { fork: (id, payload) => console.log('fork', id, payload) });
```
