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

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

function getToken() {
    token = getCookie("flowium")
    if(token != null) return token
    console.log("Setting cookie")
    var code = getParameterByName('code')
    if(code == null) {
        window.location.replace("https://github.com/login/oauth/authorize?" +
            "scope=repo&client_id=d027578d9cca180f9e0e")
        return
    }
    var client = new HttpClient();
    client.get("https://flowium.herokuapp.com/authenticate/" + code,
          function(response) {
        console.log(response)
    })
    return "test"
}

