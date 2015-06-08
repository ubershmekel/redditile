var rv = {};

rv.redditBaseUrl = "//www.reddit.com";
if (document.location.protocol.indexOf("file") == 0) {
    rv.redditBaseUrl = "https:" + rv.redditBaseUrl;
}
rv.decodeUrl = function (url) {
    return decodeURIComponent(url.replace(/\+/g, " "))
}
rv.getRestOfUrl = function () {
    // Separate to before the question mark and after
    // Detect predefined reddit url paths. If you modify this be sure to fix
    // .htaccess
    // This is a good idea so we can give a quick 404 page when appropriate.

    var regexS = "(/(?:(?:r/)|(?:user/)|(?:domain/)|(?:search))[^&#?]*)[?]?(.*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    //log(results);
    if (results == null) {
        return ["", ""];
    } else {
        return [results[1], rv.decodeUrl(results[2])];
    }
}
rv.failedAjax = function (data) {
    alert("Failed ajax, maybe a bad url? Sorry about that :(");
    //failCleanup();
};

rv.setupUrls = function () {
    rv.urlData = rv.getRestOfUrl();
    //log(rv.urlData)
    rv.subredditUrl = rv.urlData[0]
    rv.getVars = rv.urlData[1]

    if (rv.getVars.length > 0) {
        rv.getVarsQuestionMark = "?" + rv.getVars;
    } else {
        rv.getVarsQuestionMark = "";
    }

    // Remove .compact as it interferes with .json (we got "/r/all/.compact.json" which doesn't work).
    rv.subredditUrl = rv.subredditUrl.replace(/.compact/, "")
    // Consolidate double slashes to avoid r/all/.compact/ -> r/all//
    rv.subredditUrl = rv.subredditUrl.replace(/\/{2,}/, "/")

    if (rv.subredditUrl === "") {
        rv.subredditUrl = "/";
        rv.subredditName = "reddit.com" + rv.getVarsQuestionMark;
        //var options = ["/r/aww/", "/r/earthporn/", "/r/foodporn", "/r/pics"];
        //subredditUrl = options[Math.floor(Math.random() * options.length)];
    } else {
        rv.subredditName = rv.subredditUrl + rv.getVarsQuestionMark;
    }


    rv.visitSubredditUrl = rv.redditBaseUrl + rv.subredditUrl + rv.getVarsQuestionMark;

    // truncate and display subreddit name in the control box
    rv.truncatedSubredditName = rv.subredditName;
    // empirically tested capsize, TODO: make css rules to verify this is enough.
    // it would make the "nsfw" checkbox be on its own line :(
    var capsize = 19
    if (rv.truncatedSubredditName.length > capsize) {
        rv.truncatedSubredditName = rv.truncatedSubredditName.substr(0, capsize) + "&hellip;";
    }

    // TODO These
    //$('#subredditUrl').html("<a href='" + visitSubredditUrl + "'>" + rv.truncatedSubredditName + "</a>");
    //document.title = "redditP - " + subredditName;

    rv.jsonUrl = rv.redditBaseUrl + rv.subredditUrl + ".json?jsonp=?" + rv.after + "&" + rv.getVars;
}



rv.getItems = function (usersHandleData) {
    console.log("1");
    rv.after = "";
    rv.setupUrls();

    var rvHandleData = function (data) {
        // NOTE: if data.data.after is null then this causes us to start
        // from the top on the next getNextImages which is fine.
        rv.after = "&after=" + data.data.after;
        return usersHandleData(data);
    }

    // I still haven't been able to catch jsonp 404 events so the timeout
    // is the current solution sadly.
    rv.next = function () {
        $.ajax({
            url: rv.jsonUrl,
            dataType: 'jsonp',
            success: rvHandleData,
            error: rv.failedAjax,
            //complete: doneAjaxReq,
            404: rv.failedAjax,
            timeout: 5000,
        });
    };

    rv.next();
}