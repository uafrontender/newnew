import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CreationFirstStepContent from '../../components/organisms/creation/first/index';

import { NextPageWithLayout } from '../_app';
import General from '../../components/templates/General';
import assets from '../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

export const CreationFirstStep = () => {
  const { t } = useTranslation('page-Creation');

  return (
    <>
      <SWrapper>
        <Head>
          <title>{t('firstStep.meta.title')}</title>
          <meta name='description' content={t('firstStep.meta.description')} />
          <meta property='og:title' content={t('firstStep.meta.title')} />
          <meta
            property='og:description'
            content={t('firstStep.meta.description')}
          />
          <meta property='og:image' content={assets.openGraphImage.common} />
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
  ${(props) => props.theme.media.tablet} {
    padding: 100px 0;
  }
`;
