// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
): Promise<any> => {
  if (req.method === 'POST') {
    try {
      const filePath = path.join(
        process.cwd(),
        '/public/pushPackage1663261361.zip'
      );

      console.log(filePath, 'filePath');

      const stat = fs.statSync(filePath);

      const fileName = 'pushPackage.zip';
      const fileType = 'application/zip';

      res.writeHead(200, {
        'Content-Type': fileType,
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': stat.size,
      });

      const readStream = fs.createReadStream(filePath);

      await new Promise((resolve) => {
        console.log('HERE');
        readStream.pipe(res);
        readStream.on('end', resolve);
      });
    } catch (err) {
      console.log(err, 'err');
      // return res.status(400).json((err as any).error);
    }
  }
  // return res.status(400).send('Invalid method or body');
};

export default handler;
