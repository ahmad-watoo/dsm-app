export function decodeJwt(token) {
  try {
    const payload = String(token).split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    );
  } catch {
    return null;
  }
}

export function isTokenExpired(token, skewSeconds = 30) {
  if (!token) return true;
  const exp = decodeJwt(token)?.exp;
  if (!exp) return false;
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export const isTokenUsable = (token) => !!token && !isTokenExpired(token);

export function millisUntilExpiry(token) {
  const exp = decodeJwt(token)?.exp;
  if (!exp) return null;
  return exp * 1000 - Date.now();
}
