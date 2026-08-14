import { defaultsDeep } from 'lodash';
import {
  AppEventPayload,
  AppEventPayloadMetadata,
  AppEventPayloadOptions,
  AppEventPayloadVersion,
  PayloadOptionsFor
} from './types';
import { ValidateV1Schema } from './schema-validators';

export interface AndroidInterfaceOptions {
  namespace?: string;
  app_id: string;
  cr_user_id: string;
  /**
   * Selected language. The container keys a summary document on cr_user_id + app_id + language, so
   * this scopes the seed guard to the same document identity. Omit it if the sub-app has no notion
   * of language; seeding is then guarded per user and app only.
   */
  lang?: string;
  version?: AppEventPayloadVersion;
  metadata?: AppEventPayloadMetadata;
  debug?: boolean;
  log?: boolean;
}

/** localStorage prefix for the "this document has been seeded" marker. */
const SEED_MARKER_PREFIX = 'crSummaryInit';

export const DEFAULT_OPTIONS: Partial<AndroidInterfaceOptions> = {
  namespace: 'Android',
  version: 'v1',
  debug: false
}

/**
 * AndroidInterface is a utility class that provides a way to log events to the Android app.
 * @typeParam TSummary - the sub-app's summary_data schema.
 *
 * @example
 * // Untyped: anything goes.
 * const androidInterface = new AndroidInterface({
 *   app_id: 'com.example.app',
 *   cr_user_id: 'user-123',
 * });
 *
 * androidInterface.logSummaryData({ key: 'value' });
 * androidInterface.logUserSessionsData({ key: 'value' });
 *
 * @example
 * // Schema-enforced: a field outside SummaryData will not compile.
 * const androidInterface = new AndroidInterface<SummaryData>({
 *   app_id: 'feed-the-monster',
 *   cr_user_id: 'user-123',
 *   lang: 'english',
 * });
 *
 * androidInterface.logInitialSummaryData(SUMMARY_DEFAULTS);
 */
export class AndroidInterface<TSummary = Record<string, any>> {

  private options: AndroidInterfaceOptions;

  constructor(
    options?: AndroidInterfaceOptions
  ) {
    this.options = defaultsDeep(options, DEFAULT_OPTIONS);
  }

  get namespace(): string {
    return this.options.namespace ?? DEFAULT_OPTIONS.namespace!;
  }

  /**
   * Whether the Android bridge is reachable.
   *
   * The bridge only exists when the sub-app runs inside the Curious Reader WebView; during web
   * play it is absent. Without this check the missing bridge surfaces as a TypeError swallowed
   * by the catch blocks below, so callers cannot tell "sent" from "there was nothing to send to".
   */
  isAvailable(): boolean {
    return typeof (window as any)[this.namespace]?.logMessage === 'function';
  }

  /**
   * Logs summary data to the Android app.
   *
   * @param data - The summary data to log, limited to the keys of TSummary.
   * @param options - Per-field processing instructions, limited to the keys of TSummary.
   * @returns true when the payload was handed to the bridge.
   */
  logSummaryData(data: TSummary, options?: PayloadOptionsFor<TSummary>): boolean {
    if (this.options.log) console.log('AndroidInterface.logSummaryData:', { data, options });
    if (this.options.debug) return false;

    try {
      const baseParams = this.getBaseParams();
      const payload: AppEventPayload = {
        ...baseParams,
        data,
        collection: 'summary_data',
        options,
        timestamp: this.createTimestamp()
      };

      this.validatePayload(payload); // throws

      window[this.namespace].logMessage(JSON.stringify(payload));

      return true;
    } catch (e) {
      console.warn('Error: AndroidInterface.logSummaryData ', e);

      return false;
    }
  }

  /**
   * Seeds a summary document with the given defaults, so its fields read 0 rather than being absent
   * until the first event of that type fires.
   *
   * Every field is sent as "add", which the container maps to FieldValue.increment. Since increment
   * treats a missing field as 0, seeding creates absent fields and is a true no-op on real values
   * so it also backfills documents written before a field existed. The instructions are derived here
   * rather than accepted, because "replace" on a 0 would overwrite real counts instead.
   *
   * Takes `Required<TSummary>`: seeding a subset would leave exactly the gaps it exists to close.
   * Values should be 0, a non-zero default increments rather than seeds.
   *
   * Sends at most once per document, tracked in localStorage, since each send bumps updated_at. The
   * marker is recorded only after a successful send, so a run with no bridge (web play, same origin
   * as the in-container build) does not suppress a later real one.
   *
   * @param defaults - Every field in the schema, each set to 0.
   * @returns true when the payload was handed to the bridge, false when nothing was sent.
   */
  logInitialSummaryData(defaults: Required<TSummary>): boolean {
    if (!this.isAvailable() || !this.options.cr_user_id) return false;

    const fields = Object.keys(defaults as object);
    const marker = this.seedMarkerKey(fields);

    if (this.hasSeeded(marker)) return false;

    const options = Object.fromEntries(
      fields.map((field) => [field, 'add'])
    ) as PayloadOptionsFor<TSummary>;

    const sent = this.logSummaryData(defaults as TSummary, options);

    if (sent) this.recordSeeded(marker);

    return sent;
  }

  /**
   * Identifies a seeded document. The field list is part of the key, so adding a field to the schema
   * changes it and re-seeds once which is what keeps the seed in step with the schema without a
   * version constant anyone has to remember to bump.
   */
  private seedMarkerKey(fields: string[]): string {
    const { cr_user_id, app_id, lang } = this.options;

    return [
      SEED_MARKER_PREFIX,
      cr_user_id,
      app_id,
      lang ?? '',
      [...fields].sort().join(',')
    ].join(':');
  }

  /** Storage is unavailable in private-mode browsers; prefer seeding over skipping when unknown. */
  private hasSeeded(marker: string): boolean {
    try {
      return localStorage.getItem(marker) !== null;
    } catch {
      return false;
    }
  }

  private recordSeeded(marker: string): void {
    try {
      localStorage.setItem(marker, this.createTimestamp());
    } catch {
      // Cannot record it; a later launch will seed again, which is a no-op on the values.
    }
  }

  /**
   * Logs user sessions data to the Android app.
   * 
   * @param data - The user sessions data to log.
   * @param options - Optional parameters for the log.
   * @returns true when the payload was handed to the bridge.
   */
  logUserSessionsData(data: Record<string, any>, options?: AppEventPayloadOptions): boolean {
    if (this.options.log) console.log('AndroidInterface.logUserSessionsData:', { data, options });
    if (this.options.debug) return false;

    try {
      const baseParams = this.getBaseParams();
      const payload: AppEventPayload = {
        ...baseParams,
        data,
        collection: 'user_sessions_data',
        options,
        timestamp: this.createTimestamp()
      };

      this.validatePayload(payload); // throws

      window[this.namespace].logMessage(JSON.stringify(payload));

      return true;
    } catch (e) {
      console.warn('Error: AndroidInterface.logUserSessionsData ', e);

      return false;
    }
  }

  getBaseParams() {
    const {
      cr_user_id,
      app_id,
      version,
      metadata
    } = this.options;

    return {
      cr_user_id,
      app_id,
      schema_version: version ?? DEFAULT_OPTIONS.version!,
      metadata
    };
  }

  validatePayload(payload: AppEventPayload) {
    // TODO: add more validation logic here as we expand this feature.
    return ValidateV1Schema.parse(payload);
  }

  createTimestamp() {
    const now = new Date();
    return now.toISOString();
  }
}
