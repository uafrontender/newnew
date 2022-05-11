import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CreationFirstStepContent from '../../components/organisms/creation/first/index';

import { NextPageWithLayout } from '../_app';
import General from '../../components/templates/General';

export const CreationFirstStep = () => {
  const { t } = useTranslation('creation');

  return (
    <>
      <SWrapper>
        <Head>
          <title>{t('firstStep.meta.title')}</title>
        </Head>
        <CreationFirstStepContent />
      </SWrapper>
    </>
  );
};

(CreationFirstStep as NextPageWithLayout).getLayout = (
  page: React.ReactElement
) => <General>{page}</General>;

export default CreationFirstStep;

export async function getServerSideProps(
  context: NextPageContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'creation']
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
  padding: 100px 0;
`;
