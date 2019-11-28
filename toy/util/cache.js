let cacheMap = { }

function isCache(fileName) {
  return cacheMap[fileName] ? true : false
}

function isChange(fileName, hash) {
  return cacheMap[fileName] !== hash
}

function makeCache(fileName, hash) {
  cacheMap[fileName] = hash
}

module.exports = {
  isCache,
  isChange,
  makeCache
}