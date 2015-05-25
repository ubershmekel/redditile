rt = {};

rt.containerSelector = "#container";
rt.container = $(rt.containerSelector);

rt.main = function () {
    var wall = new freewall(rt.containerSelector);
    wall.reset({
        selector: '.item',
        animate: true,
        cellW: 200,
        cellH: 200,
        onResize: function () {
            wall.fitWidth();
        }
    });
    wall.fitWidth();
    // for scroll bar appear;
    $(window).trigger("resize");

    var embedFunc = function (elem) {
        //rt.container.append(elem);
        elem.appendTo($(rt.containerSelector));
        $(window).trigger("resize");
    }


    rv.getItems(function (data) {
        console.log(data); console.log(rv.subredditName);
        $.each(data.data.children, function (i, item) {
            var imgUrl = item.data.url;
            var title = item.data.title;
            var over18 = item.data.over_18;
            var commentsUrl = rv.redditBaseUrl + item.data.permalink;
            embedit.embed(imgUrl, embedFunc);
        });
        //$(window).trigger("resize");
    });

    //embedit.embed(rt.containerSelector, "http://i.imgur.com/A61SaA1.gifv");
    //embedit.embed(rt.containerSelector, "http://i.imgur.com/zvATqgs.mp4");
    
}

$(function () {
    rt.main();
});

