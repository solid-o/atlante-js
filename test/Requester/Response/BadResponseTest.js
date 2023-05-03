const BadResponse = Solido.Atlante.Requester.Response.BadResponse;
const BadResponsePropertyTree = Solido.Atlante.Requester.Response.BadResponsePropertyTree;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class BadResponseTest extends TestCase {
    testCanBeCreated() {
        const response = new BadResponse({ 'Content-Type': 'application/json' }, {
            name: 'foo',
            errors: [],
            children: [],
        });

        __self.assertEquals(400, response.getStatusCode());

        const errors = response.getErrors();
        __self.assertInstanceOf(BadResponsePropertyTree, errors);
    }

    testShouldNotThrowIfObjectIsNotAnErrorPropertyTree() {
        const response = new BadResponse({ 'Content-Type': 'application/json' }, {
            error: 'invalid_request',
        });

        __self.assertEquals(400, response.getStatusCode());
        __self.assertEquals(null, response.getErrors());
        __self.assertEquals({
            error: 'invalid_request',
        }, response.getData());
    }
}
