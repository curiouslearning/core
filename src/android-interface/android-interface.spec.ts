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

  describe('Scenario: Logging user session data successfully', () => {
    beforeEach(() => {
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
      });
    });

    test('should send a complete user_sessions_data payload to the Android bridge', () => {
      // Given the Android Interface is initialized
      const sessionData = { session_id: 'sess-abc', duration: 120 };

      // When I log user session data
      androidInterface.logUserSessionsData(sessionData);

      // Then a specific payload should be sent to the Android bridge
      expect(mockLogMessage).toHaveBeenCalledTimes(1);

      const payloadJson = mockLogMessage.mock.calls[0][0];
      const payload = JSON.parse(payloadJson);

      expect(payload).toEqual(expect.objectContaining({
        collection: 'user_sessions_data',
        data: sessionData,
        app_id: expect.any(String),
        cr_user_id: expect.any(String),
        timestamp: expect.any(String) // or regex match ISO string
      }));

      // Verify timestamp format roughly
      expect(Date.parse(payload.timestamp)).not.toBeNaN();
    });

    test('should include provided optional processing instructions', () => {
      // Given session data with processing options
      const sessionData = { session_id: 'sess-xyz' };
      const options = { score: 'replace' as any };

      // When I log the user session data
      androidInterface.logUserSessionsData(sessionData, options);

      // Then the payload should include the options
      const payloadJson = mockLogMessage.mock.calls[0][0];
      const payload = JSON.parse(payloadJson);

      expect(payload.options).toEqual(options);
    });
  });

  describe('Scenario: Constructor-driven metadata', () => {
    test('should attach constructor metadata to summary_data payloads', () => {
      // Given the interface is constructed with metadata
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
        metadata: { appVersion: 'v1.2.3' }
      });

      // When a summary event is logged without passing metadata per call
      androidInterface.logSummaryData({ event: 'level_complete' });

      // Then the payload carries the metadata at the top level
      const payload = JSON.parse(mockLogMessage.mock.calls[0][0]);
      expect(payload.metadata).toEqual({ appVersion: 'v1.2.3' });
    });

    test('should attach constructor metadata to user_sessions_data payloads', () => {
      // Given the interface is constructed with metadata
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
        metadata: { appVersion: 'v1.2.3' }
      });

      // When a user session event is logged without passing metadata per call
      androidInterface.logUserSessionsData({ session_id: 'sess-abc' });

      // Then the payload carries the metadata at the top level
      const payload = JSON.parse(mockLogMessage.mock.calls[0][0]);
      expect(payload.metadata).toEqual({ appVersion: 'v1.2.3' });
    });

    test('should omit metadata key entirely when not provided', () => {
      // Given the interface is constructed without metadata
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
      });

      // When an event is logged
      androidInterface.logSummaryData({ event: 'test' });

      // Then the serialized payload has no metadata key (backward compatible)
      const payloadJson = mockLogMessage.mock.calls[0][0];
      const payload = JSON.parse(payloadJson);
      expect(payload).not.toHaveProperty('metadata');
    });
  });

  describe('Scenario: Seeding initial summary data', () => {
    const defaults = {
      highest_level_completed: 0,
      levels_completed: 0,
      puzzles_completed: 0
    };

    beforeEach(() => {
      localStorage.clear();
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
      });
    });

    test('Given defaults, when seeding, then each field is sent as 0 with the "add" instruction', () => {
      // Given an interface and a set of zero-valued defaults
      // When the initial summary data is seeded
      androidInterface.logInitialSummaryData(defaults);

      // Then a summary_data payload carries each field at 0 with an all-"add" options map.
      // "add" is what makes this a no-op on existing values: the container maps it to
      // FieldValue.increment, and increment(0) neither overwrites nor fails on a missing field.
      expect(mockLogMessage).toHaveBeenCalledTimes(1);

      const payload = JSON.parse(mockLogMessage.mock.calls[0][0]);

      expect(payload.collection).toBe('summary_data');
      expect(payload.data).toEqual({
        highest_level_completed: 0,
        levels_completed: 0,
        puzzles_completed: 0
      });
      expect(payload.options).toEqual({
        highest_level_completed: 'add',
        levels_completed: 'add',
        puzzles_completed: 'add'
      });
    });

    test('Given a reachable bridge, when seeding, then it reports the payload was sent', () => {
      // Given a reachable bridge
      // When the initial summary data is seeded
      const sent = androidInterface.logInitialSummaryData(defaults);

      // Then the caller can tell it was sent, so it may record that seeding happened
      expect(sent).toBe(true);
    });

    test('Given no cr_user_id, when seeding, then nothing is sent and it reports false', () => {
      // Given an interface with no cr_user_id (web play, no cr_user_id URL param)
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: '',
      });

      // When the initial summary data is seeded
      const sent = androidInterface.logInitialSummaryData(defaults);

      // Then nothing reaches the bridge and the caller is told so
      expect(sent).toBe(false);
      expect(mockLogMessage).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Seeding at most once per document', () => {
    const defaults = { levels_completed: 0, puzzles_completed: 0 };

    const build = (over: Record<string, any> = {}) => new AndroidInterface({
      app_id: 'feed-the-monster',
      cr_user_id: 'user-123',
      lang: 'english',
      ...over
    });

    beforeEach(() => {
      localStorage.clear();
    });

    test('Given a document already seeded, when seeding again, then nothing is sent', () => {
      // Given a first seed
      expect(build().logInitialSummaryData(defaults)).toBe(true);
      expect(mockLogMessage).toHaveBeenCalledTimes(1);

      // When a later launch seeds the same document
      const sent = build().logInitialSummaryData(defaults);

      // Then it is not re-sent — each send bumps updated_at
      expect(sent).toBe(false);
      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given a seeded language, when another language launches, then it seeds again', () => {
      // Given english is seeded, and the container keys summaries per language
      build().logInitialSummaryData(defaults);

      // When the player switches language
      const sent = build({ lang: 'kembata' }).logInitialSummaryData(defaults);

      // Then that document is seeded too
      expect(sent).toBe(true);
      expect(mockLogMessage).toHaveBeenCalledTimes(2);
    });

    test('Given a seeded user, when a different user plays on the same device, then it seeds again', () => {
      // Given one user is seeded, and localStorage is shared per origin
      build().logInitialSummaryData(defaults);

      // When the container launches for another cr_user_id
      const sent = build({ cr_user_id: 'user-456' }).logInitialSummaryData(defaults);

      // Then the second user is not starved of a seed
      expect(sent).toBe(true);
      expect(mockLogMessage).toHaveBeenCalledTimes(2);
    });

    test('Given a seeded schema, when a field is added to it, then it seeds again', () => {
      // Given the current schema is seeded
      build().logInitialSummaryData(defaults);

      // When a field is added to the schema, changing the field set
      const sent = build().logInitialSummaryData({ ...defaults, brand_new_field: 0 });

      // Then it re-seeds so the new field reaches existing documents, with no version to bump
      expect(sent).toBe(true);
      expect(mockLogMessage).toHaveBeenCalledTimes(2);
    });

    test('Given field order differs, when seeding, then it is still treated as the same schema', () => {
      // Given a seed
      build().logInitialSummaryData({ levels_completed: 0, puzzles_completed: 0 });

      // When the same fields are supplied in a different order
      const sent = build().logInitialSummaryData({ puzzles_completed: 0, levels_completed: 0 });

      // Then key order does not cause a spurious re-seed
      expect(sent).toBe(false);
      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given nothing was sent, when seeding, then no marker is recorded so a later launch retries', () => {
      // Given there is no bridge to send to (web play, same origin as the in-container build)
      const saved = (window as any).Android;
      delete (window as any).Android;

      expect(build().logInitialSummaryData(defaults)).toBe(false);

      // When the container later provides a bridge
      (window as any).Android = saved;
      const sent = build().logInitialSummaryData(defaults);

      // Then seeding still happens — a browser visit must not suppress it permanently
      expect(sent).toBe(true);
      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given localStorage is unavailable, when seeding, then it still sends and does not throw', () => {
      // Given storage is disabled, as in private browsing
      const getItem = jest.spyOn(window.localStorage.__proto__ as any, 'getItem')
        .mockImplementation(() => { throw new Error('storage disabled'); });
      const setItem = jest.spyOn(window.localStorage.__proto__ as any, 'setItem')
        .mockImplementation(() => { throw new Error('storage disabled'); });

      // When seeding
      let sent: boolean | undefined;
      expect(() => { sent = build().logInitialSummaryData(defaults); }).not.toThrow();

      // Then seeding is preferred over skipping when we cannot tell
      expect(sent).toBe(true);
      expect(mockLogMessage).toHaveBeenCalledTimes(1);

      getItem.mockRestore();
      setItem.mockRestore();
    });
  });

  describe('Scenario: The Android bridge is absent', () => {
    let savedBridge: any;

    beforeEach(() => {
      // Given the sub-app is running outside the Curious Reader WebView (e.g. web play)
      savedBridge = (window as any).Android;
      delete (window as any).Android;

      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
      });
    });

    afterEach(() => {
      (window as any).Android = savedBridge;
    });

    test('Given no bridge, when asked, then it reports itself unavailable', () => {
      expect(androidInterface.isAvailable()).toBe(false);
    });

    test('Given no bridge, when seeding, then nothing is sent and it reports false', () => {
      // When the initial summary data is seeded
      const sent = androidInterface.logInitialSummaryData({ levels_completed: 0 });

      // Then it reports false rather than swallowing a TypeError and looking successful.
      // Callers rely on this to avoid recording that seeding happened when it did not.
      expect(sent).toBe(false);
      expect(mockLogMessage).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: The Android bridge is present', () => {
    test('Given a bridge, when asked, then it reports itself available', () => {
      androidInterface = new AndroidInterface({
        app_id: 'com.example.app',
        cr_user_id: 'user-123',
      });

      expect(androidInterface.isAvailable()).toBe(true);
    });
  });

  /**
   * These assert COMPILE-TIME behaviour. Each @ts-expect-error fails the suite if the line it
   * guards stops being an error, which is what stops the enforcement being silently lost — notably
   * by adding a method-level type parameter, since TypeScript would then infer it from the argument
   * and every unannotated call would type-check again.
   */
  describe('Scenario: Enforcing a sub-app summary schema', () => {
    interface TestSummary {
      levels_completed?: number;
      puzzle_success?: number;
    }

    const typed = () => new AndroidInterface<TestSummary>({
      app_id: 'com.example.app',
      cr_user_id: 'user-123',
    });

    test('Given a declared schema, when a declared field is written, then it compiles', () => {
      typed().logSummaryData({ levels_completed: 1 }, { levels_completed: 'add' });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given a declared schema, when an undeclared field is written, then it does not compile', () => {
      // @ts-expect-error - 'not_a_field' is not part of TestSummary
      typed().logSummaryData({ not_a_field: 1 });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given a declared schema, when options name an undeclared field, then it does not compile', () => {
      // @ts-expect-error - options keys are constrained to TestSummary
      typed().logSummaryData({ levels_completed: 1 }, { not_a_field: 'add' });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given a declared schema, when seeding a subset of it, then it does not compile', () => {
      // Required<TSummary>: a partial seed would leave exactly the gaps seeding exists to close.
      // @ts-expect-error - 'puzzle_success' is missing
      typed().logInitialSummaryData({ levels_completed: 0 });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given a declared schema, when seeding all of it, then it compiles', () => {
      typed().logInitialSummaryData({ levels_completed: 0, puzzle_success: 0 });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });

    test('Given no schema, when arbitrary fields are written, then it still compiles', () => {
      // Backward compatibility: consumers that pass no type argument are unaffected.
      const untyped = new AndroidInterface({ app_id: 'assessment', cr_user_id: 'user-123' });

      untyped.logSummaryData({ score: 5, anything: 'goes' }, { score: 'replace' });

      expect(mockLogMessage).toHaveBeenCalledTimes(1);
    });
  });
});
