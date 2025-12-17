import { RealityContext } from './reality';

export type Query<T> = (context: RealityContext) => T;

export const runQuery = <T>(query: Query<T>, context: RealityContext): T => query(context);
