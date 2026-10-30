/** ThinkJS 3's package exports a constructor, while its bundled types omit it. */
export interface ApplicationOptions {
  ROOT_PATH: string;
  APP_PATH: string;
  proxy?: boolean;
  env: 'development' | 'production';
}
export interface ApplicationInstance { run(): void }
export type ApplicationConstructor = new (options: ApplicationOptions) => ApplicationInstance;
