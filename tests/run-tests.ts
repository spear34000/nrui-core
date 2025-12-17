import assert from 'assert';
import { createReality, createRealityContext, forkReality } from '../core/reality';
import { observe, explain } from '../core/observe';
import { element, text, fragment, UINode } from '../core/ui';
import { View } from '../core/view';
import { Query, runQuery } from '../core/query';
import { renderDOM } from '../renderer/dom';

class StubEvent {
  constructor(public type: string, public target?: StubElement) {}
}

class StubNode {
  parentNode: StubElement | StubDocumentFragment | null = null;
  get textContent(): string {
    return '';
  }
}

class StubText extends StubNode {
  constructor(public value: string) {
    super();
  }
  get textContent(): string {
    return this.value;
  }
}

class StubDocumentFragment extends StubNode {
  childNodes: StubNode[] = [];

  appendChild(node: StubNode): StubNode {
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  get textContent(): string {
    return this.childNodes.map((c) => c.textContent).join('');
  }
}

class StubElement extends StubNode {
  attributes: Record<string, string> = {};
  dataset: Record<string, string> = {};
  style: Record<string, string> = {};
  childNodes: StubNode[] = [];
  eventListeners: Record<string, Array<(e: StubEvent) => void>> = {};

  constructor(public tagName: string, private owner: StubDocument) {
    super();
  }

  setAttribute(key: string, value: string) {
    this.attributes[key] = value;
  }

  appendChild(node: StubNode): StubNode {
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  removeChild(node: StubNode) {
    this.childNodes = this.childNodes.filter((child) => child !== node);
    node.parentNode = null;
  }

  get firstChild(): StubNode | null {
    return this.childNodes[0] ?? null;
  }

  querySelector(tag: string): StubElement | null {
    for (const child of this.childNodes) {
      if (child instanceof StubElement && child.tagName === tag) {
        return child;
      }
      if (child instanceof StubElement) {
        const match = child.querySelector(tag);
        if (match) return match;
      }
    }
    return null;
  }

  addEventListener(name: string, handler: (e: StubEvent) => void) {
    if (!this.eventListeners[name]) {
      this.eventListeners[name] = [];
    }
    this.eventListeners[name].push(handler);
  }

  dispatchEvent(event: StubEvent) {
    const listeners = this.eventListeners[event.type] ?? [];
    for (const handler of listeners) {
      handler(event);
    }
  }

  get ownerDocument(): StubDocument {
    return this.owner;
  }

  get textContent(): string {
    return this.childNodes.map((c) => c.textContent).join('');
  }
}

class StubDocument {
  private root: StubElement | null = null;

  createElement(tag: string): StubElement {
    return new StubElement(tag, this);
  }

  createTextNode(value: string): StubText {
    return new StubText(value);
  }

  createDocumentFragment(): StubDocumentFragment {
    return new StubDocumentFragment();
  }

  getElementById(id: string): StubElement | null {
    if (this.root && this.root.attributes['id'] === id) {
      return this.root;
    }
    return null;
  }

  attachRoot(element: StubElement) {
    this.root = element;
  }
}

type Test = { name: string; run: () => void };
const tests: Test[] = [];
const addTest = (name: string, run: () => void) => tests.push({ name, run });

addTest('deterministic observation for identical reality', () => {
  const view: View = (context) =>
    element('div', [text(`seen:${context.times('a')}`)], { props: { attributes: { id: 'root' } } });

  const reality = forkReality(createReality(), 'a');

  const first = observe(view, reality);
  const second = observe(view, reality);

  assert.deepStrictEqual(first, second);
});

addTest('query purity across repeated calls', () => {
  const reality = forkReality(forkReality(createReality(), 'x'), 'y');
  const context = createRealityContext(reality);

  const countX: Query<number> = (ctx) => ctx.times('x');
  const historyCopy: Query<string[]> = (ctx) => ctx.history().map((entry) => entry.id);

  assert.strictEqual(runQuery(countX, context), runQuery(countX, context));
  assert.deepStrictEqual(runQuery(historyCopy, context), runQuery(historyCopy, context));
});

addTest('explain traces context reads', () => {
  const view: View = (context) => {
    const seen = context.has('tap');
    const occurrences = context.occurrences('tap');
    const count = context.times('tap');
    return element('section', [text(`${seen}:${occurrences.length}:${count}`)]);
  };

  const reality = forkReality(createReality(), 'tap');
  const result = explain(view, reality);

  assert.strictEqual(result.trace.entries.length, 3);
  assert.deepStrictEqual(result.trace.entries[0], { op: 'has', id: 'tap' });
  assert.deepStrictEqual(result.trace.entries[1], { op: 'occurrences', id: 'tap' });
  assert.deepStrictEqual(result.trace.entries[2], { op: 'times', id: 'tap' });
});

addTest('renderer binds fork creation with payload extraction', () => {
  const document = new StubDocument();
  const target = new StubElement('div', document);
  target.setAttribute('id', 'app');
  document.attachRoot(target);

  const viewNode = element(
    'input',
    [],
    { forkBind: { id: 'typed', activation: 'input', payloadFrom: 'value' }, props: { attributes: { type: 'text' } } },
  );

  const emitted: { id: string; payload?: unknown }[] = [];
  renderDOM(target as unknown as HTMLElement, viewNode as unknown as UINode, {
    document: document as unknown as Document,
    fork: (id, payload) => emitted.push({ id, payload }),
  });

  const input = target.querySelector('input') as unknown as StubElement & { value?: unknown };
  input.value = 'hello';
  input.dispatchEvent(new StubEvent('input', input));

  assert.strictEqual(emitted.length, 1);
  assert.deepStrictEqual(emitted[0], { id: 'typed', payload: 'hello' });
});

addTest('fragment rendering preserves child order', () => {
  const viewNode = fragment([text('a'), text('b'), text('c')]);
  const document = new StubDocument();
  const target = new StubElement('div', document);
  document.attachRoot(target);

  renderDOM(target as unknown as HTMLElement, viewNode as unknown as UINode, {
    document: document as unknown as Document,
    fork: () => {},
  });

  assert.strictEqual(target.textContent, 'abc');
});

for (const test of tests) {
  try {
    test.run();
    console.log(`✅ ${test.name}`);
  } catch (error) {
    console.error(`❌ ${test.name}`);
    throw error;
  }
}
