export type UINode = UIElement | UIText | UIFragment;

export type UIProps = {
  readonly attributes?: Record<string, string>;
  readonly dataset?: Record<string, string>;
  readonly style?: Record<string, string>;
};

export interface ForkBinding {
  readonly id: string;
  readonly activation?: 'click' | 'input' | 'change' | 'submit';
  readonly payloadFrom?: 'value' | 'checked' | 'text';
}

export interface UIElement {
  readonly type: 'element';
  readonly tag: string;
  readonly key?: string;
  readonly props?: UIProps;
  readonly children: readonly UINode[];
  readonly forkBind?: ForkBinding;
}

export interface UIText {
  readonly type: 'text';
  readonly value: string;
}

export interface UIFragment {
  readonly type: 'fragment';
  readonly children: readonly UINode[];
}

export const element = (
  tag: string,
  children: readonly UINode[] = [],
  options: { props?: UIProps; key?: string; forkBind?: ForkBinding } = {},
): UIElement => ({
  type: 'element',
  tag,
  key: options.key,
  props: options.props,
  children,
  forkBind: options.forkBind,
});

export const text = (value: string): UIText => ({ type: 'text', value });

export const fragment = (children: readonly UINode[]): UIFragment => ({ type: 'fragment', children });

const freezeRecord = <T extends Record<string, unknown>>(record?: T): T | undefined => {
  if (!record) return record;
  Object.freeze(record);
  return record;
};

const freezeForkBinding = (binding?: ForkBinding): ForkBinding | undefined => {
  if (!binding) return binding;
  Object.freeze(binding);
  return binding;
};

const freezeChildren = (children: readonly UINode[]): readonly UINode[] => {
  const frozen = children.map((child) => freezeUINode(child));
  Object.freeze(frozen);
  return frozen;
};

const freezeElement = (node: UIElement): UIElement => {
  const frozenChildren = freezeChildren(node.children);
  const frozenProps = node.props
    ? {
        attributes: freezeRecord(node.props.attributes),
        dataset: freezeRecord(node.props.dataset),
        style: freezeRecord(node.props.style),
      }
    : undefined;
  if (frozenProps) {
    Object.freeze(frozenProps);
  }
  const frozen: UIElement = {
    ...node,
    children: frozenChildren,
    props: frozenProps,
    forkBind: freezeForkBinding(node.forkBind),
  };
  Object.freeze(frozen);
  return frozen;
};

const freezeText = (node: UIText): UIText => {
  const frozen: UIText = { ...node };
  Object.freeze(frozen);
  return frozen;
};

const freezeFragment = (node: UIFragment): UIFragment => {
  const frozenChildren = freezeChildren(node.children);
  const frozen: UIFragment = { ...node, children: frozenChildren };
  Object.freeze(frozen);
  return frozen;
};

export const freezeUINode = (node: UINode): UINode => {
  switch (node.type) {
    case 'element':
      return freezeElement(node as UIElement);
    case 'text':
      return freezeText(node as UIText);
    case 'fragment':
      return freezeFragment(node as UIFragment);
    default:
      return node;
  }
};
