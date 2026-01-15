export type AppEventPayloadVersion = 'v1';

export type AppEventPayloadCollection = 'summary_data';

export type PayloadProcessingInstruction = 'add' | 'replace';

export interface AppEventPayloadOptions {
  [key: string]: PayloadProcessingInstruction
}

export interface AppEventPayload {
  cr_user_id: string;
  app_id: string;
  collection: AppEventPayloadCollection;
  data: any;
  options?: AppEventPayloadOptions;
  timestamp: string;
}
