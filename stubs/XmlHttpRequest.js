/**
 * Stub of DOM XMLHttpRequest
 *
 * @memberOf Solido.Atlante.Stubs
 */
class XMLHttpRequest {
    constructor(props) {
        this.onreadystatechange = () => {};
        this.readyState = XMLHttpRequest.UNSENT;
        this.response = undefined;
        this.responseText = undefined;
        this.responseType = '';
        this.responseURL = undefined;
        this.status = 0;
        this.statusText = undefined;
        this.withCredentials = false;
    }

    /**
     * Cancels any network activity.
     */
    abort() {}
    getAllResponseHeaders() {}
    getResponseHeader(name) {
        return null;
    }
    /**
     * Sets the request method, request URL, and synchronous flag.
     * Throws a "SyntaxError" DOMException if either method is not a
     * valid HTTP method or url cannot be parsed.
     * Throws a "SecurityError" DOMException if method is a
     * case-insensitive match for `CONNECT`, `TRACE`, or `TRACK`.
     * Throws an "InvalidAccessError" DOMException if async is false, current global object is a Window object, and the timeout attribute is not zero or the responseType attribute is not the empty string.
     */
    open(method, url) {
        this.readyState = XMLHttpRequest.OPENED;
    }
    /**
     * Initiates the request. The body argument provides the request body, if any,
     * and is ignored if the request method is GET or HEAD.
     * Throws an "InvalidStateError" DOMException if either state is not opened or the send() flag is set.
     */
    send(body = null) {}
    /**
     * Combines a header in author request headers.
     * Throws an "InvalidStateError" DOMException if either state is not opened or the send() flag is set.
     * Throws a "SyntaxError" DOMException if name is not a header name
     * or if value is not a header value.
     */
    setRequestHeader(name, value) {}
}

XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPENED = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

module.exports = XMLHttpRequest;
