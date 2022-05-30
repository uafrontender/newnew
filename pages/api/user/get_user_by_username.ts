import type { NextApiRequest, NextApiResponse } from 'next';
import { newnewapi } from 'newnew-api';
import { withSentry } from '@sentry/nextjs';

type User = Omit<newnewapi.User, 'toJSON'>;

const users: User[] = [
  {
    uuid: '12345',
    username: 'johndoe12345',
    nickname: 'John',
    avatarUrl: 'https://randomuser.me/api/portraits/women/21.jpg',
    bio: '',
    coverUrl: '/images/mock/profile-bg.png',
    options: {
      isCreator: false,
    },
  },
  {
    uuid: '1',
    username: 'unicornbabe',
    nickname: 'UnicornBabe',
    avatarUrl: 'https://randomuser.me/api/portraits/women/34.jpg',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    coverUrl: '/images/mock/profile-bg.png',
    options: {
      isCreator: true,
      isVerified: true,
    },
  },
  {
    uuid: '2',
    username: '0xa463sugardaddy8080',
    nickname: 'SugarDaddy',
    avatarUrl: 'https://randomuser.me/api/portraits/men/19.jpg',
    bio: '',
    coverUrl: '/images/mock/profile-bg.png',
    options: {
      isCreator: false,
      isVerified: true,
    },
  },
];

const handler = (
  req: NextApiRequest,
  res: NextApiResponse<Uint8Array | any>
): any => {
  if (req.method === 'GET') {
    const { username } = req.query;
    if (!username) {
      res.status(400).send('');
      return;
    }

    const user = users.find((u) => u.username === username);

    if (!user) {
      res.status(400).send('');
      return;
    }

    const resBytes = newnewapi.User.encode(user).finish();

    res.send(resBytes);
    return;
  }

  res.status(400).send('');
};

export default withSentry(handler);
