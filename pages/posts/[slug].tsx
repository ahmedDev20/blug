import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { IPost } from '../../lib/models';
import supabase from '../../lib/supabase';
import Post from '../../components/Post';
import { useUser } from '@supabase/auth-helpers-react';

const Reactions = dynamic(() => import('../../components/Reactions'), { ssr: false });
const CommentForm = dynamic(() => import('../../components/CommentForm'), { ssr: false });
const Comments = dynamic(() => import('../../components/Comments'), { ssr: false });

interface Props {
  post: IPost;
}

const PostPage: NextPage<Props> = ({ post }) => {
  const title = `${post.title} - Blog`;
  const user = useUser();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <section className="max-w-4xl mx-auto md:flex">
        <Reactions post={post} />

        <div>
          <Post post={post} />

          {user && <CommentForm post={post} />}

          <Comments post={post} />
        </div>
      </section>
    </>
  );
};

export default PostPage;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, tags:posts_tags(tags(*)), author:authors(*), comments(*), likes(*), bookmarks(*)')
    .eq('slug', params?.slug)
    .limit(1)
    .single();

  if (error) {
    return {
      notFound: true,
    };
  }

  post.tags = post.tags.map((e: any) => e.tags);

  return {
    props: {
      post,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: posts, error } = await supabase.from('posts').select();

  if (error) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  const paths = posts.map(post => ({ params: { slug: post.slug } }));
  return {
    paths,
    fallback: 'blocking',
  };
};
