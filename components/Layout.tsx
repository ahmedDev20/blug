import { NextPage } from 'next';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Layout: NextPage<Props> = props => {
  return <main className="container">{props.children}</main>;
};

export default Layout;
