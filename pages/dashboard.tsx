import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { IComment, IPost } from '../lib/types';

interface Props {
  posts: [IPost];
  comments: [IComment];
}

export default function Dashboard(props: Props) {
  return (
    <>
      <Head>
        <title>Dashboard - Blug</title>
      </Head>

      <section className="max-w-7xl mx-auto px-2 md:p-0">
        <h1 className="text-3xl font-bold mt-4">Dashboard</h1>

        <div className="flex items-center justify-between w-full mt-5 gap-2">
          <div className="flex flex-col bg-gray-100 dark:bg-slate-800 p-4 w-full rounded-lg md:p-6">
            <h3 className="text-xl font-bold md:text-3xl">{props.posts.length}</h3>
            <p className="dark:text-gray-300">Posts</p>
          </div>

          <div className="flex flex-col bg-gray-100 dark:bg-slate-800 p-4 w-full rounded-lg md:p-6">
            <h3 className="text-xl font-bold md:text-3xl">{props.comments.length}</h3>
            <p className="dark:text-gray-300">Comments</p>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async (context, supabaseClient) => {
    const { error, data } = await supabaseClient.auth.getUser();

    if (error) {
      return {
        notFound: true,
      };
    }

    const { data: posts } = await supabaseClient.from('posts').select('*').eq('author_id', data.user?.id);
    const { data: comments } = await supabaseClient.from('comments').select('*').eq('author_id', data.user?.id);

    return {
      props: {
        posts,
        comments,
      },
    };
  },
});
