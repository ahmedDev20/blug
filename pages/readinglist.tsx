import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { MdBookmarkBorder } from 'react-icons/md';
import { PostPreview } from '../components/PostPreview';
import { IBookmark, ITag } from '../lib/types';

interface Props {
  bookmarks: [IBookmark];
}

const ReadingList: NextPage<Props> = ({ bookmarks }) => {
  return (
    <>
      <Head>
        <title>Reading List - Blug</title>
      </Head>

      <section className="max-w-7xl mx-auto px-2 md:px-0">
        <h1 className="text-3xl font-bold mt-4 mb-5">Reading List ({bookmarks.length} posts)</h1>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {bookmarks?.map((bookmark: IBookmark) => (
              <PostPreview key={bookmark.id} post={bookmark.post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-start mt-5 md:mt-24 md:items-center">
            <h4 className="text-xl font-semibold">Your reading list is empty</h4>
            <div className="flex flex-wrap text-left items-center mt-2">
              <p className="md:text-md font-light">Click the bookmark reaction</p>
              <MdBookmarkBorder className="text-3xl" />
              <p className="md:text-md font-light">when viewing a post to add it to your reading list.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default ReadingList;

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async (_, supabaseClient) => {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    let bookmarks = [];
    const { error, data } = await supabaseClient
      .from('bookmarks')
      .select('*, post:posts(*, author:authors(*), tags:posts_tags(tags(*)))')
      .eq('author_id', user?.id);

    if (error) {
      return {
        notFound: true,
      };
    }

    bookmarks = data.map((bookmark: any) => {
      bookmark.post.tags = bookmark.post.tags.map((e: any) => e.tags) as [ITag];
      return bookmark;
    });

    return {
      props: {
        bookmarks,
      },
    };
  },
});
