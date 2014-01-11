/***** AJAX *****/

//depends on promise
//is not a internal dependency

(function(){

    //time in milliseconds after which a pending AJAX request is considered unresponsive
    CC.ajaxTimeout = 0;

    var _encode = function(data) {
        var result = "";
        
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;

            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    result += '&' + e(k) + '=' + e(data[k]);
                }
            }
        }
        return result;
    };

    var new_xhr = function() {
        var xhr;
        
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }

        return xhr;
    };

    /**
    * do ajax request adn the response will be delivered via promise
    */
    CC.ajax = function(method, url, data, headers) {

        var p = new CC.Promise();

        var xhr, payload;
        data = data || {};
        headers = headers || {};

        try {
            xhr = new_xhr();
        } catch (e) {
            p.done(false, "no xhr");
        	return p;
        }

        payload = _encode(data);

        if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
        }

        xhr.open(method, url);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        var onTimeout = function() {
            xhr.abort();
            p.done(false, "timeout", xhr);
        }

        var timeout = CC.ajaxTimeout;
        
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var success = xhr.status && ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304);
                p.done(success, xhr.responseText, xhr);
            }
        };

        xhr.send(payload);

        return p;
    };

})();