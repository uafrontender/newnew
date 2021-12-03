import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Input from '../../components/atoms/creation/Input';
import Button from '../../components/atoms/Button';
import FileUpload from '../../components/molecules/creation/FileUpload';
import Tabs, { Tab } from '../../components/molecules/Tabs';
import CreationLayout from '../../components/templates/CreationLayout';

import { NextPageWithLayout } from '../_app';
import { useAppSelector } from '../../redux-store/store';

export const CreationSecondStep = () => {
  const [minHeight, setMinHeight] = useState('100vh');
  const { t } = useTranslation('creation');
  const router = useRouter();
  const tabs: Tab[] = [
    {
      nameToken: 'auction',
      url: '/creation/auction',
    },
    {
      nameToken: 'multiple-choice',
      url: '/creation/multiple-choice',
    },
    {
      nameToken: 'crowdfunding',
      url: '/creation/crowdfunding',
    },
  ];
  const activeTabIndex = tabs.findIndex((tab) => tab.nameToken === router?.query?.tab);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleSubmit = useCallback(() => {}, []);

  useEffect(() => {
    setMinHeight(`${window.innerHeight}px`);
  }, []);

  return (
    <SWrapper
      minHeight={minHeight}
    >
      <Head>
        <title>
          {t(`secondStep.meta.title-${router?.query?.tab}`)}
        </title>
      </Head>
      <div>
        <STabsWrapper>
          <Tabs
            t={t}
            tabs={tabs}
            activeTabIndex={activeTabIndex}
          />
        </STabsWrapper>
        <SContent>
          <SLeftPart>
            <SItemWrapper>
              <FileUpload />
            </SItemWrapper>
            {isMobile && (
              <>
                <SItemWrapper>
                  <Input
                    placeholder={t('secondStep.input.placeholder')}
                  />
                </SItemWrapper>
                <SSeparator />
              </>
            )}
          </SLeftPart>
        </SContent>
      </div>
      {isMobile && (
        <SButton
          disabled
          view="primaryGrad"
          onClick={handleSubmit}
        >
          {t('secondStep.button.submit')}
        </SButton>
      )}
    </SWrapper>
  );
};

(CreationSecondStep as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <CreationLayout>
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

interface ISWrapper {
  minHeight: string;
}

const SWrapper = styled.div<ISWrapper>`
  display: flex;
  min-height: ${(props) => props.minHeight};
  flex-direction: column;
  justify-content: space-between;

  ${({ theme }) => theme.media.tablet} {
    margin: 0 auto;
    max-width: 464px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 736px;
  }
`;

const SContent = styled.div`
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    flex-direction: column;
  }
`;

const SLeftPart = styled.div`
  flex: 1;

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const STabsWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 13px 0;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    padding: 18px 0;
  }

  ${({ theme }) => theme.media.laptop} {
    justify-content: flex-start;
  }
`;

const SItemWrapper = styled.div`
  margin-top: 16px;
`;

const SSeparator = styled.div`
  width: 100%;
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin: 12px 0;
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 24px;
`;
