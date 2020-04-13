function annotate_ping_thingy() {
    console.log("Annotating ping...");
    document.querySelectorAll('a').forEach(function(tag){
        tag.setAttribute("ping", "https://blog.habets.se/ping");
    });
    console.log("ping annotation complete");
}
(function() {
    let old = document.onreadystatechange;
    document.onreadystatechange = function() {
        if (document.readyState === "complete") {
            console.log("Document ready. Setting timer to annotate ping...");
            setTimeout(annotate_ping_thingy, 100);
        }
        if (old !== undefined && old != null) { old(); }
    };
})();
