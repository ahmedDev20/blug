import { FC, useState } from 'react';
import { IComment, IPost } from '../lib/models';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@supabase/auth-helpers-react';
import { useForm, SubmitHandler } from 'react-hook-form';

import toast from 'react-hot-toast';
import { Loading } from './Loading';
import supabase from '../lib/supabase';

interface IFormInput {
  name: string;
  comment: string;
}

interface Props {
  post: IPost;
}

const Comments: FC<Props> = ({ post }) => {
  const user = useUser();
  const [comments, setComments] = useState<IComment[]>(post.comments);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<IFormInput>();

  const onComment: SubmitHandler<IFormInput> = async data => {
    const { comment } = data;

    try {
      setSubmitted(true);

      const newComment: IComment = {
        comment,
        author_id: user?.id,
        post_id: post.id,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('comments').insert(newComment);

      if (error) throw error;

      newComment.author = {
        id: user?.id,
        name: user?.user_metadata.full_name,
        username: user?.user_metadata.user_name,
        avatar_url: user?.user_metadata.avatar_url,
      };

      setComments([newComment, ...comments]);
      toast.success('Comment submitted.');

      resetForm();
    } catch (error) {
      toast.error('Something happend.');
    } finally {
      setSubmitted(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <hr className="max-w-md md:max-w-lg my-10 mx-auto border-yellow-500" />
      <form id="comments" onSubmit={handleSubmit(onComment)} className="flex flex-col px-5 max-w-2xl mx-auto mb-10">
        <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
        <h4 className="text-3xl font-bold">Leave a comment below!</h4>
        <hr className="py-3 mt-2" />

        <label htmlFor="comment" className="bloack">
          <textarea
            {...register('comment', { required: true })}
            id="comment"
            placeholder="Your comment"
            rows={8}
            className="shadow outline-none border rounded py-2 px-3 form-textarea mt-1 resize-none block w-full focus:ring-1 ring-yellow-500"
          />
        </label>

        <div className="flex flex-col my-3">
          {errors.name && <span className="text-red-500">Please enter your name</span>}
          {errors.comment && <span className="text-red-500">Please enter a comment</span>}
        </div>

        <button
          className="shadow bg-yellow-500 flex items-center justify-center disabled:cursor-auto disabled:pointer-events-none hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
          disabled={submitted}
        >
          {submitted ? <Loading label="Submitting..." /> : 'Submit'}
        </button>
      </form>

      {comments?.length > 0 && (
        <div className="flex flex-col p-5 my-10 max-w-2xl mx-auto">
          <h3 className="text-4xl pb-2">Comments</h3>

          <div className="mt-2 space-y-6">
            {comments.map((comment: IComment) => (
              <Comment key={comment.created_at} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const Comment: FC<{ comment: IComment }> = ({ comment }) => {
  return (
    <div key={comment.created_at} className="bg-white border rounded shadow py-3 px-5 dark:bg-transparent">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <Link href={`/authors/${comment.author?.username}`}>
            <a href={`/authors/${comment.author?.username}`} className="overflow-hidden rounded-full w-10 h-10">
              <Image
                width={40}
                height={40}
                className="hover:scale-110 transition-transform duration-200 ease-in-out"
                src={comment?.author?.avatar_url || ''}
                alt={comment?.author?.name}
              />
            </a>
          </Link>

          <Link href={`/authors/${comment.author?.username}`}>
            <a href={`/authors/${comment.author?.username}`} className="underline text-yellow-500">
              {comment.author?.name || comment.author?.username}
            </a>
          </Link>
        </div>

        <span className="text-xs text-gray-600 font-extralight dark:text-white">{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>

      <p className="text-lg">{comment.comment}</p>
    </div>
  );
};

export default Comments;
