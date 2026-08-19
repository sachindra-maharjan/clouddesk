package io.clouddesk.shared.events;

public interface DomainEventPublisher {
    void publish(Object event);
}
