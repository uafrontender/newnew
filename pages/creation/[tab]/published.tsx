import React, { useMemo } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import PublishedContent from '../../../components/organisms/creation/published';

import { NextPageWithLayout } from '../../_app';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import { usePostCreationState } from '../../../contexts/postCreationContext';

interface ICreationPublished {}

export const CreationPublished: React.FC<ICreationPublished> = (props) => {
  const { t } = useTranslation('page-Creation');
  const router = useRouter();
  const { postInCreation } = usePostCreationState();
  const {
    post: {
      startsAt: { type },
    },
  } = useMemo(() => postInCreation, [postInCreation]);

  return (
    <SWrapper>
      <Head>
        <title>
          {t(
            `published.meta.title-${router?.query?.tab}-${
              type === 'right-away' ? 'published' : 'scheduled'
            }` as any
          )}
        </title>
      </Head>
      <PublishedContent {...props} />
    </SWrapper>
  );
};

(CreationPublished as NextPageWithLayout).getLayout = (
  page: React.ReactElement
) => <CreationLayout>{page}</CreationLayout>;

export default CreationPublished;

export async function getServerSideProps(
  context: NextPageContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'page-Creation'],
    null,
    SUPPORTED_LANGUAGES
  );

  // @ts-ignore
  if (!context?.req?.cookies?.accessToken) {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }

  return {
    props: {
      ...translationContext,
    },
  };
}

const SWrapper = styled.div`
  display: flex;
  padding-bottom: 104px;
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    margin: 0 auto;
    max-width: 464px;
    padding-bottom: 0;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 736px;
  }
`;
