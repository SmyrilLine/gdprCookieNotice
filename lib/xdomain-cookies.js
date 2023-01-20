/* Version 1.0.8 xdomain-cookies (http://contently.github.io/xdomain-cookies/) from Contently (https://github.com/contently) */
!function (exports) { "use strict"; var xDomainCookie = function (iframe_path, namespace, xdomain_only, iframe_load_timeout_ms, secure_only, debug, same_site) { function _log() { _debug && (arguments[0] = ":XDC_PAGE: " + arguments[0], console.log.apply(console, arguments)) } function _inbound_postmessage(event) { _log("_inbound_postmessage", event.origin, event.data); var origin = event.origin || event.originalEvent.origin; if (iframe_path.substr(0, origin.length) === origin && "string" == typeof event.data) { var data = null; try { data = JSON.parse(event.data) } catch (e) { } "object" != typeof data || data instanceof Array || "msg_type" in data && "xdsc_read" === data.msg_type && "namespace" in data && data.namespace === _namespace && (_xdomain_cookie_data = data.cookies, _iframe_ready = !0, _fire_pending_callbacks()) } } function _iframe_load_error_occured() { _log("_iframe_load_error_occured"), _iframe_load_error = !0, _fire_pending_callbacks() } function _on_iframe_ready_or_error(cb) { _callbacks.push(cb), _fire_pending_callbacks() } function _fire_pending_callbacks() { if (_iframe_load_error || _iframe_ready) for (; _callbacks.length > 0;)_callbacks.pop()(_iframe_load_error) } function _set_cookie_in_iframe(cookie_name, cookie_value, expires_days) { var data = { namespace: _namespace, msg_type: "xdsc_write", cookie_name: cookie_name, cookie_val: cookie_value, expires_days: expires_days, secure_only: _secure_only, same_site: _same_site }; _log("_set_cookie_in_iframe", data), document.getElementById("xdomain_cookie_" + _id).contentWindow.postMessage(JSON.stringify(data), iframe_path) } function _get_local_cookie(cookie_name) { for (var name = cookie_name + "=", ca = document.cookie.split(";"), i = 0; i < ca.length; i++) { var c = ca[i].trim(); if (0 === c.indexOf(name)) return decodeURIComponent(c.substring(name.length, c.length)) } return "" } function _set_local_cookie(cookie_name, cookie_value, expires_days) { var d = new Date; d.setTime(d.getTime() + 1e3 * expires_days * 60 * 60 * 24); var cookie_val = cookie_name + "=" + cookie_value + "; expires=" + d.toUTCString() + (_secure_only ? ";secure" : "") + (_same_site ? ";SameSite=" + _same_site : ""); _log("_set_local_cookie", cookie_val), document.cookie = cookie_val } function _set_xdomain_cookie_value(cookie_name, cookie_value, expires_days) { if (!_iframe_ready && !_iframe_load_error) return _callbacks.push(function () { _set_xdomain_cookie_value(cookie_name, cookie_value, expires_days) }); expires_days = expires_days || _default_expires_days, expires_days = null === cookie_value || void 0 === cookie_value ? -100 : expires_days, _xdomain_only || _set_local_cookie(cookie_name, cookie_value, expires_days), _iframe_load_error || _set_cookie_in_iframe(cookie_name, cookie_value, expires_days), _xdomain_cookie_data[cookie_name] = cookie_value } function _get_xdomain_cookie_value(cookie_name, callback, expires_days) { function _cb(xdomain_success, cookie_val, callback) { _log("_get_xdomain_cookie_value D", xdomain_success, cookie_val), _set_xdomain_cookie_value(cookie_name, cookie_val, expires_days), "function" == typeof callback && callback(cookie_val) } if (expires_days = expires_days || _default_expires_days, _log("_get_xdomain_cookie_value A", cookie_name), !_xdomain_only) { var _existing_local_cookie_val = _get_local_cookie(cookie_name); if (_existing_local_cookie_val) return _log("_get_xdomain_cookie_value B", _existing_local_cookie_val), _on_iframe_ready_or_error(function (is_err) { _cb(!is_err, _existing_local_cookie_val) }), callback(_existing_local_cookie_val) } _on_iframe_ready_or_error(function (is_err) { if (_log("_get_xdomain_cookie_value C", is_err), is_err) return _cb(!1, null, callback); _cb(!is_err, cookie_name in _xdomain_cookie_data ? _xdomain_cookie_data[cookie_name] : null, callback) }) } "//" === iframe_path.substr(0, 2) && (iframe_path = ("https:" === window.location.protocol ? "https:" : "http:") + iframe_path); var _namespace = namespace || "xdsc", _load_wait_ms = iframe_load_timeout_ms || 6e3, _iframe_ready = !1, _iframe_load_error = !1, _callbacks = [], _xdomain_cookie_data = {}, _id = (new Date).getTime(), _default_expires_days = 30, _xdomain_only = !!xdomain_only, _secure_only = !!secure_only, _same_site = same_site || "None", _debug = !!debug; window.addEventListener("message", _inbound_postmessage); var ifr = document.createElement("iframe"); ifr.style.display = "none", ifr.id = "xdomain_cookie_" + _id; var origin = window.location.origin; origin || (origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "")); var data = { namespace: _namespace, window_origin: origin, iframe_origin: iframe_path, debug: _debug }; return ifr.src = iframe_path + "/xdomain_cookie.html#" + encodeURIComponent(JSON.stringify(data)), document.body.appendChild(ifr), _log("creating iframe", ifr.src), setTimeout(function () { _iframe_ready || _iframe_load_error_occured() }, _load_wait_ms), { get: _get_xdomain_cookie_value, set: _set_xdomain_cookie_value } }; exports.xDomainCookie = xDomainCookie }(this);