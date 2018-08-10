////////////////////////////////////////////////////////////////////////////////
//  Choose one of the services in the config to use.
////////////////////////////////////////////////////////////////////////////////

var flowiumService = null

function chooseServiceByName(name) {
    for(var i = 0; i < flowiumConfig.services.length; i++) {
        if(flowiumConfig.services[i].name == name) {
            flowiumService = flowiumConfig.services[i]
            break
        }
    }
    if(flowiumService == null)
        throw Error(`Service "${name}" not found in the config file.`)
}

function chooseService() {
    var urlParams = new URLSearchParams(window.location.search)
    var service = urlParams.get("service")
    if(service == null) {
        if(flowiumConfig.services.length == 0)
            throw Error("No services in the config file.")
        flowiumService = flowiumConfig.services[0]
    } else {
        chooseServiceByName(service)
    }
}

////////////////////////////////////////////////////////////////////////////////
//  Authenticate the user and authorize the Flowium application.
////////////////////////////////////////////////////////////////////////////////

function authenticate() {
    var urlParams = new URLSearchParams(window.location.search)

    // First, check whether access token is in the local storage.
    var tokens = JSON.parse(localStorage.getItem("tokens"))
    if(tokens != null && flowiumService.name in tokens) {
        flowiumService["token"] = tokens[flowiumService.name]
        return
    }

    // Store some value temporarily while authentication is being done.
    localStorage.setItem("service", flowiumService.name)
    localStorage.setItem("url", window.location.href)

    if(flowiumService.type == "GitLab") {
        // Store URL so that it can be reused once the authorization is over.
        localStorage.setItem("url", window.location.href)
        window.location.replace(`https://gitlab.com/oauth/authorize` +
            `?client_id=${flowiumService.applicationID}` +
             `&redirect_uri=` +
             encodeURIComponent(`https://flowium.com/callback.html`) +
             `&response_type=token`)
        return        
    }

    if(flowiumService.type == "GitHub") {
        window.location.replace(
            `https://github.com/login/oauth/authorize?` +
            `scope=repo&client_id=${flowiumService.clientID}`)
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
        flowiumService.token)
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
        flowiumService.token)
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

