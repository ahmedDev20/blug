import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import { MdBookmark, MdBookmarkBorder, MdChatBubbleOutline } from 'react-icons/md';
import { ILike, IPost, IBookmark } from '../lib/types';
import supabase from '../lib/supabase';
import ReactTooltip from 'react-tooltip';
import { useUser } from '@supabase/auth-helpers-react';
import Link from 'next/link';

interface Props {
  postId: number;
}

export default function Reactions({ postId }: Props) {
  const user = useUser();
  const [liked, setLiked] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [hasComments, setHasComments] = useState(false);
  const [likes, setLikes] = useState<number>(0);

  const fetchReactions = useCallback(async () => {
    const { data, error } = await supabase.from('posts').select('*, likes:likes(*), bookmarks:bookmarks(*), comments:comments(*)').eq('id', postId).single();

    if (error) {
      setLiked(false);
      setBookmarked(false);
      setLikes(0);
      setHasComments(false);
    }

    setLiked(data?.likes.some((like: ILike) => like.author_id === user?.id));
    setBookmarked(data?.bookmarks.some((bookmark: IBookmark) => bookmark.author_id === user?.id));
    setLikes(data?.likes.length);
    setHasComments(data?.comments.length > 0);
  }, [postId, user?.id]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const onPostLike = async () => {
    if (!user)
      return toast(
        t => (
          <div>
            <p>You must be logged in to like a post</p>

            <Link className="bg-purple-400" href="/login">
              Go login
            </Link>
          </div>
        ),
        { icon: '⚠' },
      );

    setLikes(likes + 1);
    setLiked(true);

    const { error } = await supabase.from('likes').insert({ post_id: postId, author_id: user?.id });

    if (error) {
      setLikes(likes => likes - 1);
      setLiked(false);
    }
  };

  const onPostDislike = async () => {
    setLikes(likes - 1);
    setLiked(false);

    const { error } = await supabase.from('likes').delete().match({ post_id: postId, author_id: user?.id });

    if (error) {
      setLikes(likes => likes + 1);
      setLiked(true);
    }
  };

  const onPostBookmark = async () => {
    if (!user) return toast('You must be logged in to save a post', { icon: '⚠' });

    setBookmarked(true);

    const { error } = await supabase.from('bookmarks').insert({ post_id: postId, author_id: user?.id });

    if (error) {
      setBookmarked(false);
    }
  };

  const onPostUnbookmark = async () => {
    setBookmarked(false);

    const { error } = await supabase.from('bookmarks').delete().match({ post_id: postId, author_id: user?.id });

    if (error) {
      setBookmarked(true);
    }
  };

  return (
    <div className="fixed z-10 bg-gray-200 dark:bg-slate-900 dark:md:bg-transparent md:bg-transparent md:shadow-none shadow-xl left-0 bottom-0 w-full md:w-fit p-4 flex px-4 gap-8 justify-evenly md:h-1/4 md:relative md:flex-col">
      <button className="flex space-x-2 items-center cursor-default md:flex-col md:space-x-0">
        {liked ? (
          <IoMdHeart onClick={onPostDislike} data-tip="Dislike" className="text-4xl text-red-500 focus:outline-none hover:cursor-pointer" />
        ) : (
          <IoMdHeartEmpty
            onClick={onPostLike}
            data-tip="Like"
            className="text-4xl hover:text-red-500 focus:outline-none transition-colors hover:cursor-pointer"
          />
        )}
        <span className="text-xl">{likes}</span>
      </button>

      <button className="flex space-x-2 items-center cursor-default md:flex-col md:space-x-0" data-tip={`${bookmarked ? 'Remove' : 'Save'}`}>
        {bookmarked ? (
          <MdBookmark onClick={onPostUnbookmark} className="text-4xl focus:outline-none text-blue-500 cursor-pointer" />
        ) : (
          <MdBookmarkBorder onClick={onPostBookmark} className="text-4xl focus:outline-none hover:text-blue-500 transition-colors cursor-pointer" />
        )}
        <span className="text-xs font-bold">{bookmarked ? 'Saved' : ''}</span>
      </button>

      {hasComments && (
        <a href="#comments" data-tip="Go to comments">
          <MdChatBubbleOutline className="text-4xl hover:text-orange-500 transition-colors hover:cursor-pointer" />
        </a>
      )}

      <ReactTooltip place="bottom" type="light" effect="solid" delayShow={300} delayHide={300} arrowColor="transparent" padding="8px" className="font-bold" />
    </div>
  );
}
