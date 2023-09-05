import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { PostPreview } from '../../components/PostPreview';
import { IAuthor, IPost } from '../../lib/types';
import { MdCake } from 'react-icons/md';
import Image from 'next/image';
import { IoLogoGithub } from 'react-icons/io';
import { FiEdit2 } from 'react-icons/fi';
import supabase, { AVATARS_BUCKET_ID } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { ChangeEvent, useRef, useState } from 'react';

interface Props {
  posts: [IPost];
}

const Profile: NextPage<Props> = ({ posts }) => {
  const author: IAuthor = posts[0].author;
  const [avatar, setAvatar] = useState(author.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];

    let uploadToastId;
    try {
      uploadToastId = toast.loading('Uploading avatar...');

      await supabase.storage.from(AVATARS_BUCKET_ID).upload(file.name, file);
      const publicUrlResponse = await supabase.storage.from(AVATARS_BUCKET_ID).getPublicUrl(file.name);

      const publicUrl = publicUrlResponse.data.publicUrl;

      await supabase.from('authors').update({ avatar_url: publicUrl }).eq('id', author.id);

      setAvatar(publicUrl);

      toast.dismiss(uploadToastId);

      toast.success('Avatar updated.');
    } catch (error) {
      setAvatar(author.avatar_url || '');

      toast.dismiss(uploadToastId);

      toast.error('An error occurred while updating the avatar.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Head>
        <title>{author?.name}</title>
      </Head>

      <section className="max-w-5xl mx-auto px-5">
        <div className="flex flex-col items-center">
          <div
            className={`relative border-2 border-white h-36 w-36 bg-contain bg-center rounded-full overflow-hidden group`}
          >
            <div className="absolute bg-black opacity-60 w-full h-10 bottom-0 cursor-pointer transition-transform transform translate-y-full group-hover:translate-y-0">
              <label htmlFor="avatar" className="cursor-pointer w-full h-full flex items-center justify-center">
                <input
                  className="invisible absolute w-full h-full"
                  ref={fileInputRef}
                  accept=".jpg, .jpeg, .png, .gif"
                  id="avatar"
                  type="file"
                  onChange={updateAvatar}
                />
                <FiEdit2 className="text-white text-xl" />
              </label>
            </div>

            <div className="bg-cover h-full w-full" style={{ backgroundImage: `url('${avatar}')` }}></div>
          </div>

          <h1 className="text-2xl font-bold mt-2">{author?.name || author?.username}</h1>

          <div className="flex items-center mt-2 space-x-2">
            <MdCake className="text-2xl" />
            <p>
              Joined on
              <span className="ml-1">
                {author?.created_at &&
                  new Date(author?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </span>
            </p>

            <a href={`https://github.com/${author?.username}`} target="_blank" rel="noreferrer noopener">
              <IoLogoGithub className="text-2xl hover:fill-purple-500 cursor-pointer transition-colors" />
            </a>
          </div>
        </div>

        <hr className="mt-5  border-slate-900 dark:border-gray-100" />

        <h1 className="text-3xl  font-bold mt-4">Posts</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-3">
          {posts.length > 0 ? (
            posts?.map(post => <PostPreview key={post.id} post={post} />)
          ) : (
            <p>You have no posts, go and create one.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async (context, supabaseClient) => {
    const { data: author, error: authorError } = await supabaseClient
      .from('authors')
      .select('*')
      .eq('username', context.params?.username)
      .single();
    const { data, error } = await supabaseClient
      .from('posts')
      .select('*, author:authors(*), tags:posts_tags(tags(*))')
      .eq('author_id', author?.id);

    if (error || authorError) {
      return {
        notFound: true,
      };
    }

    const posts = data?.map(post => ({ ...post, tags: post.tags.map((tag: any) => tag.tags) }));

    return {
      props: {
        posts,
      },
    };
  },
});
