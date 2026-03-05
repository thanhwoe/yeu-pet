export interface IEventBusService {
  publish(channel: string, message: any): Promise<void>;
  subscribe(
    channel: string,
    handler: (msg: any) => void,
    onError?: (error: unknown) => void,
  ): Promise<() => Promise<void>>;
}

export const IEventBusService = Symbol('IEventBusService');
