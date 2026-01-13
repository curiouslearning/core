import { z } from 'zod';

const requiredString = (fieldName: string) => z.string({
  error: (issue) => issue.input === undefined
    ? `${fieldName} is required`
    : `${fieldName} must be a string`
});

export const ValidateV1Schema = z.object({
  cr_user_id: requiredString('CR User ID'),
  app_id: requiredString('App ID'),
  collection: requiredString('Collection'),
  data: z.record(z.string(), z.any()),
  timestamp: requiredString('Event ISO-8601 timestamp')
});
