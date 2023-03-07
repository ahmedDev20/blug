const removeImports = require('next-remove-imports')({});
const withTM = require('next-transpile-modules')(['react-syntax-highlighter']);

/** @type {import('next').NextConfig} */
module.exports = withTM(
  removeImports({
    reactStrictMode: true,
    images: {
      domains: ['accountabilitylab.org', 'cdn.sanity.io', 'bitsofco.de', 'mavcwcyiwogmvgzxcxwu.supabase.co', 'avatars.githubusercontent.com'],
    },
  }),
);
