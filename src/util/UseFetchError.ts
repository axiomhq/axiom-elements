// Hopefully doing this correct 🤞️
// https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
// https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work

export class UseFetchError extends Error {
  constructor(public status: number, public statusText?: string, message?: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UseFetchError.prototype);

    Error.captureStackTrace(this, this.constructor); // after initialize properties
  }
}
