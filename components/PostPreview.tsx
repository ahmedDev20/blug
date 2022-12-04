import Link from 'next/link';
import { IPost, ITag } from '../lib/models';
import { Tag } from './Tag';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  post: IPost;
}

export const PostPreview = ({ post }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-800 shadow-md">
      <Link key={post.id} href={`/posts/${post.slug}`}>
        <a href={`/posts/${post.slug}`}>
          <Image
            className={`h-60 cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${
              isLoading ? 'grayscale blur-2xl scale-110' : 'grayscale-0 blur-0 scale-100'
            }`}
            width={400}
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
                <Link href={`/authors/${post.author.id}`}>
                  <a href={`/authors/${post.author.id}`} className="underline">
                    {post.author?.name || post.author?.username}
                  </a>
                </Link>
              </span>
            </p>
          </div>

          <Link href={`/authors/${post.author.id}`}>
            <a href={`/authors/${post.author.id}`} className="overflow-hidden rounded-full w-12 h-12 relative">
              <Image
                layout="fill"
                className="hover:scale-110 transition-transform duration-200 ease-in-out"
                src={post.author?.avatar_url}
                alt={post.author?.name}
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
  );
};
