import { NextPage } from 'next';
import Head from 'next/head';

const NotFound: NextPage = () => {
  return (
    <>
      <Head>
        <title>404 Not found</title>
      </Head>

      <main className="h-[80vh] grid place-items-center">
        <div className="flex space-x-4 items-center">
          <div className="flex space-x-4">
            <h3 className="font-bold">404</h3>
            <h3>This page could not be found</h3>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
