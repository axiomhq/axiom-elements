// 🐉🐉🐉
// SYNC WITH api.ts in `axiom` proper

/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable no-redeclare, no-trailing-spaces, no-multi-str, dot-notation,@typescript-eslint/dot-notation, quote-props, @typescript-eslint/array-type, no-array-constructor, @typescript-eslint/no-array-constructor, @typescript-eslint/consistent-type-assertions */

export interface APLRequestWithOptions {
  apl: string;
  endTime?: string;
  queryOptions?: QueryOptions;
  startTime?: string;
}
export interface Aggregation {
  alias?: string;
  argument?: any;
  field: string;
  op: Aggregation.OpEnum;
}
export namespace Aggregation {
  export enum OpEnum {
    Count = <any>'count',
    Distinct = <any>'distinct',
    Sum = <any>'sum',
    Avg = <any>'avg',
    Min = <any>'min',
    Max = <any>'max',
    Topk = <any>'topk',
    Percentiles = <any>'percentiles',
    Histogram = <any>'histogram',
    Stdev = <any>'stdev',
    Variance = <any>'variance',
    Argmin = <any>'argmin',
    Argmax = <any>'argmax',
  }
}
export interface AplQuery {
  apl: string;
  endTime?: string;
  /**
   * start and end time for the query, these must be specified as RFC3339 strings or using relative time expressions (e.g. now-1h, now-1d, now-1w, etc)
   */
  startTime?: string;
}
export interface AplResult {
  buckets: Timeseries;
  datasetNames: Array<string>;
  matches?: Array<Entry>;
  request: QueryRequest;
  status: Status;
}
export interface BillingChange {
  paymentMethodID?: string;
  targetPlan: BillingChange.TargetPlanEnum;
}
export namespace BillingChange {
  export enum TargetPlanEnum {
    Free = <any>'free',
    Trial = <any>'trial',
    Pro = <any>'pro',
    Enterprise = <any>'enterprise',
    Comped = <any>'comped',
  }
}
export interface CreateDataset {
  description?: string;
  name: string;
}
export interface CreateTeam {
  datasets?: Array<string>;
  members?: Array<string>;
  name: string;
}
export interface CreateToken {
  description?: string;
  name: string;
  permissions?: Array<string>;
  scopes?: Array<string>;
}
export interface CreateUserPayload {
  email: string;
  name: string;
  role: CreateUserPayload.RoleEnum;
  teams?: Array<string>;
}
export namespace CreateUserPayload {
  export enum RoleEnum {
    Owner = <any>'owner',
    Admin = <any>'admin',
    User = <any>'user',
    ReadOnly = <any>'read-only',
  }
}
export interface Dashboard {
  against?: string;
  againstTimestamp?: string;
  charts?: any;
  description?: string;
  layout?: any;
  name: string;
  owner: string;
  refreshTime: number;
  schemaVersion: number;
  timeWindowEnd: string;
  timeWindowStart: string;
  /**
   * used for detecting conflicts on update
   */
  version?: string;
}
export interface DashboardWithId extends Dashboard {
  against?: string;
  againstTimestamp?: string;
  charts?: any;
  description?: string;
  layout?: any;
  name: string;
  owner: string;
  refreshTime: number;
  schemaVersion: number;
  timeWindowEnd: string;
  timeWindowStart: string;
  /**
   * used for detecting conflicts on update
   */
  version?: string;
  id: string;
}
export interface Dataset {
  created: string;
  fields?: Array<Field>;
  id: number;
  name: string;
}
export interface DatasetCoreInfo {
  compressedBytes: number;
  compressedBytesHuman: string;
  created: string;
  fields?: Array<DatasetField>;
  inputBytes: number;
  inputBytesHuman: string;
  integrationFilters?: IntegrationDatasetFilters;
  maxTime?: string;
  minTime?: string;
  name: string;
  numBlocks: number;
  numEvents: number;
  numFields: number;
  quickQueries?: Array<IntegrationQuickQuery>;
  who: string;
}
export interface DatasetField {
  description?: string;
  hidden: boolean;
  name: string;
  type: string;
  unit: string;
}
export interface DatasetFields {
  fields?: Array<Field>;
}
export interface DatasetInfo {
  compressedBytes: number;
  compressedBytesHuman: string;
  created: string;
  fields?: Array<Field>;
  inputBytes: number;
  inputBytesHuman: string;
  maxTime?: string;
  minTime?: string;
  name: string;
  numBlocks: number;
  numEvents: number;
  numFields: number;
}
export interface DatasetSpec {
  created: string;
  description: string;
  id: string;
  integrationConfigs?: Array<string>;
  name: string;
  who: string;
}
export interface ElasticBulkIndex {
  status: number;
}
export interface ElasticBulkItem {
  index: ElasticBulkIndex;
}
export interface ElasticBulkResponse {
  errors: boolean;
  items?: Array<ElasticBulkItem>;
}
export interface Entry {
  _rowId: string;
  _sysTime: string;
  _time: string;
  data: { [key: string]: any };
}
export interface EntryGroup {
  aggregations?: Array<EntryGroupAgg>;
  group: { [key: string]: any };
  id: number;
}
export interface EntryGroupAgg {
  op: string;
  value: any;
}
export interface Field {
  name: string;
  type: string;
}
export interface Filter {
  /**
   * Supported for these filters: starts-with, not-starts-with, ends-with, not-ends-with, contains, not-contains, eq, ne.
   */
  caseSensitive?: boolean;
  /**
   * Supported for these filters: and, or, not.
   */
  children?: Array<Filter>;
  field: string;
  /**
   * we also support '==', but we're not exporting that to swagger, cause it can't deal with it
   */
  op: Filter.OpEnum;
  value?: any;
}
export namespace Filter {
  export enum OpEnum {
    And = <any>'and',
    Or = <any>'or',
    Not = <any>'not',
    Eq = <any>'eq',
    NotEqual = <any>'!=',
    Ne = <any>'ne',
    Exists = <any>'exists',
    NotExists = <any>'not-exists',
    GreaterThan = <any>'>',
    GreaterThanOrEqualTo = <any>'>=',
    LessThan = <any>'<',
    LessThanOrEqualTo = <any>'<=',
    Gt = <any>'gt',
    Gte = <any>'gte',
    Lt = <any>'lt',
    Lte = <any>'lte',
    StartsWith = <any>'starts-with',
    NotStartsWith = <any>'not-starts-with',
    EndsWith = <any>'ends-with',
    NotEndsWith = <any>'not-ends-with',
    Contains = <any>'contains',
    NotContains = <any>'not-contains',
    Regexp = <any>'regexp',
    NotRegexp = <any>'not-regexp',
  }
}
export interface Health {
  syslogHealthState: Health.SyslogHealthStateEnum;
}
export namespace Health {
  export enum SyslogHealthStateEnum {
    Green = <any>'Green',
    Amber = <any>'Amber',
    Red = <any>'Red',
  }
}
export interface Info {
  datasetLimit?: number;
  fieldLimit?: number;
  forceRecover?: boolean;
  hostname?: string;
  noBufferedWrites?: boolean;
  payloadBufferLimit?: string;
  pubsubDB?: string;
  silentIngest?: boolean;
  /**
   * Storage
   */
  storage?: string;
  storageFallback?: string;
  version?: Version;
}
export interface IngestFailure {
  error: string;
  timestamp: string;
}
export interface IngestStatus {
  blocksCreated: number;
  failed: number;
  failures?: Array<IngestFailure>;
  ingested: number;
  processedBytes: number;
  walLength: number;
}
export interface Ingress {
  /**
   * Some ingress types do not specify a dataset in their messages If this is the case, the dataset will be set to this value. Syslog for example requires a dataset to be set, but Honeycomb does not.
   */
  dataset?: string;
  /**
   * If multiplexing is required, then this value should be set to a url with a scheme honeycomb/http ingresses should be set to a http(s) url syslog/tcp-udp ingresses should be set to a tcp/udp/tls url tls urls may also set the ForwardToPem value
   */
  forwardTo?: string;
  /**
   * if the ingress ForwardTo value is a tls url then we may need a PEM file to validate the connection with
   */
  forwardToPem?: string;
  id?: string;
  /**
   * For ingress types that do specify a dataset in their message then this field defines the datasets that the ingress will be able to ingest into
   */
  scopes?: Array<string>;
  /**
   * The service type of the ingress, can only be set to one of our supported service types
   */
  serviceType?: Ingress.ServiceTypeEnum;
  /**
   * The Target urls or host that the ingress will be available on
   */
  target?: string;
  /**
   * If the ingress is a non http based ingress, for example syslog then this field becomes important It indicates that the Target field is expecting TLS connections
   */
  tlsSupported?: boolean;
}
export namespace Ingress {
  export enum ServiceTypeEnum {
    Syslog = <any>'syslog',
    Honeycomb = <any>'honeycomb',
  }
}
export interface InstanceMessage {
  dismissable?: boolean;
  kind: InstanceMessage.KindEnum;
  message?: string;
}
export namespace InstanceMessage {
  export enum KindEnum {
    Licence = <any>'licence',
  }
}
export interface IntegrationConfigFilter {
  field: string;
  intlKey: string;
  kind: IntegrationConfigFilter.KindEnum;
  options: Array<IntegrationConfigFilterOption>;
  parentField?: string;
}
export namespace IntegrationConfigFilter {
  export enum KindEnum {
    Select = <any>'select',
  }
}
export interface IntegrationConfigFilterOption {
  id: string;
  name: string;
  /**
   * If this filter has a parentField, then this is the value to match on if the parentField filter is set
   */
  parentValue?: string;
  /**
   * selecting this option would reset the filter usually for \"All\", etc first options
   */
  reset?: boolean;
  sub?: string;
}
export interface IntegrationConnectProps {
  properties: { [key: string]: string };
}
export interface IntegrationDatasetFilters {
  filters: Array<IntegrationConfigFilter>;
  integrationName: string;
  integrationSlug: string;
}
export interface IntegrationNextStep {
  kind: IntegrationNextStep.KindEnum;
  properties: { [key: string]: any };
}
export namespace IntegrationNextStep {
  export enum KindEnum {
    Redirect = <any>'redirect',
  }
}
export interface IntegrationQuery {
  aggregations?: Array<Aggregation>;
  continuationToken?: string;
  cursor?: string;
  endTime: string;
  /**
   * FieldsMeta contains the unit information (if we have it) for each field
   */
  fieldsMeta?: Array<DatasetField>;
  filter?: Filter;
  groupBy?: Array<string>;
  includeCursor?: boolean;
  limit?: number;
  order?: Array<Order>;
  project?: Array<Projection>;
  queryOptions?: IntegrationQueryOptions;
  /**
   * The time resolution of the query’s graph, in seconds. Valid values are the query’s time range /100 at maximum and /1000 at minimum or \"auto\".
   */
  resolution: string;
  /**
   * start and end time for the query, these must be specified as RFC3339 strings or using relative time expressions (e.g. now-1h, now-1d, now-1w, etc)
   */
  startTime: string;
  virtualFields?: Array<VirtualColumn>;
}
export interface IntegrationQueryOptions {
  integrationsFilter: string;
}
export interface IntegrationQuickQuery {
  defaultQuery: IntegrationQuery;
  description: string;
  id: string;
  name: string;
  shortcuts: Array<IntegrationShortcut>;
}
export interface IntegrationShortcut {
  iconName: string;
  intlKey: string;
  query: IntegrationQuery;
}
export interface Interval {
  endTime: string;
  groups?: Array<EntryGroup>;
  startTime: string;
}
export interface Invoice {
  issuedDate: string;
  paid: boolean;
  receipt: string;
  total: number;
}
export interface Invoices extends Array<Invoice> {}
export interface License {
  apiRateLimit: number;
  dailyIngestGb: number;
  /**
   * Error returns the last error (if any) on token refresh
   */
  error: string;
  expiresAt: string;
  id: string;
  issuedAt: string;
  issuedTo: string;
  issuer: string;
  maxAuditWindowSeconds: number;
  maxDatasets: number;
  maxQueriesPerSecond: number;
  maxQueryWindowSeconds: number;
  maxTeams: number;
  maxUsers: number;
  tier: License.TierEnum;
  validFrom: string;
  withAuths: Array<string>;
  withRBAC: boolean;
}
export namespace License {
  export enum TierEnum {
    Free = <any>'free',
    Trial = <any>'trial',
    Pro = <any>'pro',
    Enterprise = <any>'enterprise',
    Comped = <any>'comped',
  }
}
export interface Message {
  code?: string;
  count: number;
  msg: string;
  priority: string;
}
export interface Monitor {
  aplQuery: boolean;
  comparison: Monitor.ComparisonEnum;
  dataset: string;
  description?: string;
  disabled: boolean;
  disabledUntil?: string;
  durationMinutes: number;
  frequencyMinutes: number;
  id: string;
  lastCheckState?: { [key: string]: string };
  lastCheckTime?: string;
  lastError?: string;
  name: string;
  noDataCloseWaitMinutes?: number;
  notifiers?: Array<string>;
  query: any;
  threshold: number;
}
export namespace Monitor {
  export enum ComparisonEnum {
    Below = <any>'Below',
    BelowOrEqual = <any>'BelowOrEqual',
    Above = <any>'Above',
    AboveOrEqual = <any>'AboveOrEqual',
  }
}
export interface NodeStatus {
  status: number;
}
export interface Notifier {
  disabledUntil?: string;
  id: string;
  metaCreated?: string;
  metaModified?: string;
  metaVersion?: number;
  name: string;
  /**
   * required: True
   */
  properties?: any;
  /**
   * required: True
   */
  type?: Notifier.TypeEnum;
}
export namespace Notifier {
  export enum TypeEnum {
    Pagerduty = <any>'pagerduty',
    Slack = <any>'slack',
    Email = <any>'email',
    Opsgenie = <any>'opsgenie',
    Webhook = <any>'webhook',
  }
}
export interface OAuthProvider {
  clientId: string;
  clientSecret?: string;
  extra?: { [key: string]: string };
  id: string;
}
export interface Order {
  desc: boolean;
  field: string;
}
export interface Org {
  id: string;
  lastUsageSync: string;
  license: License;
  metaCreated?: string;
  metaModified?: string;
  metaVersion?: string;
  name: string;
  plan: Org.PlanEnum;
  planCreated: string;
  planExpires: string;
  previousPlan: string;
  previousPlanCreated: string;
  previousPlanExpired: string;
  primaryEmail: string;
  role: string;
  trialed: boolean;
}
export namespace Org {
  export enum PlanEnum {
    Free = <any>'free',
    Trial = <any>'trial',
    Pro = <any>'pro',
    Enterprise = <any>'enterprise',
  }
}
export interface OrgSharedAccessKeys {
  primary: string;
  secondary: string;
}
export interface OrgStatus {
  dailyIngestRemainingGB: number;
  dailyIngestUsedGB: number;
  datasetsRemaining: number;
  datasetsUsed: number;
  usersRemaining: number;
  usersUsed: number;
}
export interface PaymentMethod {
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  id: string;
  last4: string;
}
export interface Portal {
  uri: string;
}
export interface PostOrg {
  name: string;
}
export interface Projection {
  alias?: string;
  field: string;
}
export interface QueryOptions {
  against?: string;
  againstStart?: string;
  againstTimestamp?: string;
  caseSensitive?: string;
  containsTimeFilter?: string;
  datasets?: string;
  displayNull?: string;
  editorContent?: string;
  endColumn?: string;
  endLineNumber?: string;
  endTime?: string;
  integrationsFilter?: string;
  openIntervals?: string;
  quickRange?: string;
  resolution?: string;
  startColumn?: string;
  startLineNumber?: string;
  startTime?: string;
  timeSeriesView?: string;
}
export interface QueryRequest {
  aggregations?: Array<Aggregation>;
  continuationToken?: string;
  cursor?: string;
  endTime: string;
  /**
   * FieldsMeta contains the unit information (if we have it) for each field
   */
  fieldsMeta?: Array<DatasetField>;
  filter?: Filter;
  groupBy?: Array<string>;
  includeCursor?: boolean;
  limit?: number;
  order?: Array<Order>;
  project?: Array<Projection>;
  /**
   * The time resolution of the query’s graph, in seconds. Valid values are the query’s time range /100 at maximum and /1000 at minimum or \"auto\".
   */
  resolution: string;
  /**
   * start and end time for the query, these must be specified as RFC3339 strings or using relative time expressions (e.g. now-1h, now-1d, now-1w, etc)
   */
  startTime: string;
  virtualFields?: Array<VirtualColumn>;
}
export interface QueryRequestWithOptions {
  aggregations?: Array<Aggregation>;
  continuationToken?: string;
  cursor?: string;
  endTime: string;
  filter?: Filter;
  groupBy?: Array<string>;
  includeCursor?: boolean;
  limit?: number;
  order?: Array<Order>;
  project?: Array<Projection>;
  queryOptions?: QueryOptions;
  /**
   * The time resolution of the query’s graph, in seconds. Valid values are the query’s time range /100 at maximum and /1000 at minimum or \"auto\".
   */
  resolution: string;
  startTime: string;
  virtualFields?: Array<VirtualColumn>;
}
export interface RawToken {
  permissions: Array<string>;
  scopes: Array<string>;
  token: string;
}
export interface Result {
  buckets: Timeseries;
  matches?: Array<Entry>;
  status: Status;
}
export interface ServiceUser {
  emails?: Array<string>;
  id?: string;
  name?: string;
}
export interface Settings {
  cacheBackend: string;
  datastoreBackend: string;
  db: string;
  dbVersion: string;
  emailBackend: string;
  hostname: string;
  queryDb: string;
  queueBackend: string;
  version: string;
}
export interface StarredQuery {
  dataset?: string;
  kind: StarredQuery.KindEnum;
  metadata: { [key: string]: string };
  name: string;
  query: any;
  who: string;
}
export namespace StarredQuery {
  export enum KindEnum {
    Analytics = <any>'analytics',
    Stream = <any>'stream',
    Apl = <any>'apl',
  }
}
export interface StarredQueryWithId {
  created: string;
  dataset?: string;
  id: string;
  kind: StarredQueryWithId.KindEnum;
  metadata: { [key: string]: string };
  name: string;
  query: any;
  who: string;
}
export namespace StarredQueryWithId {
  export enum KindEnum {
    Analytics = <any>'analytics',
    Stream = <any>'stream',
    Apl = <any>'apl',
  }
}
export interface Stats {
  compressedBytes: number;
  compressedBytesHuman: string;
  datasets?: Array<DatasetInfo>;
  inputBytes: number;
  inputBytesHuman: string;
  numBlocks: number;
  numEvents: number;
}
export interface Status {
  blocksExamined: number;
  cacheStatus: number;
  continuationToken?: string;
  elapsedTime: number;
  isEstimate?: boolean;
  isPartial: boolean;
  maxBlockTime: string;
  messages?: Array<Message>;
  minBlockTime: string;
  numGroups: number;
  rowsExamined: number;
  rowsMatched: number;
}
export interface StripeSetupIntent {
  clientSecret: string;
  currentStatus: StripeSetupIntent.CurrentStatusEnum;
}
export namespace StripeSetupIntent {
  export enum CurrentStatusEnum {
    Paid = <any>'paid',
    Unpaid = <any>'unpaid',
    NoPaymentRequired = <any>'no_payment_required',
  }
}
export interface Team {
  datasets: Array<string>;
  id: string;
  members: Array<string>;
  name: string;
}
export interface Timeseries {
  series?: Array<Interval>;
  totals?: Array<EntryGroup>;
}
export interface Token {
  description?: string;
  id: string;
  name: string;
  permissions: Array<string>;
  scopes: Array<string>;
}
export interface TrimOptions {
  maxDuration: string;
}
export interface TrimResult {
  numDeleted: number;
}
export interface UpdateDataset {
  description?: string;
}
export interface Usage {
  creditUsd: number;
  lineItems: { [key: string]: UsageItem };
  periodEndDate: string;
  periodStartDate: string;
  subTotalUsd: number;
  totalUsd: number;
}
export interface UsageItem {
  breakdown: { [key: string]: number };
  quantity: number;
  totalUsd: number;
}
export interface User {
  email: string;
  id: string;
  name: string;
  permissions: Array<string>;
  role: string;
}
export interface UserRole {
  role: UserRole.RoleEnum;
}
export namespace UserRole {
  export enum RoleEnum {
    Owner = <any>'owner',
    Admin = <any>'admin',
    User = <any>'user',
    ReadOnly = <any>'read-only',
  }
}
export interface UserUpdate {
  name: string;
}
export interface Version {
  buildDate?: string;
  release?: string;
  revision?: string;
}
export interface VersionPayload {
  currentVersion: string;
}
export interface VirtualColumn {
  alias: string;
  expr: string;
}
export interface VirtualField {
  dataset: string;
  description?: string;
  expression: string;
  name: string;
}
export interface VirtualFieldWithId {
  dataset: string;
  description?: string;
  expression: string;
  id: string;
  name: string;
}
