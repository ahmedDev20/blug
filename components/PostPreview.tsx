import Link from 'next/link';
import { IPost, ITag } from '../lib/types';
import { Tag } from './Tag';
import Image from 'next/image';
import { useState } from 'react';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';
import { IoMdTrash } from 'react-icons/io';
import { Dialog } from './shared/Dialog';
import { useRouter } from 'next/router';

interface Props {
  post: IPost;
  canBeDeleted?: boolean;
}

export const PostPreview = ({ post, canBeDeleted }: Props) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deletePost = async (id: number) => {
    setIsDialogOpen(false);
    const { error } = await supabase.from('posts').delete().match({ id });

    if (error) return toast.error('Error deleting post');

    router.replace(router.asPath);
    toast.success('Post deleted');
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-md relative">
        {canBeDeleted && (
          <button
            className="absolute top-2 right-2 z-10 p-2 rounded-md bg-red-500 hover:bg-red-800 transition-colors duration-200 ease-in-out"
            onClick={() => setIsDialogOpen(true)}
          >
            <IoMdTrash className="text-xl text-white" />
          </button>
        )}

        <Link key={post.id} href={`/posts/${post.slug}`}>
          <a>
            <Image
              className={`h-60 cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${
                isLoading ? 'grayscale blur-2xl scale-110' : 'grayscale-0 blur-0 scale-100'
              }`}
              width={500}
              height={240}
              src={post.coverUrl}
              alt={post.slug}
              objectFit="cover"
              onLoadingComplete={() => setIsLoading(false)}
            />
          </a>
        </Link>

        <div className="p-5">
          <div className="flex justify-between">
            <div>
              <p className="text-lg font-bold">{post.title}</p>
              <p className="text-xs">
                By{' '}
                <span>
                  <Link href={`/authors/${post?.author?.username}`}>
                    <a href={`/authors/${post?.author?.username}`} className="underline">
                      {post?.author?.name || post?.author?.username}
                    </a>
                  </Link>
                </span>
              </p>
            </div>

            <Link href={`/authors/${post?.author?.username}`}>
              <a href={`/authors/${post?.author?.username}`} className="overflow-hidden rounded-full w-12 h-12 relative">
                <Image
                  layout="fill"
                  className="hover:scale-110 transition-transform duration-200 ease-in-out"
                  src={post?.author?.avatar_url}
                  alt={post?.author?.name || post?.author?.username}
                />
              </a>
            </Link>
          </div>

          <ul className="flex items-center flex-wrap gap-2 mt-3">
            {post?.tags?.map((tag: ITag) => (
              <Link key={tag.id} href={`/tag/${tag.id}`} passHref={true}>
                <Tag tag={tag} />
              </Link>
            ))}
          </ul>
        </div>
      </div>

      <Dialog
        title="Are you sure you want to delete this post?"
        isOpen={isDialogOpen}
        onDelete={() => deletePost(post.id)}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};
