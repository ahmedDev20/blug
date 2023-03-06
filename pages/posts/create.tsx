import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { ChangeEvent, FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import supabase, { COVERS_BUCKET_ID } from '../../lib/supabase';
import Image from 'next/image';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { Loading } from '../../components/shared/Loading';
import { ITag } from '../../lib/types';
import { IoIosClose } from 'react-icons/io';
import { useOnClickOutside } from 'usehooks-ts';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false, loading: () => <Loading label="Loading editor..." color="purple" /> });

interface Props {
  tags: [ITag];
}

const Create: NextPage<Props> = ({ tags }) => {
  const { session } = useSessionContext();
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [markdown, setMarkdown] = useState<string | undefined>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverName, setCoverName] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string | undefined>('');
  const [isCoverUploading, setIsCoverUploading] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [tagSearch, setTagSearch] = useState<string>('');
  const [tagsOpen, setTagsOpen] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<ITag[]>([]);
  const [initialTags, setInitialTags] = useState<ITag[] | []>(tags);
  const tagInputRef = useRef<HTMLInputElement | null>(null);
  const tagsListRef = useRef<HTMLUListElement | null>(null);
  useOnClickOutside(tagsListRef, () => setTagsOpen(false));

  const onTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = event.target;
    textarea.style.height = `auto`;
    textarea.style.height = `${textarea.scrollHeight}px`;
    setTitle(textarea.value);
  };

  const onCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (coverUrl) {
      setCoverUrl('');
      setCoverFile(null);
      setCoverName('');
    }

    if (!event.target.files?.length) return;

    const file = event.target.files?.[0];
    setCoverFile(file);
    setCoverName(`${Date.now()}_${file.name}`);
  };

  const uploadCover = useCallback(async () => {
    setIsCoverUploading(true);

    try {
      await supabase.storage.from(COVERS_BUCKET_ID).upload(coverName, coverFile!);
      const { data } = await supabase.storage.from(COVERS_BUCKET_ID).getPublicUrl(coverName);

      setCoverUrl(data.publicUrl);
    } catch (error) {
      toast.error('Sorry, something happend.');
    } finally {
      setIsCoverUploading(false);
    }
  }, [coverFile, coverName]);

  const onDeleteCover = async () => {
    setCoverFile(null);
    setCoverUrl('');

    const { error } = await supabase.storage.from(COVERS_BUCKET_ID).remove([coverName]);
    if (error) throw error;

    setCoverName('');
  };

  const onPublish = async (event: FormEvent) => {
    event.preventDefault();

    if (!coverUrl) return toast.error('Please choose a cover.');
    if (!title) return toast.error('Please enter a title.');
    if (!selectedTags.length) return toast.error('Please choose at least one tag.');
    if (!markdown) return toast.error('Please add some content.');

    try {
      const slug = title?.trim().toLowerCase().replace(/\s+/g, '-').replace('?', '').concat(`-${Date.now()}`);

      setIsPublishing(true);

      const { error: err1, data } = await supabase
        .from('posts')
        .insert({
          title,
          slug,
          author_id: session?.user?.id,
          markdown,
          coverUrl,
        })
        .select();

      if (err1) throw err1;

      const id_post = data[0].id;

      const { error: err2 } = await supabase.from('posts_tags').insert(
        selectedTags.map(t => ({
          id_post,
          id_tag: t.id,
        })),
      );

      if (err2) throw err2;

      toast.success('Post created!');

      router.push(`/posts/${slug}`);
    } catch (error) {
      toast.error('Sorry, something happend.');
    } finally {
      setIsPublishing(false);
    }
  };

  const onAddTag = (tag: ITag) => {
    if (selectedTags.length >= 4) return toast('You can only add up to 4 tags.', { icon: '⚠' });

    setSelectedTags([...selectedTags, tag]);
    setInitialTags(initialTags.filter(t => t != tag));
    setTagSearch('');
    tagInputRef?.current?.focus();
  };

  const onRemoveTag = (tag: ITag) => {
    setSelectedTags(selectedTags.filter(t => t != tag));
    setInitialTags([...initialTags, tag]);
    tagInputRef?.current?.focus();
  };

  const onTagSearch = useCallback(
    (term: string) => {
      if (!term) return setInitialTags(tags.filter(t => !selectedTags.includes(t)));

      setInitialTags(initialTags.filter(tag => tag.name.includes(term.trim())));
    },
    [selectedTags, tags, initialTags],
  );

  useEffect(() => {
    if (coverFile && !coverUrl) uploadCover();
  }, [coverFile, coverUrl, uploadCover]);

  useEffect(() => {
    onTagSearch(tagSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagSearch]);

  return (
    <>
      <Head>
        <title>New post - Blug</title>
      </Head>

      <section className="max-w-7xl mx-auto px-2 md:px-0">
        <h1 className="text-3xl font-bold">Create a new post</h1>

        <form onSubmit={onPublish} className="border rounded-lg px-4 md:px-12 py-8 mt-4 bg-white dark:bg-transparent">
          <div className="flex space-x-3 mb-3">
            {isCoverUploading && <Loading label="Uploading..." color="rebeccapurple" />}

            {coverUrl && (
              <div className="border-2 rounded-sm overflow-hidden h-[200px] w-[300px]">
                <Image
                  src={coverUrl}
                  onError={() => toast.error("Sorry, we couldn't load the cover. Please try again.")}
                  width={300}
                  height={200}
                  alt={coverFile?.name!}
                />
              </div>
            )}

            {!isCoverUploading && (
              <div className="flex flex-col justify-evenly">
                <label htmlFor="cover" className="relative text-center cursor-pointer px-3 py-2 border-2 border-[#c0c7cb] rounded-lg font-semibold">
                  {coverUrl ? 'Change' : 'Add a cover image'}
                  <input
                    className="invisible absolute w-full h-full"
                    id="cover"
                    accept=".jpg, .jpeg, .png, .gif"
                    type="file"
                    name="cover"
                    onChange={onCoverChange}
                  />
                </label>

                {coverUrl && (
                  <button onClick={onDeleteCover} className="relative px-3 py-2 border-2 border-red-400 text-red-500 rounded-lg font-semibold">
                    Delete cover
                  </button>
                )}
              </div>
            )}
          </div>

          <textarea
            className="block outline-none text-xl md:text-3xl resize-none w-full font-extrabold placeholder:font-extrabold placeholder:text-gray-500 dark:placeholder:text-gray-300 dark:bg-transparent"
            onInput={onTitleChange}
            value={title}
            placeholder="New post title here..."
          ></textarea>

          <div className="mb-7">
            <div className="flex items-center">
              <div className="flex">
                {selectedTags &&
                  selectedTags.map(tag => (
                    <span key={tag.id} className="px-2 py-1 flex items-center rounded-md text-white bg-purple-600 mr-2">
                      #{tag.name} <IoIosClose className="text-2xl hover:text-red-600 hover:cursor-pointer" onClick={() => onRemoveTag(tag)} />
                    </span>
                  ))}
              </div>

              <input
                ref={tagInputRef}
                type="text"
                className="outline-none w-full dark:bg-transparent"
                onFocus={() => setTagsOpen(true)}
                onChange={e => setTagSearch(e.target.value)}
                value={tagSearch}
                placeholder="Add up to 4 tags..."
              />
            </div>

            {tagsOpen && (
              <ul
                ref={tagsListRef}
                className="w-full mt-2 space-y-3 shadow-md bg-gray-100 rounded-md dark:bg-slate-800 max-h-52 overflow-y-auto scrollbar-thumb-gray-400 scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-track-gray-200"
              >
                {initialTags.map(tag => (
                  <li
                    key={tag.id}
                    className="hover:bg-gray-100 p-2 transition-all ease-in-out cursor-pointer dark:hover:text-slate-900"
                    onClick={() => onAddTag(tag)}
                  >
                    <h4 style={{ color: tag.color }}>#{tag.name}</h4>
                    <p className="max-h-10 overflow-hidden whitespace-nowrap text-ellipsis">{tag.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <MDEditor value={markdown} autoFocus height={400} visibleDragbar={false} onChange={val => setMarkdown(val)} />

          <button disabled={isPublishing} className="bg-purple-600 px-4 py-2 mt-4 rounded-md text-white">
            {isPublishing ? <Loading label="Publishing..." /> : 'Publish'}
          </button>
        </form>
      </section>
    </>
  );
};

export default Create;

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async _ => {
    const { data: tags } = await supabase.from('tags').select();

    return {
      props: {
        tags,
      },
    };
  },
});
