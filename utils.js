////////////////////////////////////////////////////////////////////////////////
//  Choose one of the services in the config to use.
////////////////////////////////////////////////////////////////////////////////

var flowiumService = null

function chooseService() {
    var urlParams = new URLSearchParams(window.location.search)
    var service = urlParams.get("service")
    if(service == null) {
        if(flowiumConfig.services.length == 0)
            throw Error("No services in the config file.")
        flowiumService = flowiumConfig.services[0]
    } else {
        for(var i = 0; i < flowiumConfig.services.length; i++) {
            if(flowiumConfig.services[i].name == service) {
                flowiumService = flowiumConfig.services[i]
                break
            }
        }
        if(flowiumService == null)
            throw Error(`Service "${service}" not found in the config file.`)
    }
}

////////////////////////////////////////////////////////////////////////////////
//  Authenticate the user and authorize the Flowium application.
////////////////////////////////////////////////////////////////////////////////

function authenticate() {
    var urlParams = new URLSearchParams(window.location.search)

    if(flowiumService.type == "GitLab") {
        var accessToken = urlParams.get("access_token")
        if(accessToken == null) {
            // Store URL so that it can be reused once the authorization is over.
            localStorage.setItem("url", window.location.href)
            window.location.replace(`https://gitlab.com/oauth/authorize` +
                `?client_id=` +
                `4dbe6da72b8954701424c1439519d1debe60211f7294547e111787b1e340544b` +
                 `&redirect_uri=` +
                 encodeURIComponent(`https://flowium.com/gitlab.html`) +
                 `&response_type=token`)
            return
        }

        localStorage.setItem("token", accessToken)
        // Restore the original URL.
        window.location.href = localStorage.getItem("url")
        return
    }

    if(flowiumService.type == "GitHub") {
        // First, check whether access token is in the local storage.
        var token = localStorage.getItem("token")
        if(token != null) return

        // First step of authorization. Redirect to GitHub.
        var code = urlParams.get("code")
        if(code == null) {
            // Store URL so that it can be reused once the authorization is over.
            localStorage.setItem("url", window.location.href)
            // Redirect to GitHub to authorize.
            window.location.replace(
                "https://github.com/login/oauth/authorize?" +
                "scope=repo&client_id=" + flowiumService.clientID)
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
        rq.open('GET', `${flowiumService.gatekeeperURL}/authenticate/${code}`,
            true)
        rq.setRequestHeader('Content-type', 'application/json')
        rq.setRequestHeader('Accept', '*/*')
        rq.send();
        return
    }

    throw Error(`Unsupported service type ${flowiumService.type}.`)
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

////////////////////////////////////////////////////////////////////////////////
//  Error handling.
////////////////////////////////////////////////////////////////////////////////

window.addEventListener('error', function (e) {
    $("#flowium-all").hide()
    console.log(e)
    if("error" in e && e.error != null) var text = e.error.message +
        "\n\n" + e.error.stack
    else var text = e.message
    var alert = $(`<pre class="alert alert-danger" role="alert"></pre>`)
        .text(text)
    $("#flowium-error-text").append(alert)
    $("#flowium-error").show()
})

