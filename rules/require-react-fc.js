module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require explicit return type as React.FC for functions returning JSX',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreComponents: {
            type: 'array',
            items: { type: 'string' },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    fixable: 'code',
    messages: {
      missingFC: 'Function returning JSX must explicitly declare its type as React.FC.',
    },
  },
  create(context) {
    const options = context.options[0] || {}
    const ignoreComponents = new Set(options.ignoreComponents || [])
    const sourceCode = context.getSourceCode()

    return {
      VariableDeclarator(node) {
        if (node.init && node.init.type === 'ArrowFunctionExpression') {
          checkNode(node, context)
        }
      },
      FunctionDeclaration(node) {
        checkNode(node, context)
      },
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'ArrowFunctionExpression' || node.declaration.type === 'FunctionDeclaration') {
          checkNode(node.declaration, context)
        }
      },
    }

    function checkNode(node, context) {
      const variableId = node.id || node

      if (!variableId || variableId.type !== 'Identifier') return

      if (ignoreComponents.has(variableId.name)) {
        return
      }

      const returnsJSX = containsJSX(node.body || node.init.body)

      if (!returnsJSX || !isPascalCase(variableId.name)) return

      const typeAnnotation = variableId.typeAnnotation && variableId.typeAnnotation.typeAnnotation

      if (typeAnnotation && isFCType(typeAnnotation)) return

      context.report({
        node: variableId,
        messageId: 'missingFC',
        fix: fixer => {
          const name = variableId.name
          return fixer.insertTextAfter(variableId, `: React.FC`)
        },
      })
    }

    function isFCType(typeAnnotation) {
      const { typeName } = typeAnnotation
      if (!typeName) return false

      if (typeName.type === 'TSQualifiedName') {
        return typeName.left.name === 'React' && typeName.right.name === 'FC'
      }

      return typeName.name === 'FC'
    }

    function containsJSX(body) {
      if (!body) return false

      if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
        return true
      }

      if (body.type === 'BlockStatement') {
        return body.body.some(
          stmt =>
            stmt.type === 'ReturnStatement' &&
            stmt.argument &&
            (stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment'),
        )
      }

      return false
    }

    function isPascalCase(name) {
      return /^[A-Z][\w\d]*$/.test(name)
    }
  },
}
