import { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { IComment, IPost } from '@/lib/types';
import supabase from '@/lib/supabase';
import Post from '@/components/Post';
import ScrollToTop from 'react-scroll-to-top';
import { FaLongArrowAltUp } from 'react-icons/fa';
import Reactions from '@/components/Reactions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Comments = dynamic(() => import('@/components/Comments'));

interface Props {
  slug: string;
}

const Skeleton = () => (
  <div className="flex-2 rounded-none md:rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-md relative">
    <div className="animate-pulse bg-gray-200 dark:bg-slate-700 h-48 w-full" />
    <div className="animate-pulse bg-gray-200 dark:bg-slate-700 h-48 w-full" />
    <div className="animate-pulse bg-gray-200 dark:bg-slate-700 h-48 w-full" />
  </div>
);

const PostPage: NextPage<Props> = () => {
  const { query } = useRouter();
  const [post, setPost] = useState<IPost | null>(null);
  const title = `${post?.title} - Blog`;

  useEffect(() => {
    async function fetchPost(slug: string) {
      const { data, error } = await supabase
        .from('posts')
        .select('*, tags:posts_tags(tags(*)), author:authors(*), comments(*, author:authors(*)), likes(*), bookmarks(*)')
        .eq('slug', slug)
        .limit(1)
        .single();

      if (error) {
        return setPost(null);
      }

      const post = data as IPost;

      post.tags = post.tags.map((e: any) => e.tags);
      post.comments = post.comments.sort((a: IComment, b: IComment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPost(post);
    }

    fetchPost(query.slug as string);
  }, [query.slug]);

  if (!post) return <Skeleton />;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.coverUrl} />
      </Head>

      <section className="max-w-4xl mx-auto md:flex">
        <Reactions postId={post.id} />

        <div>
          <Post post={post} />

          <Comments postId={post.id} />
        </div>
      </section>

      <ScrollToTop
        smooth
        component={<FaLongArrowAltUp className="text-2xl text-yellow-500 text-center" />}
        className="hidden items-center justify-center md:flex"
      />
    </>
  );
};

export default PostPage;
