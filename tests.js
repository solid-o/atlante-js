require('@jymfony/autoloader');

const Debug = Jymfony.Component.Debug.Debug;
Debug.enable();

if ('undefined' === typeof URL) {
    const { URL, URLSearchParams } = require('whatwg-url');
    global.URL = URL;
    global.URLSearchParams = URLSearchParams;
}

require('./stubs/namespace');
require('mocha/bin/_mocha');
