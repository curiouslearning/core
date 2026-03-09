import { defaultsDeep } from 'lodash';
import { AppEventPayload, AppEventPayloadOptions, AppEventPayloadVersion } from './types';
import { ValidateV1Schema } from './schema-validators';

export interface AndroidInterfaceOptions {
  namespace?: string;
  app_id: string;
  cr_user_id: string;
  version?: AppEventPayloadVersion;
  debug?: boolean;
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

  /**
   * Logs summary data to the Android app.
   * 
   * @param data - The summary data to log.
   * @param options - Optional parameters for the log.
   */
  logSummaryData(data: Record<string, any>, options?: AppEventPayloadOptions) {
    if (this.options.debug) return console.log('AndroidInterface.logSummaryData:', { data, options });
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

      window[this.options.namespace].logMessage(JSON.stringify(payload));
    } catch (e) {
      console.warn('Error: AndroidInterface.logSummaryData ', e);
    }
  }

  /**
   * Logs user sessions data to the Android app.
   * 
   * @param data - The user sessions data to log.
   * @param options - Optional parameters for the log.
   */
  logUserSessionsData(data: Record<string, any>, options?: AppEventPayloadOptions) {
    if (this.options.debug) console.log('AndroidInterface.logUserSessionsData', { data, options });

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

      window[this.options.namespace].logMessage(JSON.stringify(payload));
    } catch (e) {
      console.warn('Error: AndroidInterface.logUserSessionsData ', e);
    }
  }

  protected getBaseParams() {
    const {
      cr_user_id,
      app_id
    } = this.options;

    return {
      cr_user_id,
      app_id
    };
  }

  protected validatePayload(payload: AppEventPayload) {
    // TODO: add more validation logic here as we expand this feature.
    return ValidateV1Schema.parse(payload);
  }

  protected createTimestamp() {
    const now = new Date();
    return now.toISOString();
  }
}
