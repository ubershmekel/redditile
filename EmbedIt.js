embedit = {};

embedit.video = function (urls) {
    var video = $('<video autoplay loop />');
    //video.attr("src", urls[0]);
    var atLeastOneGood = false;
    for (var i = 0; i < urls.length; i++) {
        if (!urls[i]) {
            conosle.error("Bogus url to embed as video: '" + url + "'");
            continue;
        }
        atLeastOneGood = true;
        var source = $('<source src="' + urls[i] + '"/>');
        video.append(source);
    }
    video.attr("class", "item");

    if(atLeastOneGood)
        return video;
}

embedit.unsupported = function(url) {
    console.log("Omitting unsupported url: '" + url + "'");
}

embedit.convertors = [
    {
        name: "youtube",
        detect: /(youtube\.com|youtu\.be)\/.*/,
        convert: function (url) {
            embedit.unsupported(url);
        }
    },
    {
        name: "imgurAlbums",
        detect: /imgur\.com\/a\/.*/,
        convert: function (url) {
            embedit.unsupported(url);
        }
    },
    {
        name: "imgurGifv",
        detect: /imgur\.com.*(gifv|mp4|webm)/,
        convert: function (url) {
            var mp4Url = url.replace(/\.gifv/i, '.webm');
            var webmUrl = url.replace(/\.gifv/i, '.mp4');
            return embedit.video([mp4Url, webmUrl]);
        }
    },
    {
        name: "imgurNoExtension",
        detect: /imgur\.com[^\.]+/,
        convert: function (url) {
            var newUrl = url + '.jpg';
            var image = $('<img />');
            image.attr("src", newUrl);
            image.attr("class", "item");
            return image;
        }
    },
    {
        name: "redditPost",
        detect: /reddit\.com\/r\/.*/,
        convert: function (url) {
            embedit.unsupported(url);
        }
    },
    {
        name: "gfycat",
        detect: /gfycat\.com.*/,
        convert: function (url, embedFunc) {
            //https://gfycat.com/cajax/get/ScaryGrizzledComet
            var match = url.match(/gfycat.com\/(\w+)/i);
            if(match && match.length > 1)
                var name = match[1];
            else
                return null;
            
            $.ajax({
                url: 'https://gfycat.com/cajax/get/' + name,
                dataType: "jsonp",
                success: function(data) {
                    embedFunc(embedit.video([data.gfyItem.webmUrl, data.gfyItem.mp4Url]));

                }
            })
        },
    },
    {
        name: "imageExtension",
        detect: /\.(png|jpg|jpeg|gif|bmp)$/,
        convert: function (url, embedFunc) {
            var newElem = $('<img />', {
                id: '',
                src: url,
                alt: '',
                class: "item"
            });
            embedFunc(newElem);
        }
    },

]

embedit.embed = function (url, embedFunc) {
    //var embedFunc = function (elem) {
    //    elem.appendTo($("#container"));
    //}
    for (var key in embedit.convertors) {
        var convertor = embedit.convertors[key];
        if (url.match(convertor.detect)) {
            //console.log("Matched: " + url + "\n to - " + convertor.name);
            newElem = convertor.convert(url, embedFunc);
            //console.log(newElem);
            if (newElem)
                embedFunc(newElem);
            return;
        }

    }
}