
const globals = require("globals");
module.exports = [
  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
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
      "no-constant-condition": "warn"
    }
    },
  {
    files: ["public/**/*.js"],

    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
    },
  {
    files: ["public/**/*.js"],

    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
];
