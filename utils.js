////////////////////////////////////////////////////////////////////////////////
//  Authenticate with GitHub, authorize Flowium application.
////////////////////////////////////////////////////////////////////////////////

function authenticate() {
    // First, check whether access token is in the local storage.
    var token = localStorage.getItem("token")
    if(token != null) return

    // First step of authorization. Redirect to GitHub.
    var urlParams = new URLSearchParams(window.location.search)
    var code = urlParams.get("code")
    if(code == null) {
        // Store URL so that it can be reused once the authorization is over.
        localStorage.setItem("url", window.location.href)
        // Redirect to GitHub to authorize.
        window.location.replace("https://github.com/login/oauth/authorize?" +
            "scope=repo&client_id=" + flowiumConfig.clientID)
        return
    }

    // Second step of authorization. Convert code to a token.
    var rq = new XMLHttpRequest();
    rq.onreadystatechange = function() {
        if (rq.readyState == 4 && rq.status == 200) {
            localStorage.setItem("token", JSON.parse(rq.responseText).token)
            // Restore the original URL.
            window.location.href = localStorage.getItem("url")
        }
    }
    rq.open('GET', `${flowiumConfig.gatekeeperURL}/authenticate/${code}`, true)
    rq.setRequestHeader('Content-type', 'application/json')
    rq.setRequestHeader('Accept', '*/*')
    rq.send();
}

////////////////////////////////////////////////////////////////////////////////
// GitHub requests
////////////////////////////////////////////////////////////////////////////////

function ghGet(path, args, cb) {
    var request = new XMLHttpRequest();
    request.onerror = function() {
        throw Error(request.responseText || "Network request failed.")
    }
    request.onreadystatechange = function() { 
        if (request.readyState == 4) {
            if (request.status >= 200 &&
                  request.status < 300) {
                cb(issues = JSON.parse(request.responseText))
            }
        }
    }
    request.open('GET', "https://api.github.com/" + path, true);
    request.setRequestHeader('Authorization','token ' +
        localStorage.getItem("token"))
    request.setRequestHeader('Content-type', 'application/json')
    request.setRequestHeader('Accept', '*/*')
    request.send(args);
}

function ghPost(path, args, cb) {
    var request = new XMLHttpRequest()
    request.onerror = function() {
        throw Error(request.responseText || "Network request failed.")
    }
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status >= 200 &&
                  request.status < 300) {
                cb(issues = JSON.parse(request.responseText))
            } else {
                console.log(request)
            }
        }
    }
    request.open('POST', "https://api.github.com/" + path, true)
    request.setRequestHeader('Authorization','token ' +
        localStorage.getItem("token"))
    request.setRequestHeader('Content-type', 'application/json')
    request.setRequestHeader('Accept', '*/*')
    request.send(JSON.stringify(args))
}

////////////////////////////////////////////////////////////////////////////////
// Markdown rendering.
////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////
// Random helper functions.
////////////////////////////////////////////////////////////////////////////////

function splitOnce(str, delimiter) {
    var i = str.indexOf(delimiter)
    if(i == -1) return [str]
    return [str.substring(0, i), str.substring(i + delimiter.length)]
}

function escapeHtml(str) {
    return $("<p></p>").text(str).html()
}

function djbHash(str) {
  var hash = 5381
  for(var i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(16);
}

function trimLeft(str) {
    return str.replace(/^\s+/, "")
}

