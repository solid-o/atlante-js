import { @dataProvider } from '@jymfony/decorators';
import { expect } from 'chai';

const ArrayUtils = Solido.Atlante.Utils.ArrayUtils;
const TestCase = Jymfony.Component.Testing.Framework.TestCase;

export default class ArrayUtilsTest extends TestCase {
    * provideSnakeCaseData() {
        yield [ {
            snakeKey: 'foobar',
            camelCase: 'barbar',
            fooBarBaz: 'baz',
            fooBarBAR: 'baz',
            fooBar_123: 'baz',
            nestedObject: {
                snakeKey: 'foobar',
                camelCase: 'barbar',
                fooBarBaz: 'baz',
                fooBarBAR: 'baz',
                fooBar_123: 'baz',
            },
            nestedArray: [
                { snakeKey: 'camel' },
                { fooBarBaz: 'barbar', fooBarBAR: 'baz' },
            ],
        }, {
                snake_key: 'foobar',
                camelCase: 'barbar',
                foo_barBaz: 'baz',
                foo_barBAR: 'baz',
                foo_bar_123: 'baz',
                nested_object: {
                    snake_key: 'foobar',
                    camelCase: 'barbar',
                    foo_barBaz: 'baz',
                    foo_barBAR: 'baz',
                    foo_bar_123: 'baz',
                },
                nested_array: [
                    { snake_key: 'camel' },
                    { foo_BarBaz: 'barbar', foo_barBAR: 'baz' },
                ],
            }
        ];

        yield [ [
            {
                snakeKey: 'foobar',
                camelCase: 'barbar',
                fooBarBaz: 'baz',
                fooBarBAR: 'baz',
                fooBar_123: 'baz',
            },
            [
                { snakeKey: 'camel' },
                { fooBarBaz: 'barbar', fooBarBAR: 'baz' },
            ],
        ], [
            {
                snake_key: 'foobar',
                camelCase: 'barbar',
                foo_barBaz: 'baz',
                foo_barBAR: 'baz',
                foo_bar_123: 'baz',
            },
            [
                { snake_key: 'camel' },
                { foo_BarBaz: 'barbar', foo_barBAR: 'baz' },
            ],
        ] ];
    }

    @dataProvider('provideSnakeCaseData')
    testToCamelCaseKeysShouldConvertKeysRecursively(expected, original) {
        expect(ArrayUtils.toCamelCaseKeys(original)).to.be.deep.equal(expected);
    }

    * provideCamelCaseData() {
        yield [ {
            snake_key: 'foobar',
            camel_case: 'barbar',
            foo_bar_baz: 'baz',
            foo_bar_BAR: 'baz',
            foo_bar_123: 'baz',
            nested_object: {
                snake_key: 'foobar',
                camel_case: 'barbar',
                foo_bar_baz: 'baz',
                foo_bar_BAR: 'baz',
                foo_bar_123: 'baz',
            },
            nested_array: [
                { camel_case: 'camel' },
                { foo_bar_baz: 'barbar', foo_bar_BAR: 'baz' },
            ],
        }, {
            snake_key: 'foobar',
            camelCase: 'barbar',
            fooBarBaz: 'baz',
            fooBar_BAR: 'baz',
            foo_bar_123: 'baz',
            nestedObject: {
                snake_key: 'foobar',
                camelCase: 'barbar',
                fooBarBaz: 'baz',
                fooBar_BAR: 'baz',
                foo_bar_123: 'baz',
            },
            nestedArray: [
                { camelCase: 'camel' },
                { fooBarBaz: 'barbar', fooBar_BAR: 'baz' },
            ],
        } ];

        yield [ [
            {
                snake_key: 'foobar',
                camel_case: 'barbar',
                foo_bar_baz: 'baz',
                foo_bar_BAR: 'baz',
                foo_bar_123: 'baz',
            },
            [
                { camel_case: 'camel' },
                { foo_bar_baz: 'barbar', foo_bar_BAR: 'baz' },
            ],
        ], [
            {
                snake_key: 'foobar',
                camelCase: 'barbar',
                fooBarBaz: 'baz',
                fooBar_BAR: 'baz',
                foo_bar_123: 'baz',
            },
            [
                { camelCase: 'camel' },
                { fooBarBaz: 'barbar', fooBar_BAR: 'baz' },
            ],
        ] ];
    }

    @dataProvider('provideCamelCaseData')
    testToSnakeCaseKeysShouldConvertKeysRecursively(expected, original) {
        expect(ArrayUtils.toSnakeCaseKeys(original)).to.be.deep.equal(expected);
    }

    testKsortShouldWorkCorrectly() {
        const o = {
            x: 'a',
            k: 'c',
            f: 'd',
            è: 's',
            à: 'w',
        };

        expect(ArrayUtils.ksort(o)).to.be.deep.eq({
            à: 'w',
            è: 's',
            f: 'd',
            k: 'c',
            x: 'a',
        });
    }

    testComputePatchObjectShouldWorkCorrectly() {
        const o1 = { foo: 'bar', bar: 'bar', baz: 'baz', undef: null };
        const o2 = { foo: 'baz', bar: 'bar', baz: undefined, undef: undefined };

        expect(ArrayUtils.computePatchObject(o1, o2)).to.be.deep.eq({ foo: 'baz', baz: null });
    }

    testComputePatchObjectShouldHandleNestedObjects() {
        const o1 = { foo: [ 'bar', 'baz' ], bar: { baz: 'baz', baz2: 'bazbaz' } };
        const o2 = { foo: [ 'baz', 'bar' ], bar: { baz: 'baz', baz1: 'baz2' } };

        expect(ArrayUtils.computePatchObject(o1, o2)).to.be.deep.eq({ foo: [ 'baz', 'bar' ], bar: { baz: 'baz', baz1: 'baz2' } });
    }

    testComputePatchObjectShouldHandleDates() {
        const o1 = { foo: new Date('2019-09-25T00:00:00Z'), bar: new Date('2019-09-25T00:00:00Z') };
        const o2 = { foo: new Date('2019-09-25T00:00:00Z'), bar: new Date('2019-09-20T00:00:00Z') };

        expect(ArrayUtils.computePatchObject(o1, o2)).to.be.deep.eq({ bar: '2019-09-20T00:00:00.000Z' });
    }
}
