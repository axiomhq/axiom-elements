import { APLQuery } from '../types/APLQuery';
import { Query } from '../types/Query';

export const isAplQuery = (query: Query | APLQuery): query is APLQuery =>
  Object.prototype.hasOwnProperty.call(query, 'apl');
