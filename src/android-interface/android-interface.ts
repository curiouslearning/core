import { defaultsDeep } from 'lodash';
import { AppEventPayload, AppEventPayloadMetadata, AppEventPayloadOptions, AppEventPayloadVersion } from './types';
import { ValidateV1Schema } from './schema-validators';

export interface AndroidInterfaceOptions {
  namespace?: string;
  app_id: string;
  cr_user_id: string;
  version?: AppEventPayloadVersion;
  metadata?: AppEventPayloadMetadata;
  debug?: boolean;
  log?: boolean;
}

export const DEFAULT_OPTIONS: Partial<AndroidInterfaceOptions> = {
  namespace: 'Android',
  version: 'v1',
  debug: false
}

/**
 * AndroidInterface is a utility class that provides a way to log events to the Android app.
 * 
 * @example
 * const androidInterface = new AndroidInterface({
 *   app_id: 'com.example.app',
 *   cr_user_id: 'user-123',
 * });
 * 
 * androidInterface.logSummaryData({ key: 'value' });
 * androidInterface.logUserSessionsData({ key: 'value' });
 */
export class AndroidInterface {

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
    return typeof window[this.namespace]?.logMessage === 'function';
  }

  /**
   * Logs summary data to the Android app.
   *
   * @param data - The summary data to log.
   * @param options - Optional parameters for the log.
   * @returns true when the payload was handed to the bridge.
   */
  logSummaryData(data: Record<string, any>, options?: AppEventPayloadOptions): boolean {
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
   * Seeds a summary_data document with its default values, so numeric fields read 0 rather than
   * being absent until the first event of that type fires.
   *
   * Every field is sent with the "add" instruction, which the container turns into
   * FieldValue.increment. Because increment treats a missing field as 0, a 0 default creates the
   * field when it is absent and is a true no-op when it already holds a real value. That makes
   * this safe to call repeatedly, and it backfills documents written before a field existed.
   *
   * The options map is derived here rather than accepted from the caller on purpose: "replace" on
   * a 0 default would overwrite real counts on every call, so it must not be expressible.
   *
   * Values must be numeric. "add" only applies to numbers anything else is written verbatim by
   * the container, which would overwrite rather than seed.
   *
   * @param defaults - The complete set of numeric fields with their zero-values.
   * @returns true when the payload was handed to the bridge, false when nothing was sent.
   */
  logInitialSummaryData(defaults: Record<string, number>): boolean {
    if (!this.isAvailable() || !this.options.cr_user_id) return false;

    const options = Object.fromEntries(
      Object.keys(defaults).map((key) => [key, 'add'])
    ) as AppEventPayloadOptions;

    return this.logSummaryData(defaults, options);
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
