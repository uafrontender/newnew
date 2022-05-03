/* eslint-disable no-unused-vars */
import React, { ReactElement } from 'react';
import styled from 'styled-components';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import { NextPageWithLayout } from '../_app';
// import { TTokenCookie } from '../../api/apiConfigs';

import MyProfileLayout from '../../components/templates/MyProfileLayout';
// import useUpdateEffect from '../../utils/hooks/useUpdateEffect';
import PostsFilterSection from '../../components/molecules/profile/PostsFilterSection';
import { useGetSubscriptions } from '../../contexts/subscriptionsContext';
import CreatorsList from '../../components/organisms/search/CreatorsList';
import NoSubscriptions from '../../public/images/profile/No-subscriptions.png';
import VerificationPassedIcon from '../../public/images/svg/icons/filled/VerificationPassed.svg';
import Button from '../../components/atoms/Button';
import InlineSvg from '../../components/atoms/InlineSVG';
import NoContentCard from '../../components/atoms/profile/NoContentCard';
import {
  NoContentDescription,
  NoContentTitle,
} from '../../components/atoms/profile/NoContentCommonElements';

interface IMyProfileSubscriptions {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  posts?: newnewapi.Post[];
  postsFilter: newnewapi.Post.Filter;
  nextPageTokenFromServer?: string;
  pageToken: string | null | undefined;
  totalCount: number;
  handleUpdatePageToken: (value: string | null | undefined) => void;
  handleUpdateCount: (value: number) => void;
  handleUpdateFilter: (value: newnewapi.Post.Filter) => void;
  handleSetPosts: React.Dispatch<React.SetStateAction<newnewapi.Post[]>>;
}

const MyProfileSubscriptions: NextPage<IMyProfileSubscriptions> = ({
  user,
  pagedPosts,
  nextPageTokenFromServer,
  posts,
  postsFilter,
  pageToken,
  totalCount,
  handleUpdatePageToken,
  handleUpdateCount,
  handleUpdateFilter,
  handleSetPosts,
}) => {
  const { isCreatorsImSubscribedToLoading, creatorsImSubscribedTo } =
    useGetSubscriptions();
  const router = useRouter();
  const { t } = useTranslation('profile');

  return (
    <div>
      <SMain>
        <PostsFilterSection numDecisions={totalCount} />
        <SCardsSection>
          {creatorsImSubscribedTo.length > 0 ? (
            <CreatorsList
              loading={isCreatorsImSubscribedToLoading}
              collection={creatorsImSubscribedTo}
              subscribedTo
            />
          ) : (
            <NoContentCard graphics={<SImage src={NoSubscriptions.src} />}>
              <NoContentTitle>
                {t('Subscriptions.no-content.title')}
              </NoContentTitle>
              <NoContentDescription>
                {t('Subscriptions.no-content.description')}:
              </NoContentDescription>
              <NoContentInstruction>
                <NoContentInstructionRecord>
                  <NoContentInstructionPoint>
                    <InlineSvg
                      svg={VerificationPassedIcon}
                      width='16px'
                      height='16px'
                    />
                  </NoContentInstructionPoint>
                  {t('Subscriptions.no-content.instruction1')}
                </NoContentInstructionRecord>
                <NoContentInstructionRecord>
                  <NoContentInstructionPoint>
                    <InlineSvg
                      svg={VerificationPassedIcon}
                      width='16px'
                      height='16px'
                    />
                  </NoContentInstructionPoint>
                  {t('Subscriptions.no-content.instruction2')}
                </NoContentInstructionRecord>
                <NoContentInstructionRecord>
                  <NoContentInstructionPoint>
                    <InlineSvg
                      svg={VerificationPassedIcon}
                      width='16px'
                      height='16px'
                    />
                  </NoContentInstructionPoint>
                  {t('Subscriptions.no-content.instruction3')}
                </NoContentInstructionRecord>
              </NoContentInstruction>
              <Button
                withShadow
                view='primaryGrad'
                onClick={() => {
                  router.push('/');
                }}
                style={{ width: 'fit-content' }}
              >
                {t('Subscriptions.no-content.button')}
              </Button>
            </NoContentCard>
          )}
        </SCardsSection>
      </SMain>
      {/* Displayed creator modal? */}
    </div>
  );
};

(MyProfileSubscriptions as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='subscriptions'
      postsCachedSubscriptions={page.props.pagedPosts.posts}
      postsCachedSubscriptionsFilter={newnewapi.Post.Filter.ALL}
      postsCachedSubscriptionsPageToken={page.props.nextPageTokenFromServer}
      postsCachedSubscriptionsCount={page.props.pagedPosts.totalCount}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileSubscriptions;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  try {
    const translationContext = await serverSideTranslations(context.locale!!, [
      'common',
      'profile',
      'home',
      'decision',
      'payment-modal',
    ]);

    return {
      props: {
        pagedPosts: {},
        ...translationContext,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        error: {
          message: (err as Error).message,
          statusCode: 400,
        },
      },
    };
  }
}

const SMain = styled.main`
  min-height: 60vh;
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }
`;

const SImage = styled.img`
  object-fit: contain;
  height: 165px;
  width: 165px;

  ${({ theme }) => theme.media.laptop} {
    width: 245px;
    height: 245px;
  }
`;

const NoContentInstruction = styled.div`
  margin-bottom: 12px;
  width: 100%;
`;

const NoContentInstructionPoint = styled.div`
  flex-shrink: 0;
  margin-right: 6px !important;
`;

const NoContentInstructionRecord = styled.div`
  display: flex;
  align-items: center;

  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin-bottom: 12px;
`;
