export interface IPost {
  id: number;
  created_at: string;
  title: string;
  slug: string;
  markdown: string;
  coverUrl: string;
  tags: [ITag];
  author: IAuthor;
  comments: [IComment];
  bookmarks: [IBookmark];
  likes: [ILike];
}

export interface IAuthor {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  created_at: string;
}

export interface IComment {
  id: number;
  name: string;
  comment: string;
  created_at: string;
  avatar_url: string;
}

export interface ITag {
  id: number;
  name: string;
  description: string;
}

export interface ILike {
  id: number;
  post_id: number;
  author_id: string;
  created_at: string;
}

export interface IBookmark {
  id: number;
  author_id: string;
  post_id: number;
  created_at: string;
  post: IPost;
}
