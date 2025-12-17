import { createRealityContext, Reality } from './reality';
import { View } from './view';
import { UINode } from './ui';

export type TraceEntry =
  | { readonly op: 'has' | 'times' | 'occurrences'; readonly id: string }
  | { readonly op: 'history' };

export interface ObservationTrace {
  readonly entries: readonly TraceEntry[];
}

export interface Explanation<T extends UINode> {
  readonly ui: T;
  readonly trace: ObservationTrace;
}

const traceContext = (reality: Reality, trace: TraceEntry[]): ReturnType<typeof createRealityContext> => {
  const base = createRealityContext(reality);

  return {
    has(id: string) {
      trace.push({ op: 'has', id });
      return base.has(id);
    },
    times(id: string) {
      trace.push({ op: 'times', id });
      return base.times(id);
    },
    occurrences(id: string) {
      trace.push({ op: 'occurrences', id });
      return base.occurrences(id);
    },
    history() {
      trace.push({ op: 'history' });
      return base.history();
    },
  };
};

export const observe = <T extends UINode>(view: View<T>, reality: Reality): T => {
  const context = createRealityContext(reality);
  return view(context);
};

export const explain = <T extends UINode>(view: View<T>, reality: Reality): Explanation<T> => {
  const entries: TraceEntry[] = [];
  const context = traceContext(reality, entries);
  const ui = view(context);
  return { ui, trace: { entries } };
};
