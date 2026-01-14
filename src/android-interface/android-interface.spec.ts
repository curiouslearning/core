import { AndroidInterface, DEFAULT_OPTIONS } from './android-interface';

describe('Feature: Android Interface', () => {
  let androidInterface: AndroidInterface;
  const mockLogMessage = jest.fn();

  beforeAll(() => {
    // Mocking the Android namespace on the window object
    (window as any).Android = {
      logMessage: mockLogMessage
    };
  });

  beforeEach(() => {
    mockLogMessage.mockClear();
  });

  describe('Scenario: Initialization', () => {
    test('should initialize with custom options', () => {
      // Given custom options are provided
      const customOptions = {
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
        namespace: 'Android'
      };
      androidInterface = new AndroidInterface(customOptions);

      // When an event is logged
      androidInterface.logSummaryData({ event: 'test' });

      // Then the payload should contain the custom options
      const payloadJson = mockLogMessage.mock.calls[0][0];
      const payload = JSON.parse(payloadJson);

      expect(payload.app_id).toBe(customOptions.app_id);
      expect(payload.cr_user_id).toBe(customOptions.cr_user_id);
    });
  });

  describe('Scenario: Logging an event successfully', () => {
    beforeEach(() => {
      androidInterface = new AndroidInterface({
          app_id: 'com.example.app',
          cr_user_id: 'user-123',
      });
    });

    test('should send a complete summary_data payload to the Android bridge', () => {
      // Given the Android Interface is initialized
      const eventData = { event: 'level_complete', score: 100 };

      // When I log an event with data
      androidInterface.logSummaryData(eventData);

      // Then a specific payload should be sent to the Android bridge
      expect(mockLogMessage).toHaveBeenCalledTimes(1);

      const payloadJson = mockLogMessage.mock.calls[0][0];
      const payload = JSON.parse(payloadJson);

      expect(payload).toEqual(expect.objectContaining({
        collection: 'summary_data',
        data: eventData,
        app_id: expect.any(String),
        cr_user_id: expect.any(String),
        timestamp: expect.any(String) // or regex match ISO string
      }));

      // Verify timestamp format roughly
      expect(Date.parse(payload.timestamp)).not.toBeNaN();
    });

    test('should include provided optional processing instructions', () => {
      // Given an event with processing options
      const eventData = { event: 'update_score' };
      const options = { score: 'replace' as const };

      // When I log the event
      androidInterface.logSummaryData(eventData, options);

      // Then the payload should include the options
      const payloadJson = mockLogMessage.mock.calls[0][0];
      const payload = JSON.parse(payloadJson);

      expect(payload.options).toEqual(options);
    });
  });
});
