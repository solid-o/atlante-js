const ArrayUtils = Solido.Atlante.Utils.ArrayUtils;
const { expect } = require('chai');

describe('[Util] ArrayUtils', function () {
    it ('toCamelCaseKeys should convert keys recursively on an object', () => {
        const o = {
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
        };

        expect(ArrayUtils.toCamelCaseKeys(o)).to.be.deep.eq({
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
        });
    });

    it ('toCamelCaseKeys should convert keys recursively on an array', () => {
        const o = [
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
        ];

        expect(ArrayUtils.toCamelCaseKeys(o)).to.be.deep.eq([
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
        ]);
    });

    it ('toSnakeCaseKeys should convert keys recursively on an object', () => {
        const o = {
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
        };

        expect(ArrayUtils.toSnakeCaseKeys(o)).to.be.deep.eq({
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
        });
    });

    it ('toSnakeCaseKeys should convert keys recursively on an array', () => {
        const o = [
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
        ];

        expect(ArrayUtils.toSnakeCaseKeys(o)).to.be.deep.eq([
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
        ]);
    });

    it ('ksort should work correctly', () => {
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
    });

    it ('computePatchObject should work correctly', () => {
        const o1 = { foo: 'bar', bar: 'bar', baz: 'baz', undef: null };
        const o2 = { foo: 'baz', bar: 'bar', baz: undefined, undef: undefined };

        expect(ArrayUtils.computePatchObject(o1, o2)).to.be.deep.eq({ foo: 'baz', baz: null });
    });

    it ('computePatchObject should calculate nested objects', () => {
        const o1 = { foo: [ 'bar', 'baz' ], bar: { baz: 'baz', baz2: 'bazbaz' } };
        const o2 = { foo: [ 'baz', 'bar' ], bar: { baz: 'baz', baz1: 'baz2' } };

        expect(ArrayUtils.computePatchObject(o1, o2)).to.be.deep.eq({ foo: [ 'baz', 'bar' ], bar: { baz: 'baz', baz1: 'baz2' } });
    });

    it ('computePatchObject should handle Date object', () => {
        const o1 = { foo: new Date('2019-09-25T00:00:00Z'), bar: new Date('2019-09-25T00:00:00Z') };
        const o2 = { foo: new Date('2019-09-25T00:00:00Z'), bar: new Date('2019-09-20T00:00:00Z') };

        expect(ArrayUtils.computePatchObject(o1, o2)).to.be.deep.eq({ bar: '2019-09-20T00:00:00.000Z' });
    });
});
