"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class CodeError extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
        this.name = 'CodeError';
    }
}
exports.CodeError = CodeError;
//# sourceMappingURL=error.js.map