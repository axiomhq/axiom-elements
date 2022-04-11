// cSpell:ignore stdev topk

import { QueryRequestWithOptions } from './codegenApiTypes';

// Define string literals which are more friendly to use than TS enums.
export type FilterOp =
  | 'and'
  | 'or'
  | 'eq'
  | '=='
  | '!='
  | 'ne'
  | 'exists'
  | 'not-exists'
  | '>'
  | '>='
  | '<'
  | '<='
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'starts-with'
  | 'not-starts-with'
  | 'ends-with'
  | 'not-ends-with'
  | 'contains'
  | 'not-contains'
  | 'regexp'
  | 'not-regexp';

export type AggregationOp =
  | 'count'
  | 'distinct'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'topk'
  | 'percentiles'
  | 'histogram'
  | 'stdev'
  | 'variance';

export interface Aggregation {
  alias?: string;
  argument?: any;
  field: string;
  op: AggregationOp;
}

export interface Filter {
  caseSensitive?: boolean;
  /**
   * Supported for these filters: and, or, not.
   */
  children?: Filter[];
  field: string;
  op: FilterOp;
  value?: any;
}

export interface Query extends Omit<Partial<QueryRequestWithOptions>, 'filter' | 'aggregations'> {
  aggregations?: Aggregation[];
  filter?: Filter;
}
