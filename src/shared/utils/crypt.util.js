const bcrypt = require("bcrypt");

async function encryptPassword(password) {
    const salt = await bcrypt.genSaltSync(10);
    return bcrypt.hash(password, salt);
}

function comparePassword(plaintextPassword, hashPassword) {
    return bcrypt.compare(plaintextPassword, hashPassword);
}

module.exports = {
    encryptPassword: encryptPassword,
    comparePassword: comparePassword,
}
