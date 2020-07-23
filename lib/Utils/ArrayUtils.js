import '@jymfony/util/lib/Platform';
import '@jymfony/util/lib/is';
const collator = new Intl.Collator('en');

/**
 * Provide array utils
 */
export default class ArrayUtils {
    /**
     * Recursively converts all the keys to camel case.
     *
     * @param {Object.<string, *>} input
     *
     * @return {Object.<string, *>}
     */
    static toCamelCaseKeys(input) {
        return Array.from(Object.entries(input))
            .reduce((res, val) => (
                res[
                    val[0].toString().replace(/(?!^)_([a-zA-Z])/g, matches => matches[1].toUpperCase())
                ] = Array.isArray(val[1]) || isObjectLiteral(val[1]) ? ArrayUtils.toCamelCaseKeys(val[1]) : val[1]
                , res
            ), Array.isArray(input) ? [] : {})
        ;
    }

    /**
     * Recursively converts all the keys to snake case.
     *
     * @param {Object.<string, *>} input
     *
     * @return {Object.<string, *>}
     */
    static toSnakeCaseKeys(input) {
        return Array.from(Object.entries(input))
            .reduce((res, val) => (
                res[
                    val[0].toString().replace(/([a-z0-9])([A-Z])/g, (...matches) => matches[1] + '_' + matches[2].toLowerCase())
                ] = Array.isArray(val[1]) || isObjectLiteral(val[1]) ? ArrayUtils.toSnakeCaseKeys(val[1]) : val[1]
                , res
            ), Array.isArray(input) ? [] : {});
    }

    /**
     * Sort an object by keys.
     *
     * @param {Object.<string, *>} obj
     *
     * @returns {Object.<string, *>}
     */
    static ksort(obj) {
        return Array.from(Object.entries(obj))
            .sort((a, b) => collator.compare(a[0], b[0]))
            .reduce((res, val) => (res[val[0]] = obj[val[0]], res), {})
        ;
    }

    /**
     * Shuffle array elements
     *
     * @param {*[]} input
     *
     * @return {*[]}
     */
    static shuffle(input) {
        return input
            .map(a => [ Math.random(), a ])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1])
        ;
    }

    /**
     * Computes the difference between two objects.
     *
     * @param {Object.<string, *>} originalData
     * @param {Object.<string, *>} newData
     *
     * @return {Object.<string, *>}
     */
    static computePatchObject(originalData, newData) {
        return Object.entries(newData)
            .reduce((res, val) => {
                const original = originalData[val[0]];
                if (undefined === val[1] || null === val[1]) {
                    if (undefined === original || null === original) {
                        return res;
                    }

                    res[val[0]] = null;
                } else if (val[1] instanceof Date) {
                    if (original instanceof Date && val[1].valueOf() === original.valueOf()) {
                        return res;
                    }

                    res[val[0]] = val[1].toISOString();
                } else if (JSON.stringify(val[1]) !== JSON.stringify(original)) {
                    res[val[0]] = val[1];
                }

                return res;
            }, {});
    }
}
