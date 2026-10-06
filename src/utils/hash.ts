/**
 * Computes exact SHA-256 hex hash from an ArrayBuffer using Web Crypto API.
 * This runs 100% locally in the browser with high performance.
 */
export async function calculateFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
