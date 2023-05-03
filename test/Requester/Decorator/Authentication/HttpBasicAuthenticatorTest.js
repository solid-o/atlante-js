import { createRequest } from '../../../../lib/Requester/Request';

const Headers = Solido.Atlante.Requester.Headers;
const HttpBasicAuthenticator = Solido.Atlante.Requester.Decorator.Authentication.HttpBasicAuthenticator;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class HttpBasicAuthenticatorTest extends TestCase {
    @dataProvider('provideDecorationCases')
    testDecoration(usernameOrEncodedAuth, password, givenAuthHeader, expectedAuthHeader) {
        const decorator = new HttpBasicAuthenticator(usernameOrEncodedAuth, password);
        const request = createRequest('GET', '/example.com', null === givenAuthHeader ? null : { authorization: givenAuthHeader }, 'foo');

        const decorated = decorator.decorate(request);
        const headers = decorated.headers;

        let auth = headers ? headers.get('authorization') : null;
        if (isArray(auth)) {
            auth = auth[0];
        }

        __self.assertEquals(expectedAuthHeader, auth);
        __self.assertEquals('GET', decorated.method);
        __self.assertEquals('/example.com', decorated.url);
        __self.assertEquals('foo', decorated.body);
    }

    * provideDecorationCases() {
        yield [ '1295AC56-C999-41C4-8384-B8D8D2D2F3AA', 'secret', null, 'Basic MTI5NUFDNTYtQzk5OS00MUM0LTgzODQtQjhEOEQyRDJGM0FBOnNlY3JldA==' ];
        yield [ '1295AC56-C999-41C4-8384-B8D8D2D2F3AA', '', null, 'Basic MTI5NUFDNTYtQzk5OS00MUM0LTgzODQtQjhEOEQyRDJGM0FB' ];
        yield [ 'MTI5NUFDNTYtQzk5OS00MUM0LTgzODQtQjhEOEQyRDJGM0FBOnNlY3JldA==', null, null, 'Basic MTI5NUFDNTYtQzk5OS00MUM0LTgzODQtQjhEOEQyRDJGM0FBOnNlY3JldA==' ];

        yield [ '1295AC56-C999-41C4-8384-B8D8D2D2F3AA', 'secret', 'fooAuth', 'fooAuth' ];
        yield [ '1295AC56-C999-41C4-8384-B8D8D2D2F3AA', '', 'fooAuth', 'fooAuth' ];
        yield [ 'MTI5NUFDNTYtQzk5OS00MUM0LTgzODQtQjhEOEQyRDJGM0FBOnNlY3JldA==', null, 'fooAuth', 'fooAuth' ];
    }

    @dataProvider('provideHeaderDecorationCases')
    testHeaderDecorationPreservePresets(given, expected) {
        const decorator = new HttpBasicAuthenticator('fooAuth');
        const request = createRequest('GET', '/example.com', given, 'foo');

        const decorated = decorator.decorate(request);
        __self.assertEquals(expected.all, decorated.headers.all);
    }

    * provideHeaderDecorationCases() {
        yield [ new Headers({ foo: 'bar' }), new Headers({ foo: 'bar', Authorization: 'Basic fooAuth' }) ];
        yield [ null, new Headers({ Authorization: 'Basic fooAuth' }) ];
    }
}
