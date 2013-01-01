var insta = require('..')
  , _ = require('underscore')

var Instagram = new insta({client_id: 'b6911936292d4ddda1767aba4b38e9a7', client_secret: '4429264c9d3a40189b383da9868a2b80'})

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
