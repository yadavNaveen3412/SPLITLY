export const getInitials = (name) => {
  if (!name) return "NA";
  const words = name.trim().split(" ");

  if (words.length === 0) {
    return "";
  }

  const firstInitial = words[0][0];

  if (words.length > 1) {
    const lastInitial = words[words.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
  }

  return firstInitial.toUpperCase();
};
