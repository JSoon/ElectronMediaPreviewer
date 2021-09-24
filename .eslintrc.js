module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  globals: {
    electron: true
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

    "@typescript-eslint/no-var-requires": "off",

    "prettier/prettier": [
      "error",
      {
        arrowParens: "always",
        bracketSpacing: true,
        embeddedLanguageFormatting: "auto",
        endOfLine: "auto",
        htmlWhitespaceSensitivity: "ignore",
        insertPragma: false,
        jsxBracketSameLine: false,
        jsxSingleQuote: true,
        printWidth: 120,
        quoteProps: "consistent",
        requirePragma: false,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: "es5",
        useTabs: false,
        vueIndentScriptAndStyle: false,
      }
    ]
  }
};
