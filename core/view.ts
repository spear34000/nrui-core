import { RealityContext } from './reality';
import { UINode } from './ui';

export type View<T extends UINode = UINode> = (context: RealityContext) => T;
