import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

import { IComment, IPost } from '../../lib/types';
import supabase from '../../lib/supabase';
import Post from '../../components/Post';
import ScrollToTop from 'react-scroll-to-top';
import { FaLongArrowAltUp } from 'react-icons/fa';
import Reactions from '../../components/Reactions';

const Comments = dynamic(() => import('../../components/Comments'));

interface Props {
  post: IPost;
}

const PostPage: NextPage<Props> = ({ post }) => {
  const title = `${post?.title} - Blog`;

  if (!post) return null;

  return (
    <>
      <Head>
        <title>{title}</title>
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, tags:posts_tags(tags(*)), author:authors(*), comments(*, author:authors(*)), likes(*), bookmarks(*)')
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
