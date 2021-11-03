// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { newnewapi } from 'newnew-api';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Uint8Array | any>,
): any {
  if (req.method === 'POST') {
    const resBytes = newnewapi.SignInResponse
      .encode({
        status: newnewapi.SignInResponse.Status.SUCCESS,
      }).finish();

    res.send(resBytes);
  }

  res.status(400).send('');
}
