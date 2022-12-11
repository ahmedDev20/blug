import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import supabase from '../lib/supabase';
import { IPost } from '../lib/models';
import { PostPreview } from '../components/PostPreview';
import { useTheme } from 'next-themes';

interface Props {
  posts: [IPost];
}

const Home: NextPage<Props> = ({ posts }) => {
  const { theme } = useTheme();

  return (
    <>
      <Head>
        <title>Blug</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="max-w-7xl mx-auto flex justify-between py-10 px-5 dark:bg-slate-900">
        <div className="space-y-5">
          <h1 className="text-6xl max-w-xl font-serif leading-tight">
            <span className="underline decoration-black decoration-4 dark:no-underline">Blug</span> is a place to write, read and connect.
          </h1>

          <h2>It&apos;s easy and free to post your thinking on any topic and connect with millions of readers.</h2>
        </div>

        <div className="!hidden md:!inline-flex h-32 lg:h-full">
          <Image width={400} height={200} objectFit="contain" src={theme == 'light' ? '/blug-logo.png' : '/blug-logo-white.png'} alt="medium logo" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto p-5 md:p-6">
        <div className="flex items-center gap-10 mb-10">
          <h1 className="text-3xl font-serif">Latest posts</h1>
          <hr className="flex-1 border-black dark:border-white" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {posts.map(post => (
            <PostPreview key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data, error } = await supabase.from('posts').select('*, author:authors(*), tags:posts_tags(tags(*))');

  if (error) {
    return {
      props: {
        posts: [],
      },
    };
  }

  const posts = data.map((post: IPost) => ({
    ...post,
    tags: post.tags.map((e: any) => e.tags),
  }));

  return {
    props: {
      posts,
    },
  };
};

export default Home;
