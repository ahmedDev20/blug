import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="scroll-smooth" lang="en">
      <Head>
        <meta property="og:type" content="website" />
        <meta name="description" content="It's easy and free to post your thinking on any topic and connect with millions of readers." />
        <meta property="og:title" content="Blug is a place to write, read and connect." />
        <meta property="og:description" content="It's easy and free to post your thinking on any topic and connect with millions of readers." />
        <meta property="og:image" content="https://i.ibb.co/PW5rmby/Blug.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-gray-200 dark:bg-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
