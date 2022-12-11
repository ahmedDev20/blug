const removeImports = require('next-remove-imports')({});
const withTM = require('next-transpile-modules')(['react-syntax-highlighter']);
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer(
  withTM(
    removeImports({
      reactStrictMode: true,
      images: {
        domains: ['accountabilitylab.org', 'cdn.sanity.io', 'bitsofco.de', 'mavcwcyiwogmvgzxcxwu.supabase.co', 'avatars.githubusercontent.com'],
      },
    }),
  ),
);
