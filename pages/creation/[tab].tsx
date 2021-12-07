import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import _compact from 'lodash/compact';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Input from '../../components/atoms/creation/Input';
import Button from '../../components/atoms/Button';
import FileUpload from '../../components/molecules/creation/FileUpload';
import MobileField from '../../components/molecules/creation/MobileField';
import Tabs, { Tab } from '../../components/molecules/Tabs';
import CreationLayout from '../../components/templates/CreationLayout';

import { NextPageWithLayout } from '../_app';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { setCreationTitle, setCreationMinBid, setCreationComments } from '../../redux-store/slices/creationStateSlice';

export const CreationSecondStep = () => {
  const [minHeight, setMinHeight] = useState('100vh');
  const { t } = useTranslation('creation');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { post, auction } = useAppSelector((state) => state.creation);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const tabs: Tab[] = useMemo(() => [
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
  ], []);
  const activeTabIndex = tabs.findIndex((tab) => tab.nameToken === router?.query?.tab);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const mobileFields = useMemo(() => _compact([
    router?.query?.tab === 'multiple-choice' && {
      key: 'options',
    },
    {
      key: 'minimalBid',
      value: '$1.00',
    },
    router?.query?.tab === 'crowdfunding' && {
      key: 'min-backers',
      value: '0',
    },
    {
      key: 'expire',
      value: 'Sat, 13 Nov 2021 at 2 PM',
    },
    {
      key: 'post',
      value: 'Right away',
    },
    {
      key: 'comments',
      type: 'toggle',
      value: true,
    },
  ]), [router?.query?.tab]);

  const handleSubmit = useCallback(() => {
  }, []);
  const handleItemChange = useCallback((key: string, value: string | boolean) => {
    if (key === 'title') {
      dispatch(setCreationTitle(value));
    } else if (key === 'minimalBid') {
      dispatch(setCreationMinBid(value));
    } else if (key === 'comments') {
      dispatch(setCreationComments(value));
    }
  }, [dispatch]);
  const renderField = useCallback((item) => {
    let value: any = '';

    if (item.key === 'minimalBid') {
      value = `$${auction.minimalBid}`;
    } else if (item.key === 'comments') {
      value = post.options.commentsEnabled;
    }

    return (
      <SFieldWrapper key={item.key}>
        <MobileField
          item={item}
          value={value}
          onChange={handleItemChange}
        />
        <SSeparator />
      </SFieldWrapper>
    );
  }, [auction.minimalBid, handleItemChange, post.options.commentsEnabled]);

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
                    id="title"
                    value={post?.title}
                    onChange={handleItemChange}
                    placeholder={t('secondStep.input.placeholder')}
                  />
                </SItemWrapper>
                <SSeparator />
              </>
            )}
            {mobileFields.map(renderField)}
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
  margin: 16px 0;
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 24px;
`;

const SFieldWrapper = styled.div``;
