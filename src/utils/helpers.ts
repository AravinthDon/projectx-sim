/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random number between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random decimal between min and max
 */
export function randomDecimal(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
}

/**
 * Get current ISO timestamp
 */
export function now(): string {
    return new Date().toISOString();
}

/**
 * Add delay if configured
 */
export async function applyResponseDelay(delayMs: number): Promise<void> {
    if (delayMs > 0) {
        await sleep(delayMs);
    }
}
