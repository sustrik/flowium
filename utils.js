////////////////////////////////////////////////////////////////////////////////
// GitHub requests

function ghGet(path, args, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() { 
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            cb(issues = JSON.parse(anHttpRequest.responseText))
    }
    anHttpRequest.open('GET', "https://api.github.com/" + path, true);
    anHttpRequest.setRequestHeader('Authorization','token ' + getToken())
    anHttpRequest.setRequestHeader('Content-type', 'application/json')
    anHttpRequest.setRequestHeader('Accept', '*/*')
    anHttpRequest.send(args);
}

function ghPost(path, args, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
        if (anHttpRequest.readyState == 4 &&
              anHttpRequest.status >= 200 &&
              anHttpRequest.status < 300)
            cb(issues = JSON.parse(anHttpRequest.responseText))
    }
    anHttpRequest.open('POST', "https://api.github.com/" + path, true)
    anHttpRequest.setRequestHeader('Authorization','token ' + getToken())
    anHttpRequest.setRequestHeader('Content-type', 'application/json')
    anHttpRequest.setRequestHeader('Accept', '*/*')
    anHttpRequest.send(JSON.stringify(args))
}

////////////////////////////////////////////////////////////////////////////////

function authenticate() {
    // First, check whether access token is in the local storage.
    var token = localStorage.getItem("token")
    if(token != null) return

    // First step of authorization. Redirect to GitHub.
    var urlParams = new URLSearchParams(window.location.search)
    var code = urlParams.get("code")
    if(code == null) {
        window.location.replace("https://github.com/login/oauth/authorize?" +
            "scope=repo&client_id=d027578d9cca180f9e0e")
        return
    }

    // Second step of authorization. Convert code to a token.
    var rq = new XMLHttpRequest();
    rq.onreadystatechange = function() { 
        if (rq.readyState == 4 && rq.status == 200) {
            localStorage.setItem("token", JSON.parse(rq.responseText).token)
            window.location.replace("index.html")
        }
    }
    rq.open('GET', "https://flowium.herokuapp.com/authenticate/" + code, true);
    rq.setRequestHeader('Content-type', 'application/json')
    rq.setRequestHeader('Accept', '*/*')
    rq.send();
}

function getToken() {
    return localStorage.getItem("token")
}

function logout() {
    localStorage.clear()
    window.location.href = "index.html"
}

function getRepository() {
    return localStorage.getItem("repository")
}

////////////////////////////////////////////////////////////////////////////////
// Random functions

function statusToColor(status) {
    if(status == "done") return "#C0C0C0"
    if(status == "active") return "#00FF00"
    return "#FF0000"
}

function splitOnce(str, delimiter) {
    var i = str.indexOf(delimiter)
    if(i == -1) return [str]
    return [str.substring(0, i), str.substring(i + delimiter.length)]
}

function escapeHtml(str) {
    return $("<p></p>").text(str).html()
}

function replaceInSet(set, selector, by) {
    return $('<p>')
        .append(set)
        .find(selector)
        .replaceWith(by)
        .end()
        .contents()
}

function djbHash(str) {
  var hash = 5381
  for(var i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(16);
}

////////////////////////////////////////////////////////////////////////////////
// Markdown rendering

function mdConvert(md) {
    return marked(md, {
        gfm: true,
    })
}

function mdSanitizeAndConvert(md) {
    return marked(md, {
        gfm: true,
        sanitize: true,
    })
}

