module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require explicit return type as React.FC for arrow functions returning JSX',
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
      missingFC: 'Arrow function returning JSX must explicitly declare its type as React.FC.',
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
      ExportDefaultDeclaration(node) {
        if (node.declaration.type === 'ArrowFunctionExpression') {
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
          const fixes = []
          const name = variableId.name

          fixes.push(fixer.insertTextAfter(variableId, `: FC`))

          if (!isReactImported()) {
            fixes.push(fixer.insertTextBefore(sourceCode.ast, `import { FC } from 'react';\n`))
          } else if (!isFCImported()) {
            fixes.push(addFCToReactImport(fixer))
          }

          return fixes
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

    function isReactImported() {
      return sourceCode.ast.body.some(
        node =>
          node.type === 'ImportDeclaration' &&
          node.source.value === 'react' &&
          node.specifiers.some(
            specifier => specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'React',
          ),
      )
    }

    function isFCImported() {
      return sourceCode.ast.body.some(
        node =>
          node.type === 'ImportDeclaration' &&
          node.source.value === 'react' &&
          node.specifiers.some(specifier => specifier.type === 'ImportSpecifier' && specifier.imported.name === 'FC'),
      )
    }

    function addFCToReactImport(fixer) {
      const reactImport = sourceCode.ast.body.find(
        node => node.type === 'ImportDeclaration' && node.source.value === 'react',
      )

      if (reactImport) {
        const lastSpecifier = reactImport.specifiers[reactImport.specifiers.length - 1]
        return fixer.insertTextAfter(lastSpecifier, `, FC`)
      }
      return null
    }
  },
}
