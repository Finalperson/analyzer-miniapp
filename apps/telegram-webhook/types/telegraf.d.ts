declare module 'telegraf' {
  export class Telegraf<TContext = any> {
    constructor(token: string);
    start(fn: (ctx: any) => any): void;
    hears(trigger: any, fn: (ctx: any) => any): void;
    on(updateType: string, fn: (ctx: any) => any): void;
    handleUpdate(update: any): Promise<void>;
  }
  export const Markup: any;
}
