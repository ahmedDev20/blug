import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

const Login: NextPage = () => {
  const { supabaseClient, session } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push('/profile');
    }
  }, [session, router]);

  return (
    <>
      <Head>
        <title>Welcome! - Blug</title>
      </Head>

      <section className="max-w-xl flex flex-col border p-5 m-5 md:mx-auto rounded-lg bg-white dark:bg-transparent">
        <h3 className="text-2xl text-center font-serif">Welcome back.</h3>

        <Auth theme="dark" onlyThirdPartyProviders supabaseClient={supabaseClient} appearance={{ theme: ThemeSupa }} providers={['github', 'twitter']} />
      </section>
    </>
  );
};

export default Login;

export const getServerSideProps: GetServerSideProps = async context => {
  const supabaseServerClient = createServerSupabaseClient(context);

  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser();

  if (user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
