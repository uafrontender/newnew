/* eslint-disable no-unused-vars */
import React, { ReactElement } from 'react';
import styled from 'styled-components';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

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
  console.log(isCreatorsImSubscribedToLoading);
  console.log(creatorsImSubscribedTo);
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
            <NoContentMessageContainer>
              <NoContentGraphicsContainer>
                <SImage src={NoSubscriptions.src} />
              </NoContentGraphicsContainer>
              <NoContentInfoContainer>
                <NoContentTitle>
                  You’re not subscribed to any creators
                </NoContentTitle>
                <NoContentDescription>
                  By subscribing to creators you will be able to:
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
                    Direct message you
                  </NoContentInstructionRecord>
                  <NoContentInstructionRecord>
                    <NoContentInstructionPoint>
                      <InlineSvg
                        svg={VerificationPassedIcon}
                        width='16px'
                        height='16px'
                      />
                    </NoContentInstructionPoint>
                    Get a free vote on your
                  </NoContentInstructionRecord>
                  <NoContentInstructionRecord>
                    <NoContentInstructionPoint>
                      <InlineSvg
                        svg={VerificationPassedIcon}
                        width='16px'
                        height='16px'
                      />
                    </NoContentInstructionPoint>
                    Superpolls Add custom suggestions to your Superpolls
                  </NoContentInstructionRecord>
                </NoContentInstruction>
                <SButton
                  withShadow
                  view='primaryGrad'
                  onClick={() => {
                    router.push('/');
                  }}
                >
                  Find creators
                </SButton>
              </NoContentInfoContainer>
            </NoContentMessageContainer>
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

const NoContentMessageContainer = styled.div`
  margin: 8px 16px 30px !important;
  padding: 16px 24px 30px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  width: 100%;
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    padding: 24px 32px 24px 16px !important;
    margin: 56px auto 30px !important;
    width: auto;
  }
`;

const NoContentGraphicsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
  }
`;

const NoContentInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    align-items: flex-start;
    margin-left: 24px;
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

const NoContentTitle = styled.div`
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin-bottom: 8px;
  width: 100%;
  text-align: start;

  ${({ theme }) => theme.media.laptop} {
    font-size: 24px;
    line-height: 32px;
  }
`;

const NoContentDescription = styled.div`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  margin-bottom: 18px;
  width: 100%;
  text-align: start;

  ${({ theme }) => theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const NoContentInstruction = styled.div`
  margin-bottom: 12px;
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

const SButton = styled(Button)`
  width: fit-content;
`;
