embedit = {};

embedit.video = function (url) {
    if (!url) {
        conosle.error("Bogus url to embed as video: '" + url + "'");
        return;
    }
    var video = $('<video autoplay loop />');
    video.attr("src", url);
    video.attr("class", "item");
    return video;
}

embedit.unsupported = function(url) {
    console.log("Omitting unsupported url: '" + url + "'");
}

embedit.convertors = [
    {
        name: "imgurGifv",
        detect: /imgur\.com.*(gifv|mp4|webm)/,
        convert: function (url) {
            var newUrl = url.replace(/\.gifv/i, '.webm');
            return embedit.video(newUrl);
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
                    embedFunc(embedit.video(data.gfyItem.webmUrl));

                }
            })
        }
    }
]

embedit.embed = function (url, embedFunc) {
    //var embedFunc = function (elem) {
    //    elem.appendTo($("#container"));
    //}
    for (var key in embedit.convertors) {
        var convertor = embedit.convertors[key];
        if (url.match(convertor.detect)) {
            console.log("Matched: " + url + "\n to - " + convertor.name);
            newElem = convertor.convert(url, embedFunc);
            //console.log(newElem);
            if (newElem)
                embedFunc(newElem);
            return;
        }

    }

    var newElem = $('<img />', {
        id: '',
        src: url,
        alt: '',
        class: "item"
    });
    embedFunc(newElem);
}