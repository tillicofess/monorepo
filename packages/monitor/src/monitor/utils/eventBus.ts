type EventHandler<T = unknown> = (payload: T) => void;

class EventBus {
    private events: Record<string, EventHandler[]> = {};

    on<T = unknown>(event: string, handler: EventHandler<T>) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler as EventHandler);
    }

    off<T = unknown>(event: string, handler: EventHandler<T>) {
        this.events[event] = this.events[event]?.filter(
            (fn) => fn !== handler
        );
    }

    emit<T = unknown>(event: string, payload: T) {
        this.events[event]?.forEach((handler) => {
            handler(payload);
        });
    }
}

export const eventBus = new EventBus();
