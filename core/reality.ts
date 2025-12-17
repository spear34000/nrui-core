export type ForkId = string;

export interface ForkRecord {
  readonly id: ForkId;
  readonly payload?: unknown;
}

export interface Reality {
  readonly parent?: Reality;
  readonly fork?: ForkRecord;
}

export interface RealityContext {
  has(id: ForkId): boolean;
  times(id: ForkId): number;
  occurrences(id: ForkId): readonly ForkRecord[];
  history(): readonly ForkRecord[];
}

export const createReality = (): Reality => ({ parent: undefined, fork: undefined });

export const forkReality = (reality: Reality, id: ForkId, payload?: unknown): Reality => ({
  parent: reality,
  fork: { id, payload },
});

const collectHistory = (reality: Reality): ForkRecord[] => {
  const records: ForkRecord[] = [];
  let current: Reality | undefined = reality;
  while (current) {
    if (current.fork) {
      records.push(current.fork);
    }
    current = current.parent;
  }
  return records.reverse();
};

export const createRealityContext = (reality: Reality): RealityContext => {
  const history = collectHistory(reality);

  return {
    has(id) {
      return history.some((entry) => entry.id === id);
    },
    times(id) {
      return history.reduce((count, entry) => (entry.id === id ? count + 1 : count), 0);
    },
    occurrences(id) {
      return history.filter((entry) => entry.id === id);
    },
    history() {
      return history.slice();
    },
  };
};
