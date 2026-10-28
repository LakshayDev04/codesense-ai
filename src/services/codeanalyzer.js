
const { Linter } = require("eslint");

const linter = new Linter();

// Convert ESLint rule names into user-friendly titles.
function getIssueTitle(ruleId) {
  const titles = {
    "no-undef": "Undefined variable",
    "no-unused-vars": "Unused variable",
    "no-unreachable": "Unreachable code",
    "eqeqeq": "Use strict equality",
    "no-constant-condition": "Constant condition",
    "no-dupe-keys": "Duplicate object key",
    "no-constant-binary-expression": "Suspicious constant expression",
    "no-self-assign": "Self-assignment",
    "no-duplicate-case": "Duplicate switch case",
    "curly": "Missing braces"
  };

  return titles[ruleId] || (
    ruleId ? "Code quality issue" : "Syntax or parsing error"
  );
}

function getIssueExplanation(ruleId) {
  const explanations = {
    "no-undef":
      "This variable or name has not been declared in the current scope. It could be a spelling mistake or a missing import.",

    "no-unused-vars":
      "This variable is declared but never used. It may be unnecessary or indicate that part of your code is incomplete.",

    "no-unreachable":
      "This code cannot execute because control flow exits before it is reached.",

    "eqeqeq":
      "Loose equality can convert values before comparing them, which may cause unexpected results.",

    "no-constant-condition":
      "This condition is constant, so a branch or loop may behave differently than intended.",

    "no-dupe-keys":
      "The same property appears more than once in an object. A later value can overwrite an earlier one.",

    "no-constant-binary-expression":
      "This expression contains a constant operation or comparison that may behave differently than intended.",

    "no-self-assign":
      "A variable is assigned its own value, so the assignment does not change anything.",

    "no-duplicate-case":
      "A switch statement contains a duplicate case label, making that branch unreachable when the earlier matching case is selected.",

    "curly":
      "A control-flow statement is missing braces, which can make the intended logic harder to read and maintain."
  };

  return explanations[ruleId] ||
    "Review the reported location and ESLint message to understand the issue.";
}


function getFixGuidance(ruleId) {
  const guidance = {
    "no-undef":
      "Declare the variable, import it where appropriate, or correct its spelling.",

    "no-unused-vars":
      "Remove the unused declaration or use the variable if it is needed.",

    "no-unreachable":
      "Review the return, throw, break, or continue statement before this code.",

    "eqeqeq":
      "Use === or !== when strict comparison is intended, and verify the expected types.",

    "no-constant-condition":
      "Check whether the condition should depend on a variable or changing program state.",

    "no-dupe-keys":
      "Give each object property a unique key and retain the intended value.",

    "no-constant-binary-expression":
      "Check operator precedence and rewrite the expression to reflect the intended logic.",

    "no-self-assign":
      "Remove the unnecessary assignment or assign the intended new value.",

    "no-duplicate-case":
      "Remove the duplicate case label or change it to the intended distinct value.",

    "curly":
      "Add braces around the body of the if, else, loop, or other affected statement."
  };

  return guidance[ruleId] ||
    "Review the issue and choose a correction that preserves the intended behavior.";
}

function analyzeCode(code) {
  const config = {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        console: "readonly",
        Math: "readonly",
        JSON: "readonly",
        Number: "readonly",
        String: "readonly",
        Array: "readonly",
        Object: "readonly",
        Promise: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },

    rules: {
      "no-undef": "error",

      "no-unused-vars": [
        "warn",
        {
          args: "none",
          caughtErrors: "none"
        }
      ],

      "no-unreachable": "error",
      "eqeqeq": ["warn", "always"],
      "no-constant-condition": "warn",
      "no-dupe-keys": "error",
      "no-constant-binary-expression": "error",
      "no-self-assign": "warn",
      "no-duplicate-case": "error",
      "curly": ["warn", "all"]
    }
  };

  const messages = linter.verify(code, config);

  console.log(
    "DEBUG — raw ESLint suggestions:",
    JSON.stringify(
      messages.map((issue) => ({
        ruleId: issue.ruleId,
        suggestions: issue.suggestions
      })),
      null,
      2
    )
  );


 return messages.map((issue) => ({
  ruleId: issue.ruleId || "syntax-error",
  title: getIssueTitle(issue.ruleId),
  message: issue.message,

  explanation: getIssueExplanation(issue.ruleId),
  howToFix: getFixGuidance(issue.ruleId),

    line: issue.line ?? null,
    column: issue.column ?? null,
    endLine: issue.endLine ?? null,
    endColumn: issue.endColumn ?? null,

    severity: issue.severity === 2 ? "error" : "warning",

    // Keep the actual automatic replacement, if ESLint provides one.
    fixAvailable: Boolean(issue.fix),
    fix: issue.fix
      ? {
        range: issue.fix.range,
        text: issue.fix.text
      }
      : null,

    // Keep the actual suggestions, if ESLint provides any.
    suggestionsAvailable: Boolean(
      issue.suggestions && issue.suggestions.length > 0
    ),

    suggestions: (issue.suggestions || []).map((suggestion) => ({
      description: suggestion.desc,
      fix: suggestion.fix
        ? {
          range: suggestion.fix.range,
          text: suggestion.fix.text
        }
        : null
    }))
  }));

}

module.exports = { analyzeCode };

