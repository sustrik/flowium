function getParameterByName(name) {
    var url = window.location.href
    var name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    var results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(issues = JSON.parse(anHttpRequest.responseText))
        }
        anHttpRequest.open('GET', aUrl, true);            
        anHttpRequest.send(null);
    }
    this.put = function(aUrl, args, token, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() { 
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(issues = JSON.parse(anHttpRequest.responseText))
        }
        anHttpRequest.open('POST', aUrl, true)
        anHttpRequest.setRequestHeader('Authorization','token ' + token)
        anHttpRequest.setRequestHeader('Content-type','application/x-www-form-urlencoded')
        anHttpRequest.setRequestHeader('Accept', '*/*')
        anHttpRequest.send(JSON.stringify(args))
    }
}

