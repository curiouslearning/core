import { defaultsDeep } from 'lodash';

export interface AndroidInterfaceOptions {
  namespace?: string;
  app?: string;
  version?: string;
}

export const DEFAULT_OPTIONS: AndroidInterfaceOptions = {
  namespace: 'Android',
  app: '',
  version: 'v1'
}

export class AndroidInterface {

  private options: AndroidInterfaceOptions;

  constructor(
    options: AndroidInterfaceOptions = {}
  ) {
    this.options = defaultsDeep(options, DEFAULT_OPTIONS);
  }

  logEvent(data: Record<string, any>) {
    try {
      const payload = {
        data,
        collection: 'summary_data'
      }
      window[this.options.namespace].logMessage(JSON.stringify(payload));
    } catch (e) {
      console.warn('Error: AndroidInterface.logEvent ', e);
    }
  }

  logInteraction(data: Record<string, any>) {
    try {
      const payload = {
        data: {
          data,
          app: this.options.app
        },
        collection: 'interactions',
      }
      window[this.options.namespace].logMessage(JSON.stringify(payload));
    } catch (e) {
      console.warn('Error: AndroidInterface.logInteraction ', e);
    }
  }
}

/**
 * Default AndroidInterface singleton.
 */
export const ANDROID_INTERFACE = new AndroidInterface();
