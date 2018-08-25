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
        flowiumBackend.token)
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
        flowiumBackend.token)
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

// Returns an array of all files in the process directory.
function ghProcesses(cb) {
    ghGet(`repos/${this.repository}` +
          `/contents${this.processPath}`, null, function(files) {
        var r = []
        for(var i = 0; i < files.length; i++) {
            var f = files[i]
            if(f.type != "file") continue
            r.push(f.name) 
        }
        cb(r)
    })
}

// Returns recent version ID of the specified file from the processes directory.
function ghRecentVersion(file, cb) {
    var fname = `${this.processPath}${file}`
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

// Returns an array of commits. Each commit looks like this:
//
// {
//     version: <version-id>,
//     message: <commit-message>,
//     committed: <time-when-committed>,
// }
function ghGetFileHistory(file, cb) {
    ghGet(`repos/${this.repository}/commits?path=${file}`, {},
          function (commits) {
        var history = []
        for(var i = 0; i < commits.length; i++) {
             history.push({
                 version: commits[i].sha,
                 message: commits[i].commit.message,
                 committed: new Date(commits[i].commit.committer.date),
             })
        }
        cb(history)
    })
}

function ghGetIssueLink(id) {
    return `https://github.com/${this.repository}/issues/${id}`
}

function ghGetFileLink(file, version) {
    return `https://github.com/${this.repository}/blob/${version}/${file}`
}

function ghGetEditLink(file) {
    return `https://github.com/${this.repository}/edit/master/${file}`
}

////////////////////////////////////////////////////////////////////////////////
//  GitLab adaptor.
////////////////////////////////////////////////////////////////////////////////

function glGet(path, args, cb) {
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
    request.open('GET', this.URL + "/api/v4/" + path, true);
    request.setRequestHeader('Authorization','bearer ' +
        flowiumBackend.token)
    request.setRequestHeader('Content-type', 'application/json')
    request.setRequestHeader('Accept', '*/*')
    request.send(args);
}

function glPost(path, args, cb) {
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
    request.open('POST', this.URL + "/api/v4/" + path, true)
    request.setRequestHeader('Authorization','bearer ' +
        flowiumBackend.token)
    request.setRequestHeader('Content-type', 'application/json')
    request.setRequestHeader('Accept', '*/*')
    request.send(JSON.stringify(args))
}

function glPut(path, args, cb) {
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
    request.open('PUT', this.root + "/api/v4/" + path, true)
    request.setRequestHeader('Authorization','bearer ' +
        flowiumBackend.token)
    request.setRequestHeader('Content-type', 'application/json')
    request.setRequestHeader('Accept', '*/*')
    request.send(JSON.stringify(args))
}

// Returns all open issues. Returns an array of issues, each looking like this:
//
// {id: <ID-of-the-issue>, title: <title-of-the-issue>}
function glIssues(cb) {
    this.get(`projects/${encodeURIComponent(this.repository)}/issues`, {},
          function(issues) {
        var r = []
        for(var i = 0; i < issues.length; i++) {
            r.push({
                id: issues[i].iid,
                title: issues[i].title,
            })
        }
        cb(r)
    })
}

// Returns an array of all files in the process directory.
function glProcesses(cb) {
    this.get(`projects/${encodeURIComponent(this.repository)}/repository/` +
          `tree${this.processPath}`, {}, function(files) {
        var r = []
        for(var i = 0; i < files.length; i++) {
            var f = files[i]
            if(f.type != "blob") continue
            r.push(f.name) 
        }
        cb(r)
    })
}

// Returns recent version ID of the specified file from the process directory.
function glRecentVersion(file, cb) {
    this.get(`projects/${encodeURIComponent(this.repository)}/repository/` +
          `files${this.processPath}${file}?ref=master`, {}, function(file) {
        cb(file.commit_id)
    })
}

// Creates an issue with specified title and text.
// Returns ID of the created issue.
function glCreateIssue(title, text, cb) {
    this.post(`projects/${encodeURIComponent(this.repository)}/issues`,
          {title: title, description: text}, function(reply) {
        cb(reply.iid)
    })
}

// Posts a comment to the issue with specified ID. Returns no data.
function glPostComment(id, text, cb) {
    this.post(`projects/${encodeURIComponent(this.repository)}/issues/${id}/notes`,
          {body: text}, function(reply) {
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
function glGetIssue(id, cb) {
    var r = []
    this.get(`projects/${encodeURIComponent(this.repository)}/issues/${id}`,
          {}, function(reply) {
        r.push({
            author: reply.author.username,
            avatar: reply.author.avatar_url,
            posted: new Date(reply.created_at),
            text: reply.description,
        })
        flowiumBackend.get(`projects/` +
              `${encodeURIComponent(flowiumBackend.repository)}/issues/${id}/notes`,
              {}, function(notes) {
            for(var i = 0; i < notes.length; i++) {
                var note = notes[i]
                r.push({
                    author: note.author.username,
                    avatar: note.author.avatar_url,
                    posted: new Date(note.created_at),
                    text: note.body,
                })
            }
            cb(reply.title, reply.state, r)
        })
    })
}

function glCloseIssue(id, cb) {
    this.put(`projects/${encodeURIComponent(this.repository)}/issues/${id}`,
          {state_event: "close"}, function(reply) {
        cb()
    })
}

function glReopenIssue(id, cb) {
    this.put(`projects/${encodeURIComponent(this.repository)}/issues/${id}`,
          {state_event: "reopen"}, function(reply) {
        cb()
    })
}

function glGetFileContent(file, version, cb) {
    this.get(`projects/${encodeURIComponent(flowiumBackend.repository)}/` +
          `repository/files${this.processPath}${file}?ref=${version}`,
          {}, function(f) {
        cb(atob(f.content))
    })
}

// Returns an array of commits. Each commit looks like this:
//
// {
//     version: <version-id>,
//     message: <commit-message>,
//     committed: <time-when-committed>,
// }
function glGetFileHistory(file, cb) {
    this.get(`projects/${encodeURIComponent(flowiumBackend.repository)}/` +
          `repository/commits?path=${file}`, {}, function(reply) {
        var r = []
        for(var i = 0; i < reply.length; i++) {
            r.push({
                version: reply[i].id,
                message: reply[i].message,
                committed: new Date(reply[i].committed_date)
            })
        }
        cb(r)
    })
}

function glGetIssueLink(id) {
    return `${this.root}/${this.repository}/issues/${id}`
}

function glGetFileLink(file, version) {
    return `${this.root}/${this.repository}/blob/${version}/${file}`
}

function glGetEditLink(file) {
    return `${this.root}/${this.repository}/edit/master/${file}`
}

////////////////////////////////////////////////////////////////////////////////
//  Gitea adaptor.
////////////////////////////////////////////////////////////////////////////////

function gtGet(path, args, cb) {
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
    request.open('GET', flowiumBackend.URL + "/api/v1/" + path, true);
    //request.setRequestHeader('Authorization','token ' +
    //    flowiumBackend.token)
    request.setRequestHeader('Content-type', 'text/plain')
    //request.setRequestHeader('Accept', '*/*')
    request.send(args);
}

// Returns all open issues. Returns an array of issues, each looking like this:
//
// {id: <ID-of-the-issue>, title: <title-of-the-issue>}
function gtIssues(cb) {
    gtGet(`repos/${flowiumBackend.repository}/issues`, {}, function(reply) {
        var r = []
        for(var i = 0; i < reply.length; i++) {
            r.push({
                id: reply[i].id,
                title: reply[i].title,
            })
        }
        cb(r)
    })
}

// Returns an array of all files in the process directory.
function gtProcesses(cb) {
}

// Returns recent version ID of the specified file from the process directory.
function gtRecentVersion(file, cb) {
}

// Creates an issue with specified title and text.
// Returns ID of the created issue.
function gtCreateIssue(title, text, cb) {
}

// Posts a comment to the issue with specified ID. Returns no data.
function gtPostComment(id, text, cb) {
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
function gtGetIssue(id, cb) {
}

function gtCloseIssue(id, cb) {
}

function gtReopenIssue(id, cb) {
}

function gtGetFileContent(file, version, cb) {
}

// Returns an array of commits. Each commit looks like this:
//
// {
//     version: <version-id>,
//     message: <commit-message>,
//     committed: <time-when-committed>,
// }
function gtGetFileHistory(file, cb) {
}

function gtGetIssueLink(id) {
}

function gtGetFileLink(file, version) {
}

function gtGetEditLink(file) {
}

////////////////////////////////////////////////////////////////////////////////
//  Choose one of the services in the config to use.
////////////////////////////////////////////////////////////////////////////////

var flowiumBackendName = null
var flowiumBackend = null

function initializeConfig() {
    // Get the backend config from local storage. If there is none, keep the
    // config hardcoded in config.js
    var config = JSON.parse(localStorage.getItem("config"))
    if(config != null) flowiumConfig = config
    else saveConfig()
}

function saveConfig() {
    localStorage.setItem("config", JSON.stringify(flowiumConfig))
}

function chooseBackendByName(name) {
    flowiumBackendName = name
    flowiumBackend = flowiumConfig.backends[name]
    if(flowiumBackend == null)
        throw Error(`Service "${name}" not found in the config file.`)
}

function chooseBackend() {
    var urlParams = new URLSearchParams(window.location.search)
    var backend = urlParams.get("backend")
    if(backend == null) throw Error("No backend is specified.")
    chooseBackendByName(backend)
}

function setUpBackendAdaptor() {
    if(flowiumBackend.type == "GitHub") {
        flowiumBackend.issues = ghIssues
        flowiumBackend.processes = ghProcesses
        flowiumBackend.recentVersion = ghRecentVersion
        flowiumBackend.createIssue = ghCreateIssue
        flowiumBackend.postComment = ghPostComment
        flowiumBackend.getIssue = ghGetIssue
        flowiumBackend.closeIssue = ghCloseIssue
        flowiumBackend.reopenIssue = ghReopenIssue
        flowiumBackend.getFileContent = ghGetFileContent
        flowiumBackend.getFileHistory = ghGetFileHistory
        flowiumBackend.getIssueLink = ghGetIssueLink
        flowiumBackend.getFileLink = ghGetFileLink
        flowiumBackend.getEditLink = ghGetEditLink
    }
    if(flowiumBackend.type == "GitLab") {
        flowiumBackend.get = glGet
        flowiumBackend.post = glPost
        flowiumBackend.put = glPut
        flowiumBackend.issues = glIssues
        flowiumBackend.processes = glProcesses
        flowiumBackend.recentVersion = glRecentVersion
        flowiumBackend.createIssue = glCreateIssue
        flowiumBackend.postComment = glPostComment
        flowiumBackend.getIssue = glGetIssue
        flowiumBackend.closeIssue = glCloseIssue
        flowiumBackend.reopenIssue = glReopenIssue
        flowiumBackend.getFileContent = glGetFileContent
        flowiumBackend.getFileHistory = glGetFileHistory
        flowiumBackend.getIssueLink = glGetIssueLink
        flowiumBackend.getFileLink = glGetFileLink
        flowiumBackend.getEditLink = glGetEditLink
    }
    if(flowiumBackend.type == "Gitea") {
        flowiumBackend.issues = gtIssues
        flowiumBackend.processes = gtProcesses
        flowiumBackend.recentVersion = gtRecentVersion
        flowiumBackend.createIssue = gtCreateIssue
        flowiumBackend.postComment = gtPostComment
        flowiumBackend.getIssue = gtGetIssue
        flowiumBackend.closeIssue = gtCloseIssue
        flowiumBackend.reopenIssue = gtReopenIssue
        flowiumBackend.getFileContent = gtGetFileContent
        flowiumBackend.getFileHistory = gtGetFileHistory
        flowiumBackend.getIssueLink = gtGetIssueLink
        flowiumBackend.getFileLink = gtGetFileLink
        flowiumBackend.getEditLink = gtGetEditLink
    }
}

////////////////////////////////////////////////////////////////////////////////
//  Authenticate the user and authorize the Flowium application.
////////////////////////////////////////////////////////////////////////////////

function authenticate() {
    var urlParams = new URLSearchParams(window.location.search)

    // First, check whether access token is in the local storage.
    if("token" in flowiumBackend) return true

    // Store some value temporarily while authentication is being done.
    localStorage.setItem("backend", flowiumBackendName)
    localStorage.setItem("url", window.location.href)

    if(flowiumBackend.type == "GitLab") {
        // Store URL so that it can be reused once the authorization is over.
        localStorage.setItem("url", window.location.href)
        window.location.replace(`https://gitlab.com/oauth/authorize` +
            `?client_id=${flowiumBackend.applicationID}` +
             `&redirect_uri=` +
             encodeURIComponent(`https://flowium.com/callback.html`) +
             `&response_type=token`)
        return false 
    }

    if(flowiumBackend.type == "GitHub") {
        window.location.replace(
            `https://github.com/login/oauth/authorize?` +
            `scope=repo&client_id=${flowiumBackend.clientID}`)
        return false
    }

    if(flowiumBackend.type == "Gitea") {
        // For Gitea, access key has to be specified in the config.
        if(!("token" in flowiumBackend))
            throw Error("Token was not specified in the service config.")
        tokens[flowiumBackendName] = flowiumBackend.token
        return false
    }

    throw Error(`Unsupported service type ${flowiumBackend.type}.`)
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

function splitLast(str, delimiter) {
    var i = str.lastIndexOf(delimiter)
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

