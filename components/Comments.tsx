import { FC } from 'react';
import { IPost } from '../lib/models';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  post: IPost;
}

const Comments: FC<Props> = ({ post }) => {
  return (
    <>
      {post.comments?.length > 0 && (
        <div className="flex flex-col p-5 my-10 max-w-2xl mx-auto">
          <h3 className="text-4xl pb-2">Comments</h3>

          <div className="mt-2 space-y-6">
            {post.comments.map(comment => (
              <div key={comment.id} className="bg-white border rounded shadow py-3 px-5 dark:bg-transparent">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Link href={`/authors/${post.author.id}`}>
                      <a href={`/authors/${post.author.id}`} className="overflow-hidden rounded-full w-12 h-12">
                        <Image
                          height={48}
                          width={48}
                          className="hover:scale-110 transition-transform duration-200 ease-in-out"
                          src={comment.avatar_url}
                          alt={comment.name}
                        />
                      </a>
                    </Link>
                    <h4 className="text-yellow-500">{comment.name}</h4>
                  </div>

                  <span className="text-xs text-gray-600 font-extralight dark:text-white">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>

                <p>{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Comments;
