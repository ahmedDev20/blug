import { FC, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { useRouter } from 'next/router';
import { IPost } from '../lib/models';
import toast, { Toaster } from 'react-hot-toast';
import { Loading } from './Loading';
import supabase from '../lib/supabase';

interface Props {
  post: IPost;
}

interface IFormInput {
  name: string;
  comment: string;
}

const CommentForm: FC<Props> = ({ post }) => {
  const user = useUser();
  const router = useRouter();
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

      const { error } = await supabase.from('comments').insert({
        name: user?.user_metadata?.name || 'Anonymous',
        comment,
        avatar_url: user?.user_metadata.avatar_url,
        post_id: post.id,
        post_slug: post.slug,
      });

      if (error) throw error;

      toast.success('Comment submitted.');

      resetForm();

      setTimeout(window.location.reload, 2000);
    } catch (error) {
      toast.error('Something happend.');
    } finally {
      setSubmitted(false);
    }
  };

  if (!user) return <p className="text-md dark:text-white">Please login to comment</p>;

  return (
    <>
      <hr className="max-w-md md:max-w-lg my-10 mx-auto border-yellow-500" />
      <form id="comments" onSubmit={handleSubmit(onComment)} className="flex flex-col px-5 max-w-2xl mx-auto mb-10">
        <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
        <h4 className="text-3xl font-bold">Leave a comment below!</h4>
        <hr className="py-3 mt-2" />

        <label htmlFor="comment" className="bloack">
          <span className="text-gray-700 dark:text-white">Comment</span>
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
    </>
  );
};

export default CommentForm;
