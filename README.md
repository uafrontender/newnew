This is a NewNew web

## Getting Started

First, run the development server:

Use node v16

```bash
nvm install 16.16.0
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

If you want to know what use cases are covered and what exactly tests do:

- Run tests and see the video
- Run tests and read the names of tests suits
- Use `testSeed` to find posts and users created by the test on dev server

### Test work arounds

- Test accounts can be used to avoid the need to get the actual verification code. Accounts with a template: `test_user_{number}@newnew.co` and `test_creator_{number}@newnew.co` will allow to sign-un/sign/up with a `111111` code every time.
- Creator test account (`test_creator_{number}@newnew.co`) starts with a cypress onboarding finished flag, which allows to see earnings on the dashboard.
- In order to avoid time constraints of the post life cycle, on dev server creator can finish own post with an API Protobuf call to `https://api-dev.newnew.co/v1/dev/update_post_internal_fields?post_uuid={shortPostId}` with `EmptyRequest` payload, `x-auth-token` header with a value of creators access token. Post ends in a natural way (as if its time ran out)
- In order to avoid tests being blocked by bot protection, all bot protection features has been disabled on dev server and FE server used during the test.
- Tutorials ahs been disabled during the test using a manipulation with `userTutorialsProgress` field in localStorage.
- In order to simplify payment card with a number of `5200828282828210` can be used on dev server without any restrictions, beside the number itself, all data provided can be any valid value.

## Sms Notifications

Currently (12/21/2022) they are partially done. One phone number only works for one account

### Replying from outside US

This can be problematic. Send messages to +13103402606

### Free phone number

In order to free the phone number you can send `RM` text command to the Twilio number.
This will remove it from our DB, thus you can re-run the flow on any account.
Then you can use it again. In case nothing comes, try sending `YES` message to Twilio number.
In case you replied with `STOP` you have to reply with `START` before proceeding
