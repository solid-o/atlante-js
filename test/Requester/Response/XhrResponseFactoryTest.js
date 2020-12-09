import { @dataProvider } from '@jymfony/decorators';
import { expect } from 'chai';

const BadResponse = Solido.Atlante.Requester.Response.BadResponse;
const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const InvalidResponse = Solido.Atlante.Requester.Response.InvalidResponse;
const Response = Solido.Atlante.Requester.Response.Response;
const XhrResponseFactory = Solido.Atlante.Requester.Response.XhrResponseFactory;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class XhrResponseFactoryTest extends TestCase {
    @dataProvider('provideParseCases')
    testFromResponse(requesterResponse, responseClass, statusCode, expectedData) {
        const factory = new XhrResponseFactory();
        const response = factory.fromResponse(requesterResponse);

        expect(response).to.be.instanceof(responseClass);
        expect(response.getStatusCode()).to.be.equal(statusCode);
        expect(response.getData()).to.be.deep.equal(expectedData);
    }

    * provideParseCases() {
        const mock = (statusCode, content, headers) => {
            return {
                status: statusCode,
                responseText: content,
                getAllResponseHeaders: () => {
                    const hdrs = [];
                    for (const [ k, v ] of Object.entries(headers)) {
                        hdrs.push(k + ': ' + v);
                    }

                    return hdrs.join('\r\n');
                },
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
