import React, { useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { NextPageContext } from 'next';
import styled, { useTheme } from 'styled-components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Input from '../../components/atoms/creation/Input';
import Button from '../../components/atoms/Button';
import InlineSVG from '../../components/atoms/InlineSVG';
import FileUpload from '../../components/molecules/creation/FileUpload';
import MobileField from '../../components/molecules/creation/MobileField';
import Tabs, { Tab } from '../../components/molecules/Tabs';
import CreationLayout from '../../components/templates/CreationLayout';
import MobileFieldBlock from '../../components/molecules/creation/MobileFieldBlock';

import { NextPageWithLayout } from '../_app';
import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import {
  setCreationTitle,
  setCreationMinBid,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
} from '../../redux-store/slices/creationStateSlice';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import { formatNumber } from '../../utils/format';

export const CreationSecondStep = () => {
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    post,
    auction,
  } = useAppSelector((state) => state.creation);
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
  const disabled = true;

  const handleSubmit = useCallback(() => {
  }, []);
  const handleCloseClick = useCallback(() => {
    if (router.query?.referer) {
      router.push(router.query.referer as string);
    } else {
      router.push('/');
    }
  }, [router]);
  const handleItemChange = useCallback((key: string, value: string | number | boolean) => {
    if (key === 'title') {
      dispatch(setCreationTitle(value));
    } else if (key === 'minimalBid') {
      dispatch(setCreationMinBid(value));
    } else if (key === 'comments') {
      dispatch(setCreationComments(value));
    } else if (key === 'expiresAt') {
      dispatch(setCreationExpireDate(value));
    } else if (key === 'startsAt') {
      dispatch(setCreationStartDate(value));
    }
  }, [dispatch]);
  const expireOptions = useMemo(() => [
    {
      id: '1-hour',
      title: t('secondStep.field.expiresAt.options.1-hour'),
    },
    {
      id: '6-hours',
      title: t('secondStep.field.expiresAt.options.6-hours'),
    },
    {
      id: '12-hours',
      title: t('secondStep.field.expiresAt.options.12-hours'),
    },
    {
      id: '1-day',
      title: t('secondStep.field.expiresAt.options.1-day'),
    },
    {
      id: '3-days',
      title: t('secondStep.field.expiresAt.options.3-days'),
    },
    {
      id: '5-days',
      title: t('secondStep.field.expiresAt.options.5-days'),
    },
    {
      id: '7-days',
      title: t('secondStep.field.expiresAt.options.7-days'),
    },
  ], [t]);

  return (
    <SWrapper>
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
            withTabIndicator={!isMobile && resizeMode !== 'tablet'}
          />
          {isMobile && (
            <SCloseIconWrapper>
              <InlineSVG
                clickable
                svg={closeIcon}
                fill={theme.colorsThemed.text.secondary}
                width="24px"
                height="24px"
                onClick={handleCloseClick}
              />
            </SCloseIconWrapper>
          )}
        </STabsWrapper>
        <SContent>
          <SLeftPart>
            <SItemWrapper>
              <FileUpload />
            </SItemWrapper>
            {isMobile && (
              <SItemWrapper>
                <Input
                  id="title"
                  value={post?.title}
                  onChange={handleItemChange}
                  placeholder={t('secondStep.input.placeholder')}
                />
              </SItemWrapper>
            )}
            <SListWrapper>
              <SFieldWrapper>
                <MobileFieldBlock
                  id="minimalBid"
                  type="input"
                  value={auction.minimalBid}
                  onChange={handleItemChange}
                  inputType="number"
                  formattedDescription={formatNumber(+auction.minimalBid)}
                />
              </SFieldWrapper>
              <SFieldWrapper>
                <MobileFieldBlock
                  id="expiresAt"
                  type="select"
                  value={post.expiresAt}
                  options={expireOptions}
                  onChange={handleItemChange}
                  formattedValue={t(`secondStep.field.expiresAt.options.${post.expiresAt}`)}
                  formattedDescription="00 Nov 0000 at 00 PM"
                />
              </SFieldWrapper>
              <SFieldWrapper>
                <MobileFieldBlock
                  id="startsAt"
                  type="date"
                  value={post.startsAt}
                  onChange={handleItemChange}
                  formattedValue={post.startsAt}
                  formattedDescription="00 Nov 0000 at 00 PM"
                />
              </SFieldWrapper>
            </SListWrapper>
            <SSeparator />
            <MobileField
              id="comments"
              type="toggle"
              value={post.options.commentsEnabled}
              onChange={handleItemChange}
            />
          </SLeftPart>
        </SContent>
      </div>
      {isMobile && (
        <SButtonWrapper>
          <SButton
            view="primaryGrad"
            onClick={handleSubmit}
            disabled={disabled}
          >
            {t('secondStep.button.preview')}
          </SButton>
        </SButtonWrapper>
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
  padding: 16px 0;
  position: relative;
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
  margin: 8px 0 16px 0;
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
`;

const SListWrapper = styled.div`
  left: -8px;
  width: calc(100% + 16px);
  display: flex;
  position: relative;
  flex-wrap: wrap;
  margin-top: 8px;
  flex-direction: row;
`;

const SFieldWrapper = styled.div`
  width: calc(50% - 16px);
  margin: 8px;
`;

const SButtonWrapper = styled.div`
  left: 16px;
  width: calc(100% - 32px);
  bottom: 24px;
  z-index: 5;
  position: fixed;
`;

const SCloseIconWrapper = styled.div`
  top: 50%;
  right: 0;
  z-index: 5;
  position: absolute;
  transform: translateY(-50%);
`;
