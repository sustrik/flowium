////////////////////////////////////////////////////////////////////////////////
//  GitHub adaptor.
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

// Returns all open issues. Returns an array of issues, each looking like this:
//
// {id: <ID-of-the-issue>, title: <title-of-the-issue>}
function ghIssues(cb) {
    ghGet(`repos/${this.repository}/issues`, null, function(result) {
        var r = []
        for(var i = 0; i < result.length; i++)
            r.push({id: result[i].number.toString(), title: result[i].title})
        cb(r)
    })
}

// Returns an array of all files in the template directory.
function ghTemplates(cb) {
    ghGet(`repos/${this.repository}` +
          `/contents${this.templatePath}`, null, function(files) {
        var r = []
        for(var i = 0; i < files.length; i++) {
            var f = files[i]
            if(f.type != "file") continue
            r.push(f.name) 
        }
        cb(r)
    })
}

// Returns recent version ID of the specified file from the template directory.
function ghRecentVersion(file, cb) {
    var fname = `${this.templatePath}${file}`
    ghGet(`repos/${this.repository}/commits?path=${encodeURIComponent(fname)}`,
          null, function(result) {
        cb(result[0].sha)
    })
}

// Creates an issue with specified title and text.
// Returns ID of the created issues.
function ghCreateIssue(title, text, cb) {
    var args = {"title": title, "body": text}
    ghPost(`repos/${this.repository}/issues`, args, function(result) {
        cb(result.number.toString())
    })
}

// Posts a comment to the issue with specified ID. Returns no data.
function ghPostComment(id, text, cb) {
    ghPost(`repos/${this.repository}/issues/${id}/comments`,
          {"body": text}, function(result) {
        cb()
    })
}

// Returns all comments from the issue with specified ID, including the initial
// comment supplied when the issue was created. Each comment looks like this:
//
// {
//     author: <author-of-the-comment>,
//     avatar: <optional-link-to-authors-avatar>,
//     posted: <time-when-posted>,
//     text: <body-of-the-comment>,
// }
function ghGetIssue(id, cb) {
    var repo = this.repository
    ghGet(`repos/${repo}/issues/${id}`, null,
          function(issue) {
        ghGet(`repos/${repo}/issues/${id}/comments`,
              null, function(comments) {
            comments.unshift(issue)
            var cs = []
            for(var i = 0; i < comments.length; i++) {
                var c = comments[i]
                cs.push({
                    author: c.user.login,
                    avatar: c.user.avatar_url,
                    posted: new Date(c.created_at),
                    text: c.body,
                })
            }
            cb(issue.title, issue.state, cs)
        })
    })
}

function ghCloseIssue(id, cb) {
    ghPost(`repos/${this.repository}/issues/${id}`, {"state": "closed"},
          function(reply) {
        cb()
    })
}

function ghReopenIssue(id, cb) {
    ghPost(`repos/${this.repository}/issues/${id}`, {"state": "open"},
          function(reply) {
        cb()
    })
}

function ghGetFileContent(file, version, cb) {
    ghGet(`repos/${this.repository}/contents/${file}?ref=${version}`, {},
          function(file) {
        cb(atob(file.content))
    })
}

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

function setUpServiceAdaptor() {
    if(flowiumService.type == "GitHub") {
        flowiumService.issues = ghIssues
        flowiumService.templates = ghTemplates
        flowiumService.recentVersion = ghRecentVersion
        flowiumService.createIssue = ghCreateIssue
        flowiumService.postComment = ghPostComment
        flowiumService.getIssue = ghGetIssue
        flowiumService.closeIssue = ghCloseIssue
        flowiumService.reopenIssue = ghReopenIssue
        flowiumService.getFileContent = ghGetFileContent
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

