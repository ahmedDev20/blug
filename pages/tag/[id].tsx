import { NextPage, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { IPost, ITag } from '../../lib/models';
import supabase from '../../lib/supabase';
import Head from 'next/head';
import { PostPreview } from '../../components/PostPreview';

interface Props {
  posts: [IPost];
  tag: ITag;
}

const PostsByTag: NextPage<Props> = ({ posts, tag }) => {
  const title = `Posts tagged with ${tag.name}`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <section className="max-w-5xl mx-auto px-5">
        <h1 className="text-4xl font-bold mt-4">
          Posts tagged with <span className="underline">#{tag.name}</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-8">
          {posts?.map(post => (
            <PostPreview key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
};

export default PostsByTag;

type Context = GetServerSidePropsContext;
type Result = GetServerSidePropsResult<{ posts: IPost[]; tag: ITag | null }>;

export async function getServerSideProps(ctx: Context): Promise<Result> {
  const { params } = ctx;
  const { data, error } = await supabase.from('posts_tags').select('id_tag, tag:tags(*), post:posts(*, author:authors(*))').eq('id_tag', params?.id);

  if (error) {
    return {
      notFound: true,
    };
  }

  const posts = data?.map(item => ({ ...item.post, tags: [item.tag] }));

  return {
    props: {
      posts,
      tag: data?.[0].tag,
    },
  };
}
