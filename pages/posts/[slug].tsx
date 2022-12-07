import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { IComment, IPost } from '../../lib/models';
import supabase from '../../lib/supabase';
import Post from '../../components/Post';
import { Toaster } from 'react-hot-toast';
import CommentForm from '../../components/CommentForm';
import Comments from '../../components/Comments';

const Reactions = dynamic(() => import('../../components/Reactions'), { ssr: false });

interface Props {
  post: IPost;
}

const PostPage: NextPage<Props> = ({ post }) => {
  const title = `${post.title} - Blog`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <section className="max-w-4xl mx-auto md:flex">
        <Reactions post={post} />

        <div>
          <Post post={post} />

          <CommentForm post={post} />

          <Comments post={post} />
        </div>
      </section>

      <Toaster position="bottom-right" />
    </>
  );
};

export default PostPage;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data, error } = await supabase
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

  const post = data as IPost;

  post.tags = post.tags.map((e: any) => e.tags);
  post.comments = post.comments.sort((a: IComment, b: IComment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
