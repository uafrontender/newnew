// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<any>,
): Promise<any> => {
  if (req.method === 'POST') {
    try {
      const filePath = path.join(
        process.cwd(),
        '/public/pushPackage.zip',
      );

      const readStream = fs.createReadStream(filePath);

      return readStream.pipe(res);
    } catch (err) {
      console.log(err, 'err');
      return res.status(400)
        .json((err as any).error);
    }
  }

  return res.status(400)
    .send('Invalid method or body');
};

export default handler;
