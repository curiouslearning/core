/**
 * Happy Path Unit Tests for PubSub
 * Using Gherkin syntax with Jest
 */
import { PubSub } from './pub-sub';

describe('PubSub', () => {
  let pubSub: PubSub;

  beforeEach(() => {
    pubSub = new PubSub();
    PubSub.NEXT_ID = 0; // Reset ID counter between tests
  });

  describe('Feature: Subscribe to events', () => {
    describe('Scenario: Single subscriber subscribes to an event', () => {
      it('Given a PubSub instance, When I subscribe to an event, Then a callback function should be stored', () => {
        // Arrange
        const eventName = 'user-login';
        const callback = jest.fn();

        // Act
        pubSub.subscribe(eventName, callback);

        // Assert
        expect(pubSub['subscribers'][eventName]).toBeDefined();
        expect(pubSub['subscribers'][eventName][0]).toBe(callback);
      });

      it('Given a PubSub instance, When I subscribe to an event, Then an unsubscribe function should be returned', () => {
        // Arrange
        const eventName = 'user-login';
        const callback = jest.fn();

        // Act
        const unsubscribe = pubSub.subscribe(eventName, callback);

        // Assert
        expect(typeof unsubscribe).toBe('function');
      });
    });

    describe('Scenario: Multiple subscribers subscribe to the same event', () => {
      it('Given a PubSub instance, When multiple subscribers subscribe to the same event, Then all callbacks should be stored with unique IDs', () => {
        // Arrange
        const eventName = 'user-login';
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const callback3 = jest.fn();

        // Act
        pubSub.subscribe(eventName, callback1);
        pubSub.subscribe(eventName, callback2);
        pubSub.subscribe(eventName, callback3);

        // Assert
        expect(Object.keys(pubSub['subscribers'][eventName]).length).toBe(3);
        expect(pubSub['subscribers'][eventName][0]).toBe(callback1);
        expect(pubSub['subscribers'][eventName][1]).toBe(callback2);
        expect(pubSub['subscribers'][eventName][2]).toBe(callback3);
      });
    });

    describe('Scenario: Subscribers subscribe to different events', () => {
      it('Given a PubSub instance, When subscribers subscribe to different events, Then each event should have its own subscribers list', () => {
        // Arrange
        const eventName1 = 'user-login';
        const eventName2 = 'user-logout';
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        // Act
        pubSub.subscribe(eventName1, callback1);
        pubSub.subscribe(eventName2, callback2);

        // Assert
        expect(pubSub['subscribers'][eventName1][0]).toBe(callback1);
        expect(pubSub['subscribers'][eventName2][1]).toBe(callback2);
      });
    });
  });

  describe('Feature: Publish events', () => {
    describe('Scenario: Publish event with single subscriber', () => {
      it('Given a subscriber is subscribed to an event, When the event is published with data, Then the subscriber callback should be called with the published data', () => {
        // Arrange
        const eventName = 'user-login';
        const userData = { userId: 123, username: 'john' };
        const callback = jest.fn();
        pubSub.subscribe(eventName, callback);

        // Act
        pubSub.publish(eventName, userData);

        // Assert
        expect(callback).toHaveBeenCalledWith(userData);
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe('Scenario: Publish event with multiple subscribers', () => {
      it('Given multiple subscribers are subscribed to an event, When the event is published with data, Then all subscriber callbacks should be called with the published data', () => {
        // Arrange
        const eventName = 'user-login';
        const userData = { userId: 123, username: 'john' };
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const callback3 = jest.fn();
        pubSub.subscribe(eventName, callback1);
        pubSub.subscribe(eventName, callback2);
        pubSub.subscribe(eventName, callback3);

        // Act
        pubSub.publish(eventName, userData);

        // Assert
        expect(callback1).toHaveBeenCalledWith(userData);
        expect(callback2).toHaveBeenCalledWith(userData);
        expect(callback3).toHaveBeenCalledWith(userData);
        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledTimes(1);
        expect(callback3).toHaveBeenCalledTimes(1);
      });
    });

    describe('Scenario: Publish event with no subscribers', () => {
      it('Given no subscribers are subscribed to an event, When the event is published, Then no errors should occur', () => {
        // Arrange
        const eventName = 'unknown-event';
        const data = { test: 'data' };

        // Act & Assert
        expect(() => {
          pubSub.publish(eventName, data);
        }).not.toThrow();
      });
    });

    describe('Scenario: Publish event with different data types', () => {
      it('Given a subscriber is subscribed to an event, When the event is published with string data, Then the callback should receive the string data', () => {
        // Arrange
        const eventName = 'message';
        const message = 'Hello World';
        const callback = jest.fn();
        pubSub.subscribe(eventName, callback);

        // Act
        pubSub.publish(eventName, message);

        // Assert
        expect(callback).toHaveBeenCalledWith(message);
      });

      it('Given a subscriber is subscribed to an event, When the event is published with number data, Then the callback should receive the number data', () => {
        // Arrange
        const eventName = 'score';
        const score = 42;
        const callback = jest.fn();
        pubSub.subscribe(eventName, callback);

        // Act
        pubSub.publish(eventName, score);

        // Assert
        expect(callback).toHaveBeenCalledWith(score);
      });

      it('Given a subscriber is subscribed to an event, When the event is published with array data, Then the callback should receive the array data', () => {
        // Arrange
        const eventName = 'items';
        const items = [1, 2, 3, 4, 5];
        const callback = jest.fn();
        pubSub.subscribe(eventName, callback);

        // Act
        pubSub.publish(eventName, items);

        // Assert
        expect(callback).toHaveBeenCalledWith(items);
      });
    });
  });

  describe('Feature: Unsubscribe from events', () => {
    describe('Scenario: Subscriber unsubscribes from an event', () => {
      it('Given a subscriber has subscribed to an event, When the subscriber calls the unsubscribe function, Then the callback should no longer be called when the event is published', () => {
        // Arrange
        const eventName = 'user-login';
        const userData = { userId: 123, username: 'john' };
        const callback = jest.fn();
        const unsubscribe = pubSub.subscribe(eventName, callback);

        // Act
        unsubscribe();
        pubSub.publish(eventName, userData);

        // Assert
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('Scenario: One subscriber unsubscribes while others remain', () => {
      it('Given multiple subscribers are subscribed to an event, When one subscriber unsubscribes, Then only the remaining subscribers should receive the published event', () => {
        // Arrange
        const eventName = 'user-login';
        const userData = { userId: 123, username: 'john' };
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const callback3 = jest.fn();
        const unsubscribe1 = pubSub.subscribe(eventName, callback1);
        pubSub.subscribe(eventName, callback2);
        pubSub.subscribe(eventName, callback3);

        // Act
        unsubscribe1();
        pubSub.publish(eventName, userData);

        // Assert
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledWith(userData);
        expect(callback3).toHaveBeenCalledWith(userData);
      });
    });

    describe('Scenario: All subscribers unsubscribe from an event', () => {
      it('Given all subscribers have unsubscribed from an event, When the event is published, Then no callbacks should be invoked', () => {
        // Arrange
        const eventName = 'user-login';
        const userData = { userId: 123, username: 'john' };
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const unsubscribe1 = pubSub.subscribe(eventName, callback1);
        const unsubscribe2 = pubSub.subscribe(eventName, callback2);

        // Act
        unsubscribe1();
        unsubscribe2();
        pubSub.publish(eventName, userData);

        // Assert
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
      });
    });
  });

  describe('Feature: Multiple publish-subscribe cycles', () => {
    describe('Scenario: Publish the same event multiple times', () => {
      it('Given a subscriber is subscribed to an event, When the event is published multiple times with different data, Then the callback should be called each time with the correct data', () => {
        // Arrange
        const eventName = 'counter';
        const callback = jest.fn();
        pubSub.subscribe(eventName, callback);

        // Act
        pubSub.publish(eventName, 1);
        pubSub.publish(eventName, 2);
        pubSub.publish(eventName, 3);

        // Assert
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenNthCalledWith(1, 1);
        expect(callback).toHaveBeenNthCalledWith(2, 2);
        expect(callback).toHaveBeenNthCalledWith(3, 3);
      });
    });

    describe('Scenario: Subscribe after previous publish', () => {
      it('Given an event has been published without subscribers, When a new subscriber subscribes and the event is published again, Then the new subscriber should only receive the latest event', () => {
        // Arrange
        const eventName = 'update';
        pubSub.publish(eventName, 'first');
        const callback = jest.fn();

        // Act
        pubSub.subscribe(eventName, callback);
        pubSub.publish(eventName, 'second');

        // Assert
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith('second');
      });
    });
  });
});
