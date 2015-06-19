rt = {};

rt.columns = 2;
rt.articles = [];
rt.setupIndex = 0;
rt.placeHolderClones = {};
rt.placeHolder = $("<img class='placeHolder item' src='loading.png' />");
rt.dataUrl = 'data-url';
rt.dataComments = 'data-comments';
rt.isPendingAjax = 'data-isPendingAjax';
rt.activeAjax = false;

var $w = $(window);
var th = 20;

rt.resize = function () {
    $(window).trigger("resize");
}

rt.isVisible = function (e) {
    // https://github.com/luis-almeida/unveil
    var $e = $(e);
    if ($e.is(":hidden")) return;

    var wt = $w.scrollTop(),
        wb = wt + $w.height(),
        et = $e.offset().top,
        eb = et + $e.height();

    return eb >= wt - th && et <= wb + th;
};


rt.fixElementVisibility = function (item) {
    var $item = $(item);
    var isPlaceHolder = $item.hasClass('placeHolder');
    var isInView = rt.isVisible(item);
    var url = $item.attr(rt.dataUrl);
    var commentsUrl = $item.attr(rt.dataComments);
    var isPendingAjax = $item.attr(rt.isPendingAjax);
    if (isPlaceHolder && isInView && !isPendingAjax) {
        // show the url
        var emb = function (elem) {
            $item.removeAttr(rt.isPendingAjax);
            if (!elem) {
                console.log("removing " + url);
                $item.remove();
                return;
            }
            elem.error(function () {
                // e.g. if we put something that's not an image in an <img> tag
                console.log("Failed to load elem: ");
                console.warn(elem);
                elem.remove();
            });

            var link = $('<a />', {
                href: commentsUrl,
                class: "item"
            });
            link.append(elem);
            link.attr(rt.dataUrl, url);
            $item.replaceWith(link);
        }
        $item.attr(rt.isPendingAjax, "true");
        embedit.embed(url, emb);


    } else {
        if (!isPlaceHolder && !isInView && !isPendingAjax && rt.unload) {
            // replace it with a placeholder
            $item.attr(rt.isPendingAjax, "true");
            var placeHolder = rt.placeHolderClones[url];
            var h = $item.height();
            var w = $item.width();
            var $pc = $(placeHolder);
            if (h > 0 && w > 0) {
                // I don't know why but the reported width was 0.5 pixels too big on my system
                // and it caused elements to shift around when I was scrolling with the
                // debug console open.
                $pc.width(w - 0.5);
                $pc.height(h - 0.5);
            }
            $item.replaceWith(placeHolder);
            $item.removeAttr(rt.isPendingAjax);
        }
    }
}

rt.getBottom = function(el) {
    var $el = $(el);
    return $el.offset().top + $el.height();
}

rt.balanceColumnHeight = function () {
    var thingsMoving = true;
    while (thingsMoving) {
        thingsMoving = false;
        var bottoms = $('.item:last-child');
        if (bottoms.length < 2)
            // 1 or 0, there's nothing to balance
            return;

        // find shortest column
        var shortestColumnIndex = 0;
        var shortestColumnBottom = rt.getBottom(bottoms[0]);
        for (var i = 1; i < bottoms.length; i++) {
            var bottom = rt.getBottom(bottoms[i]);
            if (shortestColumnBottom > bottom) {
                // E.g.
                // 0 is the top of the document
                // 100 is lower down
                shortestColumnBottom = bottom;
                shortestColumnIndex = i;
            }
        }

        // Shorten too long columns
        for (var i = 0; i < bottoms.length; i++) {
            var top = $(bottoms[i]).offset().top;
            if (top > shortestColumnBottom) {
                // move to that shortest column
                $(rt.columnId(shortestColumnIndex)).append(bottoms[i]);
                thingsMoving = true;
                break;
            }
        }
    }
}

rt.checkVisibility = function () {
    var items = $('.item');
    rt.unload = document.getElementById('unload').checked;
    for (var i = 0; i < items.length; i++) {
        rt.fixElementVisibility(items[i])
    }

    rt.balanceColumnHeight();

    if (!rt.isGettingReddit && rt.isVisible($('#footer'))) {
        rt.isGettingReddit = true;
        rv.next();
    }
}

rt.columnId = function (columnIndex) {
    return '#col' + columnIndex;
}

rt.handleUrl = function (item) {
    // I thought of placing only 1 placeholder in each column
    // and upon revealing deciding which url it actually got.
    // But that turned out lame because you wouldn't get good results when you
    // hit the "end" button.

    var url = item.data.url;
    var title = item.data.title;
    var over18 = item.data.over_18;
    var commentsUrl = rv.redditBaseUrl + item.data.permalink;

    // `[0]` to remove the jquery-ness for later comparison to the element
    var pcClone = rt.placeHolder.clone();
    pcClone.attr(rt.dataUrl, url);
    pcClone.attr(rt.dataComments, commentsUrl);
    rt.placeHolderClones[url] = pcClone[0];

    //rt.container.append(pcClone[0]);
    var col = Object.keys(rt.placeHolderClones).length % 2;
    $(rt.columnId(col)).append(pcClone[0]);

}

rt.handleRedditData = function (data) {
    rt.isGettingReddit = false;
    console.log(data); console.log(rv.subredditName);
    var articles = data.data.children;
    $.merge(rt.articles, articles);

    for (var i = 0; i < articles.length; i++) {
        var item = articles[i];
        rt.handleUrl(item);
    };

    // give the renderer 1ms to organize the images
    // so we don't load anything too early
    setTimeout(rt.checkVisibility, 1);
}

rt.main = function () {
    rt.containerSelector = "#container";
    rt.container = $(rt.containerSelector);

    $w.on("scroll.unveil resize.unveil lookup.unveil", rt.checkVisibility);

    rt.isGettingReddit = true;
    rv.getItems(rt.handleRedditData);

    $("#title").html("<a href='" + rv.visitSubredditUrl + "'>" + rv.truncatedSubredditName + "</a> - redditile");

    var autoScrollButton = $("#autoScrollButton");
    autoScrollButton.click(function () {
        if (rt.anim === undefined) {
            autoScrollButton.addClass('topRightHover');
            var footerTop = $('#footer').offset().top;
            var milliSecondsToAnimate = $('#timeToScroll').val() * 1000;
            rt.anim = $('body').animate({ scrollTop: footerTop }, {
                easing: "linear",
                duration: milliSecondsToAnimate,
                complete: function () {

                }
            });
        } else {
            rt.anim.stop();
            //autoScrollButton.removeClass('topRightHover');
            rt.anim = undefined;
        }
    });
}

$(function () {
    rt.main();
});

