import Head from 'next/head';
import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CreationLayout from '../../../components/templates/CreationLayout';
import PreviewContent from '../../../components/organisms/creation/preview';

import { NextPageWithLayout } from '../../_app';
import { SUPPORTED_LANGUAGES } from '../../../constants/general';
import { I18nNamespaces } from '../../../@types/i18next';

interface ICreationPreview {}

export const CreationPreview: React.FC<ICreationPreview> = (props) => {
  const { t } = useTranslation('page-Creation');
  const router = useRouter();

  return (
    <SWrapper>
      <Head>
        <title>
          {t(
            `preview.meta.${
              `title-${router?.query?.tab}` as keyof I18nNamespaces['page-Creation']['preview']['meta']
            }`
          )}
        </title>
      </Head>
      <PreviewContent {...props} />
    </SWrapper>
  );
};

(CreationPreview as NextPageWithLayout).getLayout = (
  page: React.ReactElement
) => <CreationLayout>{page}</CreationLayout>;

export default CreationPreview;

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
  min-height: calc(100vh - 60px);
  padding-bottom: 104px;
  flex-direction: column;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    margin: 30px;
    padding-bottom: unset;
  }
`;
