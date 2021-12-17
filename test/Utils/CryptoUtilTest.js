import { @dataProvider } from '@jymfony/decorators';
import { expect } from 'chai';
import {base64Encode, sha256} from '../../lib/Utils/Crypto';

const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class CryptoUtilTest extends TestCase {
    * provideSha256Vectors() {
        yield [ 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU=', '' ];
        yield [ 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb', 'ypeBEsobvcr6wjGzmiPcTaeG7_gUfE5yuYB3ha_uSLs=', 'a' ];
        yield [ '5e43c8704ac81f33d701c1ace046ba9f257062b4d17e78f3254cbf243177e4f2', 'XkPIcErIHzPXAcGs4Ea6nyVwYrTRfnjzJUy_JDF35PI=', '012345678901234567890123456789012345678901234567890123456789' ];
        yield [ 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0=', 'abc' ];
        yield [ '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1', 'JI1qYdIGOLjlwCaTDD5gOaM85Flk_yFn9uzt1BnbBsE=', 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq' ];
        yield [ 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0', 'zcduXJkU-5KBocfihNc-Z_GAmkiklyAOBG05zMcRLNA=', 'a'.repeat(1000000) ];
    }

    @dataProvider('provideSha256Vectors')
    async testSha256Hash(expected, expectedBase64, vector) {
        expect(await sha256(vector, 'hex')).to.be.equal(expected);
        expect(await sha256(vector, 'base64')).to.be.equal(expectedBase64);
    }

    * provideBase64Vectors() {
        yield [ 'xMmBRXLbfo+PMmTergXtnQJF5GwKPR5PEq6ue/ZG4tk=', Uint8Array.from([196, 201, 129, 69, 114, 219, 126, 143, 143, 50, 100, 222, 174, 5, 237, 157, 2, 69, 228, 108, 10, 61, 30, 79, 18, 174, 174, 123, 246, 70, 226, 217 ]) ];
        yield [ 'Zm9vYmFy', (new TextEncoder()).encode("foobar") ];
    }

    @dataProvider('provideBase64Vectors')
    testBase64Encoding(expected, vector) {
        if (isString(vector)) {
            vector = Uint8Array.from(vector);
        }

        expect(base64Encode(vector)).to.be.equal(expected);
    }
}
