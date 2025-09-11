export interface Trigger<TriggerConfig extends { type: string }> {
  register(id: string, config: TriggerConfig): void;
  unregister(id: string): void;
}
