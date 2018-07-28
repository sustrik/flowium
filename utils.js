////////////////////////////////////////////////////////////////////////////////
// Query parameters

function getParameterByName(name) {
    var url = window.location.href
    var name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    var results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

////////////////////////////////////////////////////////////////////////////////
// HTTP requests

function httpGet(url, token, args, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() { 
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            cb(issues = JSON.parse(anHttpRequest.responseText))
    }
    anHttpRequest.open('GET', url, true);
    if(token != null) {
        anHttpRequest.setRequestHeader('Authorization','token ' + token)
    }
    anHttpRequest.setRequestHeader('Content-type', 'application/json')
    anHttpRequest.setRequestHeader('Accept', '*/*')
    anHttpRequest.send(args);
}

function httpPost(url, token, args, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 201)
            cb(issues = JSON.parse(anHttpRequest.responseText))
    }
    anHttpRequest.open('POST', url, true)
    if(token != null) {
        anHttpRequest.setRequestHeader('Authorization','token ' + token)
    }
    anHttpRequest.setRequestHeader('Content-type', 'application/json')
    anHttpRequest.setRequestHeader('Accept', '*/*')
    anHttpRequest.send(JSON.stringify(args))
}

////////////////////////////////////////////////////////////////////////////////
// These should be eventually stored in cookies.

function getToken() {
    var token = getParameterByName('token')
    return token
    //if(token != null) {
    //    setCookie("token", token)
    //    return token
    //}
    //token = getCookie("token")
    //if(token != null) {
    //    return token
    //}
    //var code = getParameterByName('code')
    //if(code == null) {
    //    window.location.replace("https://github.com/login/oauth/authorize?" +
    //        "scope=repo&client_id=d027578d9cca180f9e0e")
    //    return
    //}
    //httpGet("https://flowium.herokuapp.com/authenticate/" + code,
    //      token,
    //      null,
    //      function(response) {
    //    console.log("Token retrieved: " + JSON.stringify(response))
    //    setCookie("token", response)
    //    token = response
    //})
}

function getUsername() {
    return getParameterByName("username")
}

function getRepository() {
    return getParameterByName("repository")
}

function getIssue() {
    return getParameterByName("issue")
}

function getPath() {
    return "/"
}

////////////////////////////////////////////////////////////////////////////////
// GitHub helpers

function ghGet(url, args, cb) {
    var repo = 'https://api.github.com/repos/' + getUsername() + "/" +
        getRepository() + "/"
    httpGet(repo + url, getToken(), args, cb)
}

function ghPost(url, args, cb) {
    var repo = 'https://api.github.com/repos/' + getUsername() + "/" +
        getRepository() + "/"
    httpPost(repo + url, getToken(), args, cb)
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

function ltrimChar(str, ch) {
    var pos = [...str].findIndex(function (el) {return el != ch})
    return str.substring(pos)
}

function escapeHtml(str) {
    return $("<p></p>").text(str).html()
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

