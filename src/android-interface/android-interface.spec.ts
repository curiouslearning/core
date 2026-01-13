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
    androidInterface = new AndroidInterface();
  });

  describe('Scenario: Logging an event successfully', () => {
    test('should send a summary_data payload to the Android bridge', () => {
      // Given the Android Interface is initialized with default options
      // (done in beforeEach)
      const eventData = { event: 'level_complete', score: 100 };

      // When I log an event with data
      androidInterface.logSummaryData(eventData);

      // Then specific payload should be sent to the Android bridge
      const expectedPayload = JSON.stringify({
        data: eventData,
        collection: 'summary_data'
      });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
      expect(mockLogMessage).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
