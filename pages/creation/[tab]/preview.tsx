import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import PreviewContent from '../../../components/organisms/creation/preview';

import { NextPageWithLayout } from '../../_app';

interface ICreationPreview {
  video: any;
  setVideo: (video: any) => void;
}

export const CreationPreview: React.FC<ICreationPreview> = (props) => {
  const { t } = useTranslation('creation');
  const router = useRouter();

  return (
    <SWrapper>
      <Head>
        <title>
          {t(`preview.meta.title-${router?.query?.tab}`)}
        </title>
      </Head>
      <PreviewContent {...props} />
    </SWrapper>
  );
};

(CreationPreview as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout>
    {page}
  </CreationLayout>
);

export default CreationPreview;

export async function getStaticPaths() {
  return {
    paths: [
      '/creation/auction/preview',
      '/creation/multiple-choice/preview',
      '/creation/crowdfunding/preview',
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
