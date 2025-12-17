import { ForkBinding, UINode, UIElement, UIText, UIFragment } from '../core/ui';

export interface RenderOptions {
  fork: (id: string, payload?: unknown) => void;
  document?: Document;
}

const createDomNode = (
  node: UINode,
  options: RenderOptions,
  owner: Document,
): Node => {
  switch (node.type) {
    case 'text':
      return owner.createTextNode((node as UIText).value);
    case 'fragment': {
      const fragmentNode = owner.createDocumentFragment();
      for (const child of (node as UIFragment).children) {
        fragmentNode.appendChild(createDomNode(child, options, owner));
      }
      return fragmentNode;
    }
    case 'element':
    default: {
      const elementNode = owner.createElement((node as UIElement).tag);
      const { props, children, forkBind } = node as UIElement;

      if (props?.attributes) {
        for (const [key, value] of Object.entries(props.attributes)) {
          elementNode.setAttribute(key, value);
        }
      }

      if (props?.dataset) {
        for (const [key, value] of Object.entries(props.dataset)) {
          elementNode.dataset[key] = value;
        }
      }

      if (props?.style) {
        for (const [key, value] of Object.entries(props.style)) {
          (elementNode as HTMLElement).style.setProperty(key, value);
        }
      }

      if (forkBind) {
        attachForkBinding(elementNode, forkBind, options.fork);
      }

      for (const child of children) {
        elementNode.appendChild(createDomNode(child, options, owner));
      }

      return elementNode;
    }
  }
};

const attachForkBinding = (
  element: Element,
  binding: ForkBinding,
  emitFork: (id: string, payload?: unknown) => void,
) => {
  const eventName = binding.activation ?? 'click';
  const listener = (event: Event) => {
    let payload: unknown;
    if (binding.payloadFrom && event.target) {
      const target = event.target as HTMLElement & { value?: unknown; checked?: unknown; textContent?: string | null };
      if (binding.payloadFrom === 'value') {
        payload = target.value ?? undefined;
      } else if (binding.payloadFrom === 'checked') {
        payload = (target as HTMLInputElement).checked;
      } else if (binding.payloadFrom === 'text') {
        payload = target.textContent ?? '';
      }
    }
    emitFork(binding.id, payload);
  };
  element.addEventListener(eventName, listener);
};

export const renderDOM = (target: HTMLElement, node: UINode, options: RenderOptions): void => {
  const owner = options.document ?? target.ownerDocument ?? document;
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
  const rendered = createDomNode(node, options, owner);
  target.appendChild(rendered);
};
