import { NextPage } from 'next';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

type Props = {
  children: ReactNode;
};

const Layout: NextPage<Props> = props => {
  return (
    <>
      <main className="container">{props.children}</main>
      <Toaster position="top-right" />
    </>
  );
};

export default Layout;
