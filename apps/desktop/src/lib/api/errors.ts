export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends ApiError {
  constructor() {
    super("Connection timed out");
    this.name = "TimeoutError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
