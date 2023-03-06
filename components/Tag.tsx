import React from 'react';
import { ITag } from '../lib/types';

interface Props {
  tag: ITag;
  href?: string;
}

export const Tag = React.forwardRef(({ tag, href }: Props, _) => {
  return (
    <a href={href}>
      <li className="hover:cursor-pointer">
        <span style={{ backgroundColor: tag.color }} className={`px-2 py-1 flex items-center rounded-md text-white hover:opacity-70 transition-all`}>
          #{tag.name}
        </span>
      </li>
    </a>
  );
});

Tag.displayName = 'Tag';
