import { Service } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";

export interface ActivityMessage<T = unknown> {
    type: string;
    payload: T;
}


@Service()
export class ActivitySocket {

    connect(): Observable<ActivityMessage> {
        return new Observable<ActivityMessage>((subscriber) => {
            const socket = new WebSocket(this.resolveUrl());
            socket.onmessage = (event: MessageEvent<string>) => {
                try {
                    subscriber.next(JSON.parse(event.data) as ActivityMessage);
                } catch {
                    console.log("Malformed message dropped.");
                }
            };

            socket.onerror = () => subscriber.error(new Error('Activity socket error.'));
            socket.onclose = () => subscriber.complete();

            return () => socket.close();
        });
    }

    private resolveUrl(): string {
        const configured = environment.wsUrl;
        if (configured.startsWith('ws://') || configured.startsWith('wss://')) {
            return configured;
        }
        const schema = window.location.protocol === 'https' ? 'wss' : 'ws';
        return `${schema}//${window.location.host}${configured}`;
    }


}

