import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import PublishedContent from '../../../components/organisms/creation/published';

import { useAppSelector } from '../../../redux-store/store';
import { NextPageWithLayout } from '../../_app';

interface ICreationPublished {
  video: any;
  setVideo: (video: any) => void;
}

export const CreationPublished: React.FC<ICreationPublished> = (props) => {
  const { t } = useTranslation('creation');
  const router = useRouter();
  const { post: { startsAt: { type } } } = useAppSelector((state) => state.creation);

  return (
    <SWrapper>
      <Head>
        <title>
          {t(`published.meta.title-${router?.query?.tab}-${type === 'right-away' ? 'published' : 'scheduled'}`)}
        </title>
      </Head>
      <PublishedContent {...props} />
    </SWrapper>
  );
};

(CreationPublished as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout noHeader>
    {page}
  </CreationLayout>
);

export default CreationPublished;

export async function getStaticPaths() {
  return {
    paths: [
      '/creation/auction/published',
      '/creation/multiple-choice/published',
      '/creation/crowdfunding/published',
    ],
    fallback: true,
  };
}

export async function getStaticProps(context: NextPageContext): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'creation'],
  );

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
