import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';
import supabase, { COVERS_BUCKET_ID } from '../../lib/supabase';
import Image from 'next/image';
import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { Loading } from '../../components/Loading';
import { ITag } from '../../lib/models';
import { IoIosClose } from 'react-icons/io';
import { useOnClickOutside } from 'usehooks-ts';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false, loading: () => <Loading label="Loading editor..." color="purple" /> });

const FALLBACK_COVER = 'https://bitsofco.de/content/images/2018/12/broken-1.png';

const dummyMarkdown = `
# Tu miscuit aetas

## Aegides media celeres

Lorem markdownum me nunc non Pelasgas lacerans silva,
[corpusque](http://ait.net/creditus-nitido) cernimus *Apolline* donisque
offensus Aethiopasque Alpes. Superis cetera inter et medullas angue, tu loca et
ales vetustas: inposita.

\`\`\`js
    if (san(remote) >= ddlDatabaseBoot(scsi_remote, 1, sram_frequency)) {
        serverFileTebibyte += camelcase_raw(database_net) - -1 * heapZif;
        laptopLogicDrop -= function_wimax;
    } else {
        passwordDigitize = gui_column_font + hdmi(printerMethodStack);
    }
    var rpc_virtual = thin_frequency_master;
    ssh += teraflops(spooling_scroll_installer, 1, 52 - 5) + leopard;
    var bootAdf = streaming(-4 + dvd - 4, -3, word);
\`\`\`
## Nitidique adventum interdum mihi sic habet membraque

Quem focus sanguine alieno spernenda sumere studiisque gladios, qui se venit.
Corpora *petis* sidera mihique graves Scylla exspatiemur poenas, stridores, ab
nec cum mutatus [mundi](http://qua-qua.net/pendentexspectatum): numen. Veros
lanient adest. Ille sine alimentaque unum; videt Cecropidae tempus, lustrabere,
alis defluit ab forte, quae ferebat praeside. Inlato nemus!

\`\`\`js
    var sqlStreaming = monitor;
    wpa = cellSamplingIteration;
    font -= motion + -1 + 2 - 5;
    if (error_rw_alert) {
        bluetoothFddiEncryption = memorySynActive;
    }
\`\`\`

## Est mori

Vidisse et scit vim adsueta Aeacon. Rabiem multo iam umoris imagine *violentam
non Persephones* causa ne, Lycaona sola *membra*. Nec tollite tantum: corpora
genus origo destruitis te nulla *vulnere rupit ipsa* ictus sceleris nullique.
Captabat mente, genibusque squalentia nymphen deo repugnas feriente medios
mentem cervix, excussit. **Raptaque artus Myrrhae**, ubi coegi classis auro.

\`\`\`js
    if (nat_digital(balancingHard(ajaxDrive, vectorNetmaskFilename +
            vle_integer), 4, hot_volume(parallel) * 874989)) {
        server_full_box.dvr_optical(optical, maskTrim);
    }
    tiff(3, dvdVaporwareSystem(-1, 3), halfSliOem);
    rw_iso_touchscreen(manet(client_cpl_twain / ascii, rte_flops_correction -
            drive));
    if (softwareSata + uddiDevice) {
        interpreterOpen += market(copyCore);
        commercialGigaflopsDefragment = 5 + configurationFormat - 2;
    }
\`\`\`
## Putares rursusque non Latonia est sentit ossibus

Tuum rupes canam adplicor penitus Neoptolemum pallentia animis? Formae viris
attulit Abantiades ostendit nam illum.

1. Sine per ego
2. Novissima morte perveni sibi urguet thymo pellis
3. Duae sed nec quatiens pulchros
4. In ignis muneraque maiores

Amplecti certa gratia orbe violenta iuvencis adimam. Et ora, succidere animi
erat principio, tuaeque ingentem gemellos Dorylas aliquis motuque! Sed voce, est
omnia, sine quae sinuataque; et habebat imitante.

`;

interface Props {
  tags: [ITag];
}

const Create: NextPage<Props> = ({ tags }) => {
  const { session } = useSessionContext();
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [markdown, setMarkdown] = useState<string | undefined>(dummyMarkdown);
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
      const slug = title?.trim().toLowerCase().replace(/\s+/g, '-').replace('?', '');

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
  }, [tagSearch]);

  return (
    <>
      <Head>
        <title>New post - Blug</title>
      </Head>

      <section className="max-w-5xl mx-auto px-5">
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
                  objectFit="cover"
                  alt={coverFile?.name}
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
            className="block outline-none text-xl md:text-4xl resize-none w-full font-extrabold placeholder:font-extrabold placeholder:text-[#525252] dark:placeholder:text-white dark:bg-transparent"
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
                className="w-full mt-2 space-y-3 shadow-md rounded-md dark:bg-slate-800 max-h-52 overflow-y-auto scrollbar-thumb-gray-400 scrollbar-thin scrollbar-thumb-rounded-xl scrollbar-track-gray-200"
              >
                {initialTags.map(tag => (
                  <li
                    key={tag.id}
                    className="hover:bg-gray-100 p-2 transition-all ease-in-out cursor-pointer dark:hover:text-slate-900"
                    onClick={() => onAddTag(tag)}
                  >
                    <h4 className="hover:text-purple-600">#{tag.name}</h4>
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

        <Toaster />
      </section>
    </>
  );
};

export default Create;

export const getServerSideProps: GetServerSideProps = withPageAuth({
  redirectTo: '/login',
  getServerSideProps: async context => {
    const { data: tags } = await supabase.from('tags').select();

    return {
      props: {
        tags,
      },
    };
  },
});
