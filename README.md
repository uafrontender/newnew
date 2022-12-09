This is a NewNew web

## Getting Started

First, run the development server:

Use node v14

```bash
nvm install 16.14.2
# optionally make it a default version
nvm alias default 16
```

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed
on [http://localhost:4000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited
in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated
as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Development

### newnew api

We import a package from a gitlab repo and select a specific version by its commit hash
If you need to update a version of the package, just change the commit hash in `package.json`
And run `npm install`

### Tools we use

VSCode. We use this code editor in order to have the same set of tools available to us.
Prettier - Code formatter. With projects vs code settings this extension will format the code on each save.
ESLint - runs in pre-commit sequence. Will find issues with the code style, which can indicate an error.

We should improve our tools and their configuration over time. For example we can add more rules to eslint.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use
the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Tests

We use cypress tests that run locally and on CI pipeline. to run tests use `npm run cypress` command. After a test you can find a video of it running in `cypress/video` folder. In order to see test running in browser use `npm run cypress:open` command.
