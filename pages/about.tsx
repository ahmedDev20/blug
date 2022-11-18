import type { NextPage } from 'next';
import Head from 'next/head';

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Blug - Blug</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="max-w-4xl mx-auto border rounded-lg px-4 md:px-12 py-8 mt-4 bg-white dark:bg-transparent">
        <h2 className="text-4xl font-bold">About Blug</h2>

        <p className="mt-8 text-lg leading-7">
          Blug is a community of software developers getting together to help one another out. The software industry relies on collaboration and networked
          learning. We provide a place for that to happen.
        </p>

        <p className="mt-4 text-lg leading-7">
          We believe in transparency and adding value to the ecosystem. We hope you enjoy poking around and participating!
        </p>

        <p className="mt-4 text-lg leading-7">
          Our team is distributed around the world. We have no office, but we come together online each day to build community and improve the software careers
          of millions.
        </p>

        <p className="mt-8 text-lg leading-7">Happy coding ❤️</p>
      </section>
    </>
  );
};

export default About;
