export class AppError extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class CodeError extends Error {
  constructor(public message: string, public code: number) {
    super(message);
    this.name = 'CodeError';
  }
}