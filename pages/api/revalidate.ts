import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.REVALIDATION_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const path = req.body?.record?.post_slug || req.body?.old_record?.post_slug;

  if (!path) {
    return res.status(422).json({ message: 'Invalid request body' });
  }

  try {
    await res.revalidate(`/posts/${path}`);

    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
