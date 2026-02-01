const decodeBase64Url = (value) => {
  if (!value) return null;
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
    return atob(padded);
  } catch {
    return null;
  }
};

const encodeBase64Url = (value) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

export const encodeSession = (payload) => {
  try {
    return encodeBase64Url(JSON.stringify(payload));
  } catch {
    return null;
  }
};

export const decodeSession = (token) => {
  const decoded = decodeBase64Url(token);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
