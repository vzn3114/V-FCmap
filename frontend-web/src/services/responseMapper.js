const toBooleanIfPresent = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return Boolean(value);
};

export const withVerified = (record) => {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return record;
  }

  const verified = toBooleanIfPresent(record.is_verified ?? record.isVerified);
  if (verified === undefined) {
    return record;
  }

  return {
    ...record,
    isVerified: verified,
    is_verified: verified,
  };
};

export const mapWithVerified = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map((item) => withVerified(item));
  }

  return withVerified(payload);
};
