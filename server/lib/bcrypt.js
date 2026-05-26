const bcryptjs = require('bcryptjs');
const { promisify } = require('node:util');

const genSalt = promisify(bcryptjs.genSalt);
const hash = promisify(bcryptjs.hash);
const compare = promisify(bcryptjs.compare);

module.exports = {
  genSalt,
  hash,
  compare
};
