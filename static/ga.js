var _gaq = _gaq || [];
function activate_ga() {
    _gaq.push(['_setAccount', 'UA-2913250-5']);
    _gaq.push(['_trackPageview']);
    let ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
    let s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
    console.log("GA added");
}
(function() {
    let old = document.onreadystatechange;
    document.onreadystatechange = function() {
        if (document.readyState === "complete") {
            setTimeout(activate_ga, 100);
        }
        if (old !== undefined && old != null) { old(); }
    };
})();
