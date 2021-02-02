export class ThreeBoxError extends Error {
  constructor(public sourceError?: Error, message?: string) {
    super(message);
  }
}
