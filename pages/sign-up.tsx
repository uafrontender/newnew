import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import type { GetServerSideProps, NextPage } from 'next';
import { motion } from 'framer-motion';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NextPageWithLayout } from './_app';
import AuthLayout from '../components/templates/AuthLayout';
import SignupMenu from '../components/organisms/SignupMenu';
import assets from '../constants/assets';
import { SUPPORTED_LANGUAGES } from '../constants/general';
import { I18nNamespaces } from '../@types/i18next';
import { SignupReason, signupReasons } from '../utils/signUpReasons';

interface ISignUp {
  reason?: SignupReason;
  redirectURL?: string;
  goal?: string;
}

const Signup: NextPage<ISignUp> = ({ reason, goal, redirectURL }) => {
  const { t } = useTranslation('page-SignUp');

  return (
    <>
      <Head>
        <title>
          {t(
            `meta.${
              `title${
                goal ? `-${goal}` : ''
              }` as keyof I18nNamespaces['page-SignUp']['meta']
            }`
          )}
        </title>
        <meta
          name='description'
          content={t(
            `meta.${
              `description${
                goal ? `-${goal}` : ''
              }` as keyof I18nNamespaces['page-SignUp']['meta']
            }`
          )}
        />
        <meta
          property='og:title'
          content={t(
            `meta.${
              `title${
                goal ? `-${goal}` : ''
              }` as keyof I18nNamespaces['page-SignUp']['meta']
            }`
          )}
        />
        <meta
          property='og:description'
          content={t(
            `meta.${
              `description${
                goal ? `-${goal}` : ''
              }` as keyof I18nNamespaces['page-SignUp']['meta']
            }`
          )}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <SignupMenu
        goal={goal ?? undefined}
        reason={reason ?? undefined}
        redirectURL={redirectURL ?? undefined}
      />
    </>
  );
};

(Signup as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <AuthLayout>
      <motion.div
        key='sign-up'
        exit={{
          x: -1000,
          y: 0,
          opacity: 0,
          transition: {
            duration: 1,
          },
        }}
      >
        {page}
      </motion.div>
    </AuthLayout>
  );
};

export default Signup;

export const getServerSideProps: GetServerSideProps<ISignUp> = async (
  context
) => {
  const { to, reason, redirect } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'page-SignUp', 'page-VerifyEmail'],
    null,
    SUPPORTED_LANGUAGES
  );

  const redirectURL = redirect && !Array.isArray(redirect) ? redirect : '';
  const goal = to && !Array.isArray(to) ? to : '';

  // TODO: implement granular cache-control (likely in newer version of Next.js)
  // if (!goal.length) {
  //   context.res.setHeader(
  //     'Cache-Control',
  //     'public, s-maxage=10, stale-while-revalidate=20'
  //   );
  // }

  if (
    reason &&
    !Array.isArray(reason) &&
    signupReasons.find((validT) => validT === reason)
  ) {
    return {
      props: {
        reason: reason as SignupReason,
        ...(redirectURL
          ? {
              redirectURL,
            }
          : {}),
        ...(goal
          ? {
              goal,
            }
          : {}),
        ...translationContext,
      },
    };
  }

  return {
    props: {
      ...(redirectURL
        ? {
            redirectURL,
          }
        : {}),
      ...(goal
        ? {
            goal,
          }
        : {}),
      ...translationContext,
    },
  };
};
