const _WEBPACK_REQUIRE_ = globalThis.require;
const crypto = 'function' === typeof _WEBPACK_REQUIRE_ ? _WEBPACK_REQUIRE_('crypto') : undefined;

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const base64Encode = buf => {
    const l = buf.length;
    let result = '', i;

    for (i = 2; i < l; i += 3) {
        result += base64Alphabet[buf[i - 2] >> 2];
        result += base64Alphabet[((buf[i - 2] & 0x03) << 4) | (buf[i - 1] >> 4)];
        result += base64Alphabet[((buf[i - 1] & 0x0F) << 2) | (buf[i] >> 6)];
        result += base64Alphabet[buf[i] & 0x3F];
    }
    if (i === l + 1) { // 1 octet yet to write
        result += base64Alphabet[buf[i - 2] >> 2];
        result += base64Alphabet[(buf[i - 2] & 0x03) << 4];
    }
    if (i === l) { // 2 octets yet to write
        result += base64Alphabet[buf[i - 2] >> 2];
        result += base64Alphabet[((buf[i - 2] & 0x03) << 4) | (buf[i - 1] >> 4)];
        result += base64Alphabet[(buf[i - 1] & 0x0F) << 2];
    }

    return result;
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

export const sha256 = async (message: string) => {
    if ('undefined' !== typeof window && 'undefined' !== typeof window.crypto) {
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);

        return base64Encode(new Uint8Array(hashBuffer));
    }

    if (undefined === crypto) {
        throw Error('Cannot retrieve a valid crypto module');
    }

    return crypto
        .createHash('sha256')
        .update(message)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
    ;
};
