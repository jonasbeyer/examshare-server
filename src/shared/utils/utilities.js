const crypto = require("crypto");

function generateId() {
  const sha = crypto.createHash("sha256");
  sha.update(Date.now().toString() + Math.random().toString());
  return sha.digest("hex");
}

function truncate(str, limit) {
  let bits, i;
  if (str.length <= limit) return str;
  bits = str.split("");
  for (i = bits.length - 1; i > -1; --i) {
    if (i > limit) bits.length = i;
    else if (" " === bits[i]) {
      bits.length = i;
      break;
    }
  }
  bits.push("...");
  return bits.join("");
}

function isPropertyEnabled(user, property, map) {
  if (map)
    return (
      typeof user.properties.get(property) === "undefined" ||
      user.properties.get(property) === "true"
    );
  return (
    typeof user.properties[property] === "undefined" ||
    user.properties[property] === "true"
  );
}

module.exports = {
  isPropertyEnabled: isPropertyEnabled,
  generateId: generateId,
  truncate: truncate,
};
