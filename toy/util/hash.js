const crypto = require('crypto')

function Hash(data) {
  const hash = crypto.createHash('sha256')
  hash.update(data);
  return hash.digest('hex')
}

module.exports = {Hash}