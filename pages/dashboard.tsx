import Head from 'next/head';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSideProps } from 'next';
import { PostPreview } from '../components/PostPreview';
import { IComment, IPost } from '../lib/types';

interface Props {
  posts: [IPost];
  comments: [IComment];
}

export default function Dashboard({ posts, comments }: Props) {
  return (
    <>
      <Head>
        <title>Dashboard - Blug</title>
      </Head>

      <main className="max-w-7xl mx-auto px-2 md:p-0 mt-4">
        <section className="mt-5">
          <h1 className="text-3xl font-bold">Stats</h1>
          <div className="flex items-center justify-between w-full mt-4 gap-2">
            <div className="flex flex-col bg-gray-100 dark:bg-slate-800 p-4 w-full rounded-lg md:p-6">
              <h3 className="text-xl font-bold md:text-3xl">{posts.length}</h3>
              <p className="dark:text-gray-300">Posts</p>
            </div>

            <div className="flex flex-col bg-gray-100 dark:bg-slate-800 p-4 w-full rounded-lg md:p-6">
              <h3 className="text-xl font-bold md:text-3xl">{comments.length}</h3>
              <p className="dark:text-gray-300">Comments</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h1 className="text-3xl font-bold">My posts</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-4">
            {posts.length > 0 ? (
              posts?.map(post => <PostPreview canBeDeleted canBeEdited key={post.id} post={post} />)
            ) : (
              <p>You have no posts, go and create one.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async (_, supabaseClient) => {
    try {
      const { error: userErr, data: userData } = await supabaseClient.auth.getUser();
      if (userErr) throw userErr;

      const { data, error: postsErr } = await supabaseClient
        .from('posts')
        .select('*, author:authors(*), tags:posts_tags(tags(*))')
        .eq('author_id', userData.user?.id);
      if (postsErr) throw postsErr;

      const { data: comments, error: commentsErr } = await supabaseClient
        .from('comments')
        .select('*')
        .eq('author_id', userData?.user?.id);
      if (commentsErr) throw commentsErr;

      const posts = data?.map(post => ({ ...post, tags: post.tags.map((tag: any) => tag.tags) }));

      return {
        props: {
          posts,
          comments,
        },
      };
    } catch (error) {
      return {
        props: {},
        redirect: {
          destination: '/login',
        },
      };
    }
  },
});
