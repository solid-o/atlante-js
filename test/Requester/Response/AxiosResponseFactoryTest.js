const AxiosResponseFactory = Solido.Atlante.Requester.Response.AxiosResponseFactory;
const BadResponse = Solido.Atlante.Requester.Response.BadResponse;
const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const InvalidResponse = Solido.Atlante.Requester.Response.InvalidResponse;
const Response = Solido.Atlante.Requester.Response.Response;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class AxiosResponseFactoryTest extends TestCase {
    @dataProvider('provideParseCases')
    testFromResponse(requesterResponse, responseClass, statusCode, expectedData) {
        const factory = new AxiosResponseFactory();
        const response = factory.fromResponse(requesterResponse);

        __self.assertInstanceOf(responseClass, response);
        __self.assertEquals(statusCode, response.getStatusCode());
        __self.assertEquals(expectedData, response.getData());
    }

    * provideParseCases() {
        const mock = (statusCode, content, headers) => {
            return {
                status: statusCode,
                data: content,
                headers,
            }
        };

        let headers = {};
        let statusCode = 200;
        let content = 'foobar';

        yield [ mock(statusCode, content, headers), InvalidResponse, statusCode, content ];

        content = '{"_id":"foo"}';
        yield [ mock(statusCode, content, headers), InvalidResponse, statusCode, content ];

        headers = { 'content-type': 'application/json' };
        yield [ mock(statusCode, content, headers), Response, statusCode, { _id: 'foo' } ];

        statusCode = 201;
        yield [ mock(statusCode, content, headers), Response, statusCode, { _id: 'foo' } ];

        statusCode = 204;
        yield [ mock(statusCode, content, headers), Response, statusCode, '' ];

        statusCode = 400;
        content = '{"name":"foo","errors":["Required."],"children":[]}';

        yield [
            mock(statusCode, content, headers),
            BadResponse,
            statusCode,
            BadResponsePropertyTree.parse({
                name: 'foo',
                errors: [ 'Required.' ],
                children: [],
            }),
        ];

        statusCode = 500;
        yield [
            mock(statusCode, content, headers),
            InvalidResponse,
            statusCode,
            {
                name: 'foo',
                errors: [ 'Required.' ],
                children: [],
            },
        ];
    }
}
