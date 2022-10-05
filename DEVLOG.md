
# TS Dive Diary

My notes while diving into the TypeScript internals.

## Exploring the TS API

Attach the debugger, period.

Really, within vscode simply start a "JavaScript Debug" terminal and run the build command, the debugger will then be automatically attached, so convenient!

Then set a debug point within your transformer and once the program has been pause,
switch to the "DEBUG CONSOLE" tab within the same panel of the terminal.

Viola now you have a very nice way to explore the environment and try the methods.

### Formatting the flags

You'll most probably face a `flags` field within some structure, it's a bitfield of flags which can be formatted into a human readable format with such code:

```ts
import ts from 'typescript';

// Because they are considered internal by TypeScript and shouldn't be relied upon.
// (internal is an access modifier, give it a search if that's new for you).
// Please note that this is a in-complete list.
const unInterestingFlags = [
    'Intrinsic', 'Primitive', 'DefinitelyNonNullable',
    'DisjointDomains', 'Singleton', 'IncludesMask',
    'ObjectFlagsType', 'DefinitelyFalsy', 'NotPrimitiveUnion',
];

function formatTypeFlags(flags: ts.TypeFlags): string {
    const flagsNames: string[] = [];

    for (const [key, value] of Object.entries(ts.TypeFlags)) {
        if (typeof value !== 'number') continue;
        if (unInterestingFlags.includes(key)) continue;

        if ((flags & value) !== 0) flagsNames.push(key);
    }

    return flagsNames.join(', ');
}

// I haven't dug much in this and thus didn't exclude the internal flags.

function formatSymbolFlags(flags: ts.SymbolFlags): string {
    const flagsNames: string[] = [];

    for (const [key, value] of Object.entries(ts.SymbolFlags)) {
        if (typeof value !== 'number') continue;

        if ((flags & value) !== 0) flagsNames.push(key);
    }

    return flagsNames.join(', ');
}
```

## Documentation Resources

- **[TypeScript Deep Dive GitBook](https://basarat.gitbook.io/typescript/overview)**: A useful book that encouraged me to take the dive.
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)**: The normal language handbook for normal users who wish to use TypeScript.
- **[Microsoft's Architectural Overview of TypeScript](https://github.com/microsoft/TypeScript/wiki/Architectural-Overview)**: Contains links to some other resources..
- **[Glossary](https://github.com/microsoft/TypeScript-Compiler-Notes/blob/main/GLOSSARY.md)**: Reading it along with some of the deep dive book is important get familiar with the terminology used.
- **[Using the Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)**: An official documentation for using the compiler API.
- **[TypeScript Compiler Notes](https://github.com/microsoft/TypeScript-Compiler-Notes)**: "a corpus of notes from many engineers over time on different systems inside the TypeScript codebase.".
- **[TypeScript Transformer Handbook](https://github.com/madou/typescript-transformer-handbook)**: It contains most of what I could have written in a blog post and way much more.

## Tools Resources

- **[astexplorer.net](https://astexplorer.net/) ([source-code](https://github.com/fkling/astexplorer/))**: a cool tool for viewing the AST of many parsers and even a playground for writing a transformer.
- **[ttypescript](https://github.com/cevek/ttypescript)**: for writing typescript transformers.
- **[simple-ts-transform](https://github.com/slune-org/simple-ts-transform)**: a _framework_ to make writing transformers easier.
- **[ts-creator.js.org](https://ts-creator.js.org/) ([source & api](https://github.com/HearTao/ts-creator))**: a tool for generating the code which constructs the AST of a code snippet.

## Source-code Resources

- **[TypeScript](https://github.com/microsoft/TypeScript)**: don't shy from peeking into TypeScript's source-code!


## Off-topic notes

- `<>` was the old syntax for type casting (which is now the `as` keyword), [reference](https://stackoverflow.com/questions/33503077/any-difference-between-type-assertions-and-the-newer-as-operator-in-typescript).
- Found about a new graph visualizing tool similar to mermaid but more advanced: [graphviz](https://graphviz.org/), unfortunately the website contains a _reference_ rather than a more user-friendly get started guide (well they don't want the headache and that's understandable for advanced tools).
    - There's a [live playground](http://magjac.com/graphviz-visual-editor/).
    - Here's an unofficial [pocket guide](https://graphs.grevian.org/).
- Found about [zod](https://zod.dev/) a schema tool while viewing the [twitter feed of TS lead developer](https://twitter.com/SeaRyanC).
    - Hmmm [typescriptneedstypes.com](https://www.typescriptneedstypes.com/).
