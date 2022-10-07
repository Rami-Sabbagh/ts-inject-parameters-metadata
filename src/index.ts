import ts from "typescript";

interface PluginOptions {
    targetFunction: string,
}

function findParentDeclaration(node?: ts.Node): ts.ArrowFunction | ts.FunctionDeclaration | ts.MethodDeclaration | undefined {
    while (node !== undefined) {
        if (ts.isArrowFunction(node)) return node;
        else if (ts.isFunctionDeclaration(node)) return node;
        else if (ts.isMethodDeclaration(node)) return node;

        node = node.parent;
    }

    return undefined;
}

type TypeTokens = (string | TypeTokens)[];

function generateTypeTokens(type: ts.Type): TypeTokens {
    const tokens = new Set<string | TypeTokens>();

    if (type.flags & ts.TypeFlags.Number) tokens.add('number');
    if (type.flags & ts.TypeFlags.NumberLike) tokens.add('number');
    if (type.flags & ts.TypeFlags.String) tokens.add('string');
    if (type.flags & ts.TypeFlags.StringLiteral) tokens.add('string');
    if (type.flags & ts.TypeFlags.Boolean) tokens.add('boolean');
    if (type.flags & ts.TypeFlags.BooleanLiteral) tokens.add('boolean');
    if (type.flags & ts.TypeFlags.Undefined) tokens.add('undefined');
    if (type.flags & ts.TypeFlags.Null) tokens.add('null');
    if (type.flags & ts.TypeFlags.Object) {
        if (type.getCallSignatures()?.length ?? 0 >= 1) tokens.add('function')
        else {
            const indexTokens: TypeTokens = [];

            const numberIndexType = type.getNumberIndexType();
            if (numberIndexType) indexTokens.push(...generateTypeTokens(numberIndexType));

            const stringIndexType = type.getStringIndexType();
            if (stringIndexType) indexTokens.push(...generateTypeTokens(stringIndexType));

            tokens.add(indexTokens);
        }
    }

    // Don't follow boolean union types because they are either 'true' or 'false' literals.
    if (type.isUnion() && ((type.flags & ts.TypeFlags.Boolean) === 0))
        type.types.flatMap(generateTypeTokens).forEach(tokens.add.bind(tokens));

    return [...tokens];
}

function generateTypeMetaExpressions(tokens: TypeTokens): ts.Expression[] {
    const f = ts.factory;

    return tokens.map(token =>
        typeof token === 'string'
            ? f.createStringLiteral(token)
            : f.createArrayLiteralExpression(generateTypeMetaExpressions(token))
    );
}

export default function factory(program: ts.Program, { targetFunction }: PluginOptions): ts.TransformerFactory<ts.SourceFile> {
    if (targetFunction === undefined) throw new Error("'targetFunction' has not been set.");
    const checker = program.getTypeChecker();

    return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        const f = context.factory;

        return (sourceFile: ts.SourceFile): ts.SourceFile => {
            const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
                if (
                    ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === targetFunction
                ) {
                    const methodNode = findParentDeclaration(node);
                    if (!methodNode) return node;

                    const methodName = methodNode.name?.getText() ?? (
                        ts.isPropertyAssignment(methodNode.parent) &&
                            ts.isIdentifier(methodNode.parent.name) ?
                            methodNode.parent.name.text : undefined
                    );

                    const parametersMetadata: ts.Expression[] = [];

                    for (const parameter of methodNode.parameters) {
                        if (!ts.isIdentifier(parameter.name)) {
                            parametersMetadata.push(f.createIdentifier('undefined'));
                            return node;
                        };

                        const name = parameter.name.text;
                        const type = checker.getTypeAtLocation(parameter);
                        const typesTokens = generateTypeTokens(type);

                        if (parameter.initializer && !typesTokens.includes('undefined'))
                            typesTokens.push('undefined');

                        parametersMetadata.push(f.createArrayLiteralExpression([
                            f.createIdentifier(name),
                            f.createStringLiteral(name),
                            f.createArrayLiteralExpression(generateTypeMetaExpressions(typesTokens)),
                        ]));
                    }

                    return f.updateCallExpression(
                        node,
                        node.expression,
                        undefined,
                        [
                            methodName ? f.createStringLiteral(methodName) : f.createIdentifier('undefined'),
                            f.createArrayLiteralExpression(parametersMetadata, true),
                        ],
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        }
    };
}