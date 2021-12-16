import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import SecondStepContent from '../../../components/organisms/creation/second';

import { NextPageWithLayout } from '../../_app';

interface ICreationSecondStep {
  video: any;
  setVideo: (video: any) => void;
}

export const CreationSecondStep: React.FC<ICreationSecondStep> = (props) => {
  const { t } = useTranslation('creation');
  const router = useRouter();

  return (
    <SWrapper>
      <Head>
        <title>
          {t(`secondStep.meta.title-${router?.query?.tab}`)}
        </title>
      </Head>
      <SecondStepContent {...props} />
    </SWrapper>
  );
};

(CreationSecondStep as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout noHeader>
    {page}
  </CreationLayout>
);

export default CreationSecondStep;

export async function getStaticPaths() {
  return {
    paths: [
      '/creation/auction',
      '/creation/multiple-choice',
      '/creation/crowdfunding',
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
