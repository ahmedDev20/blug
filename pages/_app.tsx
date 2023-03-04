import '../styles/globals.css';
import '../styles/markdown.css';
import 'nprogress/nprogress.css';

import type { AppProps } from 'next/app';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import Router from 'next/router';
import NProgress from 'nprogress';
import Layout from '../components/shared/Layout';
import { Session, SessionContextProvider } from '@supabase/auth-helpers-react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps<{ initialSession: Session }>) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <Header />
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Footer />
      </ThemeProvider>
    </SessionContextProvider>
  );
}

export default MyApp;
