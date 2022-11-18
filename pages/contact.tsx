import type { NextPage } from 'next';
import Head from 'next/head';

const Contact: NextPage = () => {
  return (
    <>
      <Head>
        <title>Contact Blug - Blug</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="max-w-4xl mx-auto border rounded-lg px-4 md:px-12 py-8 mt-4 bg-white dark:bg-transparent">
        <h2 className="text-4xl font-bold">Contact</h2>

        <p className="mt-8 text-lg leading-7">Blug Community would love to hear from you!</p>
        <p className="mt-4 text-lg leading-7">
          Email:{' '}
          <a href="#" className="underline">
            contact@blug.dev
          </a>{' '}
          😁
        </p>
        <p className="mt-4 text-lg leading-7">
          Twitter:{' '}
          <a href="#" className="underline">
            @blugdotdev
          </a>{' '}
          👻
        </p>
        <p className="mt-4 text-lg leading-7">
          Report a vulnerability:{' '}
          <a href="#" className="underline">
            blug.dev/security
          </a>{' '}
          🐛 To report a bug, please create a bug report in our open source repository.
        </p>
        <p className="mt-4 text-lg leading-7">To request a feature, please start a new GitHub Discussion in the Forem repo!</p>
      </section>
    </>
  );
};

export default Contact;
