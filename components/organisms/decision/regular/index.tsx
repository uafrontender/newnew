import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';

import { TPostStatusStringified } from '../../../../utils/switchPostStatus';

// Views
const PostViewAC = dynamic(() => import('./PostViewAC'));
const PostViewMC = dynamic(() => import('./PostViewMC'));
const PostViewCF = dynamic(() => import('./PostViewCF'));
const PostViewScheduled = dynamic(() => import('../common/PostViewScheduled'));
const PostViewProcessingAnnouncement = dynamic(
  () => import('../common/PostViewProcessingAnnouncement')
);

interface IRegularView {
  postParsed:
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice;
  typeOfPost: TPostType;
  postStatus: TPostStatusStringified;
  isFollowingDecision: boolean;
  hasRecommendations: boolean;
  saveCard: boolean | undefined;
  stripeSetupIntentClientSecret: string | undefined;
  handleSetIsFollowingDecision: (v: boolean) => void;
  handleGoBackInsidePost: () => void;
  handleUpdatePostStatus: (newStatus: number | string) => void;
  handleRemoveFromStateUnfavorited: (() => void) | undefined;
  handleAddPostToStateFavorited: (() => void) | undefined;
  handleReportOpen: () => void;
  resetSetupIntentClientSecret: () => void;
}

const RegularView: React.FunctionComponent<IRegularView> = ({
  postParsed,
  typeOfPost,
  postStatus,
  isFollowingDecision,
  hasRecommendations,
  saveCard,
  stripeSetupIntentClientSecret,
  handleSetIsFollowingDecision,
  handleGoBackInsidePost,
  handleUpdatePostStatus,
  handleRemoveFromStateUnfavorited,
  handleAddPostToStateFavorited,
  handleReportOpen,
  resetSetupIntentClientSecret,
}) => {
  if (postStatus === 'scheduled' && postParsed) {
    return (
      <PostViewScheduled
        key={postParsed.postUuid}
        postType={typeOfPost as string}
        post={postParsed}
        postStatus={postStatus}
        variant='decision'
        isFollowingDecision={isFollowingDecision}
        hasRecommendations={hasRecommendations}
        handleSetIsFollowingDecision={handleSetIsFollowingDecision}
        handleGoBack={handleGoBackInsidePost}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleRemoveFromStateUnfavorited={handleRemoveFromStateUnfavorited!!}
        handleAddPostToStateFavorited={handleAddPostToStateFavorited!!}
        handleReportOpen={handleReportOpen}
      />
    );
  }

  if (postStatus === 'processing_announcement' && postParsed) {
    return (
      <PostViewProcessingAnnouncement
        key={postParsed.postUuid}
        post={postParsed}
        postStatus={postStatus}
        postType={typeOfPost as string}
        variant='decision'
        isFollowingDecision={isFollowingDecision}
        hasRecommendations={hasRecommendations}
        handleSetIsFollowingDecision={handleSetIsFollowingDecision}
        handleGoBack={handleGoBackInsidePost}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleRemoveFromStateUnfavorited={handleRemoveFromStateUnfavorited!!}
        handleAddPostToStateFavorited={handleAddPostToStateFavorited!!}
        handleReportOpen={handleReportOpen}
      />
    );
  }

  if (typeOfPost === 'mc' && postParsed) {
    return (
      <PostViewMC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.MultipleChoice}
        postStatus={postStatus}
        stripeSetupIntentClientSecret={
          stripeSetupIntentClientSecret ?? undefined
        }
        saveCard={saveCard}
        isFollowingDecision={isFollowingDecision}
        hasRecommendations={hasRecommendations}
        handleSetIsFollowingDecision={handleSetIsFollowingDecision}
        resetSetupIntentClientSecret={resetSetupIntentClientSecret}
        handleGoBack={handleGoBackInsidePost}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleReportOpen={handleReportOpen}
        handleRemoveFromStateUnfavorited={handleRemoveFromStateUnfavorited!!}
        handleAddPostToStateFavorited={handleAddPostToStateFavorited!!}
      />
    );
  }

  if (typeOfPost === 'ac' && postParsed) {
    return (
      <PostViewAC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.Auction}
        postStatus={postStatus}
        stripeSetupIntentClientSecret={
          stripeSetupIntentClientSecret ?? undefined
        }
        saveCard={saveCard}
        isFollowingDecision={isFollowingDecision}
        hasRecommendations={hasRecommendations}
        handleSetIsFollowingDecision={handleSetIsFollowingDecision}
        resetSetupIntentClientSecret={resetSetupIntentClientSecret}
        handleGoBack={handleGoBackInsidePost}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleReportOpen={handleReportOpen}
        handleRemoveFromStateUnfavorited={handleRemoveFromStateUnfavorited!!}
        handleAddPostToStateFavorited={handleAddPostToStateFavorited!!}
      />
    );
  }

  if (typeOfPost === 'cf' && postParsed) {
    return (
      <PostViewCF
        key={postParsed.postUuid}
        post={postParsed as newnewapi.Crowdfunding}
        postStatus={postStatus}
        stripeSetupIntentClientSecret={
          stripeSetupIntentClientSecret ?? undefined
        }
        saveCard={saveCard}
        isFollowingDecision={isFollowingDecision}
        hasRecommendations={hasRecommendations}
        handleSetIsFollowingDecision={handleSetIsFollowingDecision}
        resetSetupIntentClientSecret={resetSetupIntentClientSecret}
        handleGoBack={handleGoBackInsidePost}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleReportOpen={handleReportOpen}
        handleRemoveFromStateUnfavorited={handleRemoveFromStateUnfavorited!!}
        handleAddPostToStateFavorited={handleAddPostToStateFavorited!!}
      />
    );
  }

  return null;
};

export default RegularView;
