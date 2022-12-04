import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { PostPreview } from '../../components/PostPreview';
import { IAuthor, IPost } from '../../lib/models';
import { MdCake } from 'react-icons/md';
import Image from 'next/image';
import { IoLogoGithub } from 'react-icons/io';

interface Props {
  posts: [IPost];
  author: IAuthor;
}

const Profile: NextPage<Props> = ({ posts, author }) => {
  return (
    <>
      <Head>
        <title>{author?.name}</title>
      </Head>

      <section className="max-w-5xl mx-auto px-5">
        <div className="flex flex-col items-center">
          <Image height={80} width={80} className="rounded-full object-cover" src={author?.avatar_url} alt="avatar" />

          <h1 className="text-2xl font-bold mt-2">{author?.name || author?.username}</h1>

          <div className="flex items-center mt-2 space-x-2 ">
            <MdCake className="text-2xl" />
            <p>
              Joined on
              <span className="ml-1">
                {new Date(author?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>

            <a href={`https://github.com/${author.username}`} target="_blank" rel="noreferrer noopener">
              <IoLogoGithub className="text-2xl hover:fill-purple-500 cursor-pointer transition-colors" />
            </a>
          </div>
        </div>

        <hr className="mt-5  border-black dark:border-gray-100" />

        <h1 className="text-3xl  font-bold mt-4">Posts</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-3">
          {posts.length > 0 ? posts?.map(post => <PostPreview key={post.id} post={post} />) : <p>You have no posts, go and create one ;)</p>}
        </div>
      </section>

      <Toaster />
    </>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async (context, supabaseClient) => {
    const { data: posts, error } = await supabaseClient
      .from('posts')
      .select('*, author:authors(*), tags:posts_tags(tags(*))')
      .eq('author_id', context.params?.username);

    const { data: authorsData, error: authorError } = await supabaseClient.from('authors').select('*').eq('id', context.params?.username);

    if (error || authorError) {
      return {
        notFound: true,
      };
    }

    const [author] = authorsData;

    return {
      props: {
        posts: posts.map(post => ({ ...post, tags: post.tags.map((tag: any) => tag.tags) })),
        author,
      },
    };
  },
});
