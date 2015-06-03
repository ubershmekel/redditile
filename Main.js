rt = {};

rt.columns = 2;
rt.articles = []
rt.setupIndex = 0;
rt.placeHolderClones = {};
rt.placeHolder = $("<img class='placeHolder item' src='loading.png' />");
rt.dataUrl = 'data-url';
rt.isPendingAjax = 'data-isPendingAjax';
rt.activeAjax = false;

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

rt.fixPlaceHolder = function ($item, url) {
    if (url == null) {
        var nextUrl = rt.articles[rt.setupIndex];
        if (nextUrl === undefined && !rt.activeAjax) {
            rv.next();
            return;
        }

        $item.attr(rt.dataUrl, nextUrl);
        url = nextUrl;
        rt.setupIndex++;

        rt.verifyPlaceHolders();
    }

    $item.attr(rt.isPendingAjax, "true");
    embedit.embed(url, function (elem) {
        if (!elem) {
            $item.attr(rt.dataUrl, '');
            // TODO: try next url
            return;
        }
        $(elem).attr(rt.dataUrl, url);
        rt.placeHolderClones[url] = $item[0];
        $item.replaceWith(elem);
    });
}

rt.fixElementVisibility = function (item) {
    var $item = $(item);
    var isPlaceHolder = $item.hasClass('placeHolder');
    var isInView = rt.inViewFilter(item);
    var url = $item.attr(rt.dataUrl);
    var isPendingAjax = $item.attr(rt.isPendingAjax);
    var emb = function (elem) {
        $item.removeAttr(rt.isPendingAjax);
        if (!elem) {
            console.log("removing " + url);
            $item.remove();
        }
        $(elem).attr(rt.dataUrl, url);
        $item.replaceWith(elem);
    }
    if (isPlaceHolder && isInView && !isPendingAjax) {
        $item.attr(rt.isPendingAjax, "true");
        embedit.embed(url, emb);

        //rt.fixPlaceHolder($item, url);
        //$item.remove();
        //console.log("vis");
        //$(item).replaceWith(real);

        //if (real.play)
            // video elements don't autoplay when put back into the DOM
        //    real.play();

        //rt.elements[i].show();
        //rt.placeHolderClones[i].hide();
    } else {
        if (!isPlaceHolder && !isInView && !isPendingAjax) {
            $item.attr(rt.isPendingAjax, "true");
            var placeHolder = rt.placeHolderClones[url];
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
            $item.removeAttr(rt.isPendingAjax);
        }
        //rt.elements[i].hide();
        //rt.placeHolderClones[i].show();
    }
}

rt.embedFunc = function (elem) {
    //rt.container.append(elem);
    elem.error(function () {
        // e.g. if we put something that's not an image in an <img> tag
        console.log("Failed to load elem: ");
        console.warn(elem);
        elem.remove();
    });

    //rt.fixElementVisibility(pcClone, elem[0], pcClone);
}

rt.checkVisibility = function () {
    var items = $('.item');
    for (var i = 0; i < items.length; i++) {
        rt.fixElementVisibility(items[i])
    }
}

rv.verifyPlaceHolders = function() {
    for (var i = 0; i < rt.columns; i++) {
        var colId = rt.columnId(i);
        var pchs = $(colId + ' .placeHolder');
        var last = pchs[pchs.length - 1];
        if (last === undefined) {
            var pcClone = rt.placeHolder.clone();
            $(colId).append(pcClone[0]);
            continue
        }
        //rt.placeHolderClones[url] = pcClone[0];
        //var col = Object.keys(rt.placeHolderClones).length % 2;
        //$(rt.columnId(col)).append(pcClone[0]);
    }
}

rt.columnId = function (columnIndex) {
    return '#col' + columnIndex;
}

rt.main = function () {
    rt.containerSelector = "#container";
    rt.container = $(rt.containerSelector);

    $w.on("scroll.unveil resize.unveil lookup.unveil", rt.checkVisibility);



    rv.handleUrl = function (url) {
        // `[0]` to remove the jquery-ness for later comparison to the element
        //rt.elements.push(elem[0]);

        // `[0]` to remove the jquery-ness for later comparison to the element
        var pcClone = rt.placeHolder.clone();
        pcClone.attr(rt.dataUrl, url);
        rt.placeHolderClones[url] = pcClone[0];

        //rt.container.append(pcClone[0]);
        var col = Object.keys(rt.placeHolderClones).length % 2;
        $(rt.columnId(col)).append(pcClone[0]);

        //embedit.embed(imgUrl, embedFunc);
    }

    rv.getItems(function (data) {
        console.log(data); console.log(rv.subredditName);
        var articles = data.data.children;
        //$.merge(rt.articles, articles);

        for (var i = 0; i < articles.length; i++) {
            var item = articles[i];
            var url = item.data.url;
            var title = item.data.title;
            var over18 = item.data.over_18;
            var commentsUrl = rv.redditBaseUrl + item.data.permalink;
            rv.handleUrl(url);
        };

        rt.checkVisibility();
        //setTimeout(function () { rt.checkVisibility(); }, 100);
        //$(window).trigger("resize");
    });
}

$(function () {
    rt.main();
});

