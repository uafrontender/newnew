// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<any>
): Promise<any> => {
  const body = JSON.parse(req.body)
  const { recaptchaToken } = body;

  if (req.method === 'POST' && recaptchaToken) {
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    try {
      const recaptchaRes = await fetch(verifyUrl, { method: 'POST' });

      const recaptchaJson = await recaptchaRes.json();

      return res.status(200).json({ ...recaptchaJson });
    } catch (err) {
      return res.status(400).json((err as any).error);
    }
  }
  return res.status(400).send('Invalid method or body');
};

export default handler;
