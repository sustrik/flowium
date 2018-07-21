function getParameterByName(name) {
    var url = window.location.href
    var name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    var results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

function httpGet(url, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() { 
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            cb(issues = JSON.parse(anHttpRequest.responseText))
    }
    anHttpRequest.open('GET', url, true);
    anHttpRequest.send(null);
}

function httpPost(url, args, token, cb) {
    var anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() { 
        if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
            cb(issues = JSON.parse(anHttpRequest.responseText))
    }
    anHttpRequest.open('POST', url, true)
    anHttpRequest.setRequestHeader('Authorization','token ' + token)
    anHttpRequest.setRequestHeader('Content-type',
        'application/x-www-form-urlencoded')
    anHttpRequest.setRequestHeader('Accept', '*/*')
    anHttpRequest.send(JSON.stringify(args))
}

function setCookie(name,value,days) {
    var expires = ""
    if (days) {
        var date = new Date()
        date.setTime(date.getTime() + (days*24*60*60*1000))
        expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/"
}

function getCookie(name) {
    var nameEQ = name + "="
    var ca = document.cookie.split(';')
    for(var i=0;i < ca.length;i++) {
        var c = ca[i]
        while (c.charAt(0)==' ') c = c.substring(1,c.length)
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length)
    }
    return null
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;' 
}

function getToken() {
    if(token != null) return
    token = getCookie("flowium")
    if(token != null) {
        console.log("Cookie found!")
        return
    }
    var code = getParameterByName('code')
    if(code == null) {
        window.location.replace("https://github.com/login/oauth/authorize?" +
            "scope=repo&client_id=d027578d9cca180f9e0e")
        return
    }
    httpGet("https://flowium.herokuapp.com/authenticate/" + code,
          function(response) {
        console.log("Token retrieved!")
        setCookie("flowium", response, 30)
        token = response
    })
}

var token = null
getToken()

