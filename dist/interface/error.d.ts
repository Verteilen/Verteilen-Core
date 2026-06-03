export declare class AppError extends Error {
    message: string;
    code: string;
    constructor(message: string, code: string);
}
export declare class CodeError extends Error {
    message: string;
    code: number;
    constructor(message: string, code: number);
}
