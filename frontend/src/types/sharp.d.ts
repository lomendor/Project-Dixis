/**
 * Shim for optional 'sharp' dependency used behind runtime flags.
 * This prevents Next/TS builds from failing on environments where sharp isn't installed.
 * If/when we require image processing everywhere, replace this shim with a real dependency and types.
 */
declare module 'sharp';
