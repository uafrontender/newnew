import type { NextApiRequest, NextApiResponse } from 'next';
import { newnewapi } from 'newnew-api';

type User = Omit<newnewapi.User, 'toJSON'>;

const users: User[] = [
  {
    uuid: '12345',
    username: 'johndoe12345',
    displayName: 'John',
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
    displayName: 'UnicornBabe',
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
    displayName: 'SugarDaddy',
    avatarUrl: 'https://randomuser.me/api/portraits/men/19.jpg',
    bio: '',
    coverUrl: '/images/mock/profile-bg.png',
    options: {
      isCreator: false,
      isVerified: true,
    },
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Uint8Array | any>,
): any {
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

    const resBytes = newnewapi.User
      .encode(user).finish();

    res.send(resBytes);
    return;
  }

  res.status(400).send('');
}
