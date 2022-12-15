# Event Emitters

-   `events.EventEmitter` is a class which is used to provide a consitent interface for emitting (trigerring) and binding callbacks to events.
-   It is used internally in many of the Node core libraries and provides a solid foundation to build event-based classes and applications.
-   The `event` module offers the `EventEmitter` class which exposes many methods like:
    -   `emitter.on(eventName, listener)`
    -   `emitter.once(eventName, listener)`
    -   `emitter.addListener(eventName, listener)`
    -   `emitter.emit(eventName[, ...args])`
    -   `emitter.removeListener(eventName, listener)`
    -   `emitter.off(eventName, listener)`
    -   `emitter.removeAllListeners([eventName])`

A code example can be found in [event_emitters.js](./event_emitters.js)