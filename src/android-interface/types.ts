export type AppEventPayloadVersion = 'v1';

export type AppEventPayloadCollection = 'summary_data' | 'user_sessions_data';

export type PayloadProcessingInstruction = 'add' | 'replace';

export interface AppEventPayloadOptions {
  [key: string]: PayloadProcessingInstruction
}

/**
 * Per-field processing instructions constrained to the keys of a sub-app's own payload schema.
 */
export type PayloadOptionsFor<T> = Partial<Record<keyof T, PayloadProcessingInstruction>>;

/**
 * Cross-cutting metadata attached to every payload, kept separate from the
 * event-specific `data`. The sub-app sets `appVersion`; the Android container
 * adds `container_app_version` on receipt.
 */
export interface AppEventPayloadMetadata {
  /** Sub-app's own version. Mirrors the Firebase `event_params.appVersion`. */
  appVersion: string;
  environment: string;
  [key: string]: any;
}

export interface AppEventPayload {
  cr_user_id: string;
  app_id: string;
  collection: AppEventPayloadCollection;
  data: any;
  options?: AppEventPayloadOptions;
  metadata?: AppEventPayloadMetadata;
  timestamp: string;
}
