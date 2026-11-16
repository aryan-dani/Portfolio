function getStorage(type) {
  try {
    return type === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readStorage(key, fallback = null, type = "local") {
  try {
    return getStorage(type)?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value, type = "local") {
  try {
    getStorage(type)?.setItem(key, value);
  } catch {
    // Storage can be disabled by privacy settings; the app can still run without it.
  }
}

export function removeStorage(key, type = "local") {
  try {
    getStorage(type)?.removeItem(key);
  } catch {
    // Storage can be disabled by privacy settings; the app can still run without it.
  }
}
