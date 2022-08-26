import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';

import { TPostType } from '../../../../utils/switchPostType';

import { TPostStatusStringified } from '../../../../utils/switchPostStatus';

// Views
const PostModerationAC = dynamic(() => import('./PostModerationAC'));
const PostModerationMC = dynamic(() => import('./PostModerationMC'));
const PostModerationCF = dynamic(() => import('./PostModerationCF'));
const PostViewScheduled = dynamic(() => import('../common/PostViewScheduled'));
const PostViewProcessingAnnouncement = dynamic(
  () => import('../common/PostViewProcessingAnnouncement')
);

interface IModerationView {
  postParsed:
    | newnewapi.Auction
    | newnewapi.Crowdfunding
    | newnewapi.MultipleChoice;
  typeOfPost: TPostType;
  postStatus: TPostStatusStringified;
  isFollowingDecision: boolean;
  hasRecommendations: boolean;
  handleSetIsFollowingDecision: (v: boolean) => void;
  handleGoBackInsidePost: () => void;
  handleUpdatePostStatus: (newStatus: number | string) => void;
  handleRemoveFromStateUnfavorited: (() => void) | undefined;
  handleAddPostToStateFavorited: (() => void) | undefined;
  handleReportOpen: () => void;
}

const ModerationView: React.FunctionComponent<IModerationView> = ({
  postParsed,
  typeOfPost,
  postStatus,
  isFollowingDecision,
  hasRecommendations,
  handleSetIsFollowingDecision,
  handleGoBackInsidePost,
  handleUpdatePostStatus,
  handleRemoveFromStateUnfavorited,
  handleAddPostToStateFavorited,
  handleReportOpen,
}) => {
  if (postStatus === 'processing_announcement' && postParsed) {
    return (
      <PostViewProcessingAnnouncement
        key={postParsed.postUuid}
        post={postParsed}
        postStatus={postStatus}
        variant='moderation'
        postType={typeOfPost as string}
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

  if (postStatus === 'scheduled' && postParsed) {
    return (
      <PostViewScheduled
        key={postParsed.postUuid}
        postType={typeOfPost as string}
        post={postParsed}
        postStatus={postStatus}
        variant='moderation'
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
      <PostModerationMC
        key={postParsed.postUuid}
        postStatus={postStatus}
        post={postParsed as newnewapi.MultipleChoice}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleGoBack={handleGoBackInsidePost}
      />
    );
  }

  if (typeOfPost === 'ac' && postParsed) {
    return (
      <PostModerationAC
        key={postParsed.postUuid}
        post={postParsed as newnewapi.Auction}
        postStatus={postStatus}
        handleGoBack={handleGoBackInsidePost}
        handleUpdatePostStatus={handleUpdatePostStatus}
      />
    );
  }

  if (typeOfPost === 'cf' && postParsed) {
    return (
      <PostModerationCF
        key={postParsed.postUuid}
        postStatus={postStatus}
        post={postParsed as newnewapi.Crowdfunding}
        handleUpdatePostStatus={handleUpdatePostStatus}
        handleGoBack={handleGoBackInsidePost}
      />
    );
  }

  return null;
};

export default ModerationView;
