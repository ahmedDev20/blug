import { IPost } from '../lib/models';

interface Props {
  posts: [IPost];
}

export default function Settings(props: Props) {
  return (
    <section className="max-w-5xl mx-auto">
      <p className="text-xl">Coming soon...</p>
    </section>
  );
}
