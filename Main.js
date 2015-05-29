rt = {};


rt.elements = []
rt.placeHolderClones = [];
rt.placeHolder = $("<img class='placeHolder' src='loading.png' />");

var $w = $(window);
var th = 20;

rt.resize = function () {
    $(window).trigger("resize");
}

rt.inViewFilter = function (e) {
    // https://github.com/luis-almeida/unveil
    var $e = $(e);
    if ($e.is(":hidden")) return;

    var wt = $w.scrollTop(),
        wb = wt + $w.height(),
        et = $e.offset().top,
        eb = et + $e.height();

    return eb >= wt - th && et <= wb + th;
};

rt.fixElementVisibility = function(item, real, placeHolder) {
    if (rt.inViewFilter(item)) {
        //console.log("vis");
        $(item).replaceWith(real);
        if (real.play)
            real.play();
        //rt.elements[i].show();
        //rt.placeHolderClones[i].hide();
    } else {
        //console.log("invis")
        if (placeHolder != item) {
            var $item = $(item);
            var h = $item.height();
            var w = $item.width();
            var $pc = $(placeHolder);
            if (h > 0 && w > 0) {
                // I don't know why but the reported width was 0.5 too big on my system
                // and it caused elements to shift around when I was scrolling with the
                // debug console open.
                $pc.width(w - 0.5);
                $pc.height(h - 0.5);
            }
            $item.replaceWith(placeHolder);
        }
        //rt.elements[i].hide();
        //rt.placeHolderClones[i].show();
    }
}

rt.checkVisibility = function () {
    var items = rt.container.children();
    for (var i = 0; i < items.length; i++) {
        rt.fixElementVisibility(items[i], rt.elements[i], rt.placeHolderClones[i])
    }
}

rt.main = function () {
    rt.containerSelector = "#container";
    rt.container = $(rt.containerSelector);

    $w.on("scroll.unveil resize.unveil lookup.unveil", rt.checkVisibility);

    //var wall = new freewall(rt.containerSelector);
    //wall.reset({
    //    selector: '.item',
    //    animate: true,
    //    cellW: 'auto',
    //    cellH: 'auto',
    //    fixSize: 0,
    //    draggable: true,
    //    onResize: function () {
    //        wall.fitWidth();
    //    }
    //});
    //wall.fitWidth();

    // for scroll bar appear;
    //rt.resize();

    var embedFunc = function (elem) {
        //rt.container.append(elem);
        elem.error(function () {
            console.log("Failed to load elem: ");
            console.warn(elem);
            //elem.hide();
            elem.remove();
            //rt.resize();
        });
        //elem.appendTo($(rt.containerSelector));
        //$(rt.containerSelector).append(elem);


        //rt.container.append(elem);
        // `[0]` to remove the jquery-ness for later comparison to the element
        rt.elements.push(elem[0]);
        //elem.hide();
        var pcClone = rt.placeHolder.clone();
        // `[0]` to remove the jquery-ness for later comparison to the element
        rt.placeHolderClones.push(pcClone[0]);
        rt.container.append(pcClone);

        //rt.container.append(elem);
        //rt.resize();
        rt.fixElementVisibility(pcClone, elem[0], pcClone);
    }


    rv.getItems(function (data) {
        console.log(data); console.log(rv.subredditName);
        var articles = data.data.children;
        for (var i = 0; i < articles.length; i++) {
            var item = articles[i];
            var imgUrl = item.data.url;
            var title = item.data.title;
            var over18 = item.data.over_18;
            var commentsUrl = rv.redditBaseUrl + item.data.permalink;
            embedit.embed(imgUrl, embedFunc);
        };

        //setTimeout(function () { rt.checkVisibility(); }, 100);
        //$(window).trigger("resize");
    });

    //embedit.embed(rt.containerSelector, "http://i.imgur.com/A61SaA1.gifv");
    //embedit.embed(rt.containerSelector, "http://i.imgur.com/zvATqgs.mp4");
    
}

$(function () {
    rt.main();
});

