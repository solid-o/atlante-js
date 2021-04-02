const _WEBPACK_REQUIRE_ = eval('require');
const crypto = 'function' === typeof _WEBPACK_REQUIRE_ ? _WEBPACK_REQUIRE_('crypto') : undefined;

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const urlSafeBase64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=';

export const base64Encode = (buf, b64 = base64Alphabet) => {
    const encodeUTF8string = (str: string) => encodeURIComponent(str).replace(
        /%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(Number.parseInt(p1, 16))
    );

    if ('undefined' !== typeof window) {
        if ('undefined' !== typeof window.btoa) {
            return window.btoa(encodeUTF8string(buf))
        }
    } else {
        return new Buffer(buf).toString('base64')
    }

    let o1, o2, o3;
    let h1, h2, h3, h4;
    let bits;
    let i = 0, ac = 0, enc = '';
    const acc = []

    if (! buf) {
        return buf;
    }

    buf = encodeUTF8string(buf)
    do {
        // Pack three octets into four hexets
        o1 = buf.charCodeAt(i++);
        o2 = buf.charCodeAt(i++);
        o3 = buf.charCodeAt(i++);
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // Use hexets to index into b64, and append result to encoded string
        acc[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < buf.length);

    enc = acc.join('');
    const r = buf.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
};

export const generateRandomString = (bytes = 16) => {
    const buf = new Uint8Array(bytes);
    if ('undefined' !== typeof window && 'undefined' !== typeof window.crypto) {
        window.crypto.getRandomValues(buf);
    } else {
        if (undefined === crypto) {
            throw Error('Cannot retrieve a valid random values generator');
        }

        const data = crypto.randomBytes(bytes).toJSON().data;
        for (let i = 0; i < data.length; ++i) {
            buf[i] = data[i];
        }
    }

    return base64Encode(buf);
};

export const buf2hex = (buffer: ArrayBuffer) => {
    return Array.prototype.map.call(
        new Uint8Array(buffer),
        (x: number) => ('00' + x.toString(16)).slice(-2)
    ).join('');
}

export const sha256 = async (message: string, encoding: 'hex' | 'base64' | 'url-safe-base64' = 'hex') => {
    if ('undefined' !== typeof window && 'undefined' !== typeof window.crypto) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const arrayBuffer = new Uint8Array(hashBuffer);

        if ('hex' === encoding) {
            return buf2hex(arrayBuffer);
        }

        return base64Encode(arrayBuffer, 'url-safe-base64' === encoding ? urlSafeBase64Alphabet : base64Alphabet);
    }

    if (undefined === crypto) {
        throw Error('Cannot retrieve a valid crypto module');
    }

    return crypto
        .createHash('sha256')
        .update(message)
        .digest('url-safe-base64' === encoding ? 'base64' : encoding)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    ;
};
