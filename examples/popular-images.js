var insta = require('..')
  , _ = require('underscore')

var Instagram = new insta({client_id: 'CLIENT_ID', client_secret: 'CLIENT_SECRET'})

Instagram.stream('popular', '', function(stream) {
  stream.on('data', function(data) {
    console.log('====> receiving ' + data.length + ' new posts')
    _.each(data, function(media) {
      var caption = ''
      if (media.caption) {
        caption = media.caption.text
      }
      console.log(caption + ' (' + media.images.standard_resolution.url + ') ' + media.likes.count + ' likes')
    })
  })
})
