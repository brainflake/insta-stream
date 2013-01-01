var request = require('request')

exports.get = function get(url, cb) {
  request(url, function(err, res, body) {
    cb(err, JSON.parse(body))
  })
}
