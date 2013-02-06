var EventEmitter = require('events').EventEmitter
  , rest = require('./rest')
  , _ = require('underscore')
  , url = require('url')

var default_http_options = {
    url: {
        protocol: 'https:'
      , host: 'api.instagram.com'
      , query: {}
    }
  , method: 'GET' 
  , jar: false
}

var endpoints = {
    popular: '/v1/media/popular',
    search: '/v1/media/search',
    locations_media_recent: '/v1/locations/:id/media/recent'
}

function getPathnameFromParams (endpoint, params) {
  var url = ''

  console.log('PARAMS ' + require('util').inspect(params))

  switch (endpoint) {
    case 'popular':
    case 'search':
      url = endpoints[endpoint]
      break;
    case 'locations_media_recent':
      url = endpoints[endpoint].replace(/:id/, params['location_id'])
    default:
      break;
  }

  console.log('ENDPOINT ' + endpoint)
  console.log('URL ' + url)

  return url
}

function Instagram(options) {
  if (!(this instanceof Instagram)) {
    return new Instagram(options)
  }

  if (!options || !options.client_id) {
    throw new Error('You must provide a client id!')
  }

  if (!options || !options.client_secret) {
    throw new Error('You must provide a client secret!')
  }

  if (options.debug === true) {
    this.debug = true
  } else {
    this.debug = false
  }

  this.buffers = {}
  this.http_options = default_http_options
  this.http_options.url.query.client_id = options.client_id
  this.http_options.url.query.client_secret = options.client_secret
}

/*
 * execute callback with stream object as param
 */
Instagram.prototype.stream = function(method, params, callback) {
  var stream = new EventEmitter()

  var self = this
  this.stream = stream

  setInterval(function() {
    if (self.debug) {
      console.log('calling checkForUpdates...')
    }

    self.checkForUpdates(method, params)
  }, 5000);

  return callback(stream)
}

Instagram.prototype.search = function(params, callback) {
  var stream = new EventEmitter()

  var self = this
  this.stream = stream

  var method = 'search'

  setInterval(function() {
    if (self.debug) {
      console.log('[search] calling checkForUpdates...')
    }

    self.checkForUpdates(method, params)
  }, 5000);

  return callback(stream)
}

Instagram.prototype.locations_media_recent = function(params, callback) {
  var stream = new EventEmitter()

  var self = this
  this.stream = stream

  var method = 'locations_media_recent'

  setInterval(function() {
    if (self.debug) {
      console.log('[location_media_recent] calling checkForUpdates...')
    }

    console.log(require('util').inspect(method))
    console.log(require('util').inspect(params))

    self.checkForUpdates(method, params)
  }, 5000);

  return callback(stream)
}

Instagram.prototype.checkForUpdates = function(method, params) {
  var buffers = this.buffers

  if (!buffers[method]) {
    buffers[method] = []
  }

  var self = this
  var stream = self.stream

  if (self.debug) {
    console.log('hitting rest endpoint')
  }

  var options = self.http_options
  options.qs = params
  options.url = url.format(_.extend(self.http_options.url, {pathname: getPathnameFromParams(method, params)}))

  console.log(require('util').inspect(options))

  rest.get(options, function(err, resp) {
    if (err) {
      console.log('Error: ' + err)
    }

    if (self.debug) {
      console.log('got response ' + typeof(resp))
    }

    var newPosts = []
    _.each(resp.data, function(post) {
      if (!_.contains(buffers[method], post.id)) {
        newPosts.push(post)
        buffers[method].push(post.id)
      }
    })

    if (newPosts.length > 0) {
      if (this.debug) {
        console.log('got ' + newPosts.length + ' new posts')
      }
      stream.emit('data', newPosts) 
    }
  })
}

module.exports = Instagram
