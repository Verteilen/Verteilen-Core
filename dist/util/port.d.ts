/**
 * Prevent use port which it's already use by other program
 * @param start Port start number
 * @returns The available port
 */
export declare const PortAvailable: (start: number) => Promise<number>;
