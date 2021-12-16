import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../components/templates/CreationLayout';
import CreationFirstStepContent from '../../components/organisms/creation/first/index';

import { NextPageWithLayout } from '../_app';

export const CreationFirstStep = () => {
  const { t } = useTranslation('creation');

  return (
    <SWrapper>
      <Head>
        <title>
          {t('firstStep.meta.title')}
        </title>
      </Head>
      <CreationFirstStepContent />
    </SWrapper>
  );
};

(CreationFirstStep as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout>
    {page}
  </CreationLayout>
);

export default CreationFirstStep;

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
  ${(props) => props.theme.media.tablet} {
    height: 100vh;
  }
`;
