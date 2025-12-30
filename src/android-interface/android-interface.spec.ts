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
      androidInterface.logEvent(eventData);

      // Then specific payload should be sent to the Android bridge
      const expectedPayload = JSON.stringify({
        data: eventData,
        collection: 'summary_data'
      });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
      expect(mockLogMessage).toHaveBeenCalledWith(expectedPayload);
    });
  });

  describe('Scenario: Logging an interaction successfully', () => {
    test('should send an interaction payload to the Android bridge', () => {
      // Given the Android Interface is initialized with default options
      // (done in beforeEach)
      const interactionData = { button: 'play', screen: 'home' };

      // When I log an interaction with data
      androidInterface.logInteraction(interactionData);

      // Then specific payload should be sent to the Android bridge
      const expectedPayload = JSON.stringify({
        data: {
          data: interactionData,
          app: DEFAULT_OPTIONS.app
        },
        collection: 'interactions',
      });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
      expect(mockLogMessage).toHaveBeenCalledWith(expectedPayload);
    });
  });

  describe('Scenario: Logging with custom options', () => {
    test('should use custom namespace and app name', () => {
      // Given the Android Interface is initialized with custom options
      const customOptions = { namespace: 'MyGame', app: 'SuperGame' };
      const customInterface = new AndroidInterface(customOptions);

      // And I mock the custom namespace
      const mockCustomLog = jest.fn();
      (window as any).MyGame = {
        logMessage: mockCustomLog
      };

      const interactionData = { action: 'click' };

      // When I log an interaction
      customInterface.logInteraction(interactionData);

      // Then the payload should use the custom app name
      const expectedPayload = JSON.stringify({
        data: {
          data: interactionData,
          app: 'SuperGame'
        },
        collection: 'interactions',
      });

      // And it should be sent to the custom namespace bridge
      expect(mockCustomLog).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
