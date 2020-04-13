function log_performance() {
    $.post("https://cdn.habets.se/ping", {"performance": JSON.stringify(window.performance)});
    console.log("performance logged");
}
function try_log_performance() {
    if (document.readyState === "complete") {
        log_performance();
    } else {
        setTimeout(try_log_performance, 1000);
    }
}
$(document).ready(try_log_performance);
