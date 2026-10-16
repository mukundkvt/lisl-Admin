const getRoleDisplay = (role = "") => {
  const words = role.trim().split(/\s+/);

  // single word → return as is
  if (words.length === 1) {
    return words[0];
  }

  // multiple words → initials
  return words.map(word => word[0].toUpperCase()).join("");
};

export default getRoleDisplay;