/**
 * PubSub.ts
 *
 * This class implements the Publish-Subscribe (Pub/Sub) pattern,
 * providing a asynchronous event-driven communication within the applicaiton.
 * It includes methods for subscribing to events, publishing events to
 * pass the new/updated data and notifiy subscribers, and un-subscribing from events
 * to prevent memory leaks. This pattern promotes loose coupling between components,
 * allowing greater scalability and maintainability event handling.
 * 
 * Ported from FTM
*/
export class PubSub {
  protected subscribers: any = {};
  static NEXT_ID: number = 0;

  /**
   * Subscribes to the given event. Returns an unsubscribe function.
   * @param event name of the event to subscribe to.
   * @param callback callback function to be invoked when the event is published.
   * @returns unsubscribe function to remove the subscription.
   */
  subscribe(event: string, callback: (data: any) => void) {
    const id = PubSub.NEXT_ID++;

    if (!this.subscribers[event]) {
        this.subscribers[event] = {};
    };

    this.subscribers[event][id] = callback;

    return () => {
        this.unsubscribe(event, id);
    }
  }

  protected unsubscribe(event: string, subscriptionId: number){
    if(!this.subscribers[event] || !this.subscribers[event][subscriptionId]) return;
    delete this.subscribers[event][subscriptionId];
  }

  publish(event: string, data: any) {
    if(!this.subscribers[event]) return;

    Object.keys(this.subscribers[event]).forEach(listenerId => {
      if (this.subscribers[event][listenerId]) {
        this.subscribers[event][listenerId](data);
      };
    });
  }
}