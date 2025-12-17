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
