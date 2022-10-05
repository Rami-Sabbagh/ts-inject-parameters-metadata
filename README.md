# ts-inject-parameters-metadata

A TypeScript transformer for injecting the metadata of a function's parameters to a specific function call.

## Development Log

I've written some notes and collected useful references while creating this, you can read them in [this document](./DEVLOG.md).

## Installation

```sh
yarn add --dev @rami-sabbagh/ts-inject-parameters-metadata
# or
npm i --save-dev @rami-sabbagh/ts-inject-parameters-metadata
```

You should also be using [ttypescript](https://github.com/cevek/ttypescript):

```sh
yarn add --dev ttypescript
# or
npm i --save-dev ttypescript
```

Merge the follow with your `tsconfig.json`:

```jsonc
{
    "compilerOptions": {
        "plugins": [
            {
                "transform": "@rami-sabbagh/ts-inject-parameters-metadata",
                "targetFunction": "magicValidate", // Replace it
            },
        ]
    }
}
```

And start using `ttsc` instead of `tsc`, for usage with webpack and other toolchains check ttypescript.

## Example of transformed code

```ts
type IndexType = number;

interface Coords {
    x: number,
    y: number,
    z: number,
}

const magicColor = 255;

function createAPI() {
    return {
        clear: (color: number) => {
            magicValidate();
        },

        setPaletteColor: (color: number, r: number, g: number, b: number) => {
            magicValidate();
        },

        primitives: (num: number, str: string, bool: boolean, nil: undefined, nul: null, unNum: number | undefined, nNum?: number) => {
            magicValidate();
        },

        objects: (array: [], struct: Coords, obj: Object, empty: {}, record: Record<string, string>) => {
            magicValidate();
        },

        arrays: (numArr: number[], strArr: string[], boolArr: boolean[], mixed: (string | number)[]) => {
            magicValidate();
        },

        union: (value: string | number, ref: string | IndexType, repeated: string | string | string) => {
            magicValidate();
        },

        aliased: (value: IndexType) => {
            magicValidate();
        },

        defaultValue: (color = magicColor) => {
            magicValidate();
        },

        literals: (num: 5, str: 'str' | 'a' | string, bool: false) => {
            magicValidate();
        },
    };
}

function greet(name = 'world') {
    magicValidate();
}
```

Result:

```js
"use strict";
const magicColor = 255;
function createAPI() {
    return {
        clear: (color) => {
            magicValidate("clear", [
                [color, "color", ["number"]]
            ]);
        },
        setPaletteColor: (color, r, g, b) => {
            magicValidate("setPaletteColor", [
                [color, "color", ["number"]],
                [r, "r", ["number"]],
                [g, "g", ["number"]],
                [b, "b", ["number"]]
            ]);
        },
        primitives: (num, str, bool, nil, nul, unNum, nNum) => {
            magicValidate("primitives", [
                [num, "num", ["number"]],
                [str, "str", ["string"]],
                [bool, "bool", ["boolean"]],
                [nil, "nil", ["undefined"]],
                [nul, "nul", ["null"]],
                [unNum, "unNum", ["undefined", "number"]],
                [nNum, "nNum", ["undefined", "number"]]
            ]);
        },
        objects: (array, struct, obj, empty, record) => {
            magicValidate("objects", [
                [array, "array", [[]]],
                [struct, "struct", [[]]],
                [obj, "obj", [[]]],
                [empty, "empty", [[]]],
                [record, "record", [["string"]]]
            ]);
        },
        arrays: (numArr, strArr, boolArr, mixed) => {
            magicValidate("arrays", [
                [numArr, "numArr", [["number"]]],
                [strArr, "strArr", [["string"]]],
                [boolArr, "boolArr", [["boolean"]]],
                [mixed, "mixed", [["string", "number"]]]
            ]);
        },
        union: (value, ref, repeated) => {
            magicValidate("union", [
                [value, "value", ["string", "number"]],
                [ref, "ref", ["string", "number"]],
                [repeated, "repeated", ["string"]]
            ]);
        },
        aliased: (value) => {
            magicValidate("aliased", [
                [value, "value", ["number"]]
            ]);
        },
        defaultValue: (color = magicColor) => {
            magicValidate("defaultValue", [
                [color, "color", ["number", "undefined"]]
            ]);
        },
        literals: (num, str, bool) => {
            magicValidate("literals", [
                [num, "num", ["number"]],
                [str, "str", ["string"]],
                [bool, "bool", ["boolean"]]
            ]);
        },
    };
}
function greet(name = 'world') {
    magicValidate("greet", [
        [name, "name", ["string", "undefined"]]
    ]);
}
```
