/** @type {import("prettier").Config} */
module.exports = {
  singleQuote: true,
  semi: true,
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  importOrder: [
    '^react$',
    '^next',
    '^@/components/(.*)$',
    '^@/lib/(.*)$',
    '^@/app/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[./]',
    '',
    '.css$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderCaseSensitive: false,
}; 