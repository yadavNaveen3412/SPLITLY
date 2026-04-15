import xss from "xss";

export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return xss(value.trim());
};
