import { FC, useState } from 'react';
import { IPost, ITag } from '../lib/types';
import Image from 'next/image';
import Link from 'next/link';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tag } from './Tag';
import { formatDate } from '../lib/date-formatter';

interface Props {
  post: IPost;
}

const Post: FC<Props> = ({ post }) => {
  return (
    <div className="flex-2 rounded-none md:rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-md">
      <Image width={1000} height={500} className="object-cover w-full bg-white scale-[1.01]" src={post.coverUrl} alt={post.slug} />

      <article className="px-2 md:px-5 py-3">
        <h1 className="text-5xl mb-3">{post.title}</h1>

        <ul className="flex items-center space-x-2 mb-3">
          {post?.tags?.map((tag: ITag) => (
            <Link key={tag.id} href={`/tag/${tag.id}`} passHref>
              <Tag tag={tag} />
            </Link>
          ))}
        </ul>

        <div className="flex items-center space-x-2 mt-5">
          <Link href={`/authors/${post.author?.username}`}>
            <a className="overflow-hidden rounded-full w-12 h-12">
              <Image
                height={48}
                width={48}
                className="hover:scale-110 transition-transform duration-200 ease-in-out"
                src={post.author?.avatar_url}
                alt={post.author?.name}
              />
            </a>
          </Link>

          <p className="font-extralight text-sm">
            Blog post by{' '}
            <Link href={`/authors/${post.author?.username}`}>
              <a className="underline">
                <span className="text-green-600 underline cursor-pointer">{post.author?.name || post.author?.username}</span>
              </a>
            </Link>{' '}
            - published {formatDate(post.created_at)}
          </p>
        </div>

        <div className="mt-3 markdown dark:markdown-dark">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter style={atomDark as any} language={match[1]} PreTag="div" {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {post.markdown}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
};

export default Post;
