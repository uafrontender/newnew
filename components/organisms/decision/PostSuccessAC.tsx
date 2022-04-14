/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useInView } from 'react-intersection-observer';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';
import moment from 'moment';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import {
  fetchAcOptionById,
  fetchCurrentBidsForPost,
  placeBidOnAuction,
} from '../../../api/endpoints/auction';

import Lottie from '../../atoms/Lottie';
import GoBackButton from '../../molecules/GoBackButton';
import PostVideo from '../../molecules/decision/PostVideo';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import AcWinnerTab from '../../molecules/decision/auction/AcWinnerTab';
import AcOptionsTab from '../../molecules/decision/auction/AcOptionsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';
import LoadingModal from '../../molecules/LoadingModal';

// Assets
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

// Utils
import isBrowser from '../../../utils/isBrowser';
import switchPostType from '../../../utils/switchPostType';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import PaymentSuccessModal from '../../molecules/decision/PaymentSuccessModal';
import Headline from '../../atoms/Headline';
import PostVideoSuccess from '../../molecules/decision/success/PostVideoSuccess';
import DecisionEndedBox from '../../molecules/decision/success/DecisionEndedBox';

import BoxIcon from '../../../public/images/creation/AC.webp';
import CommentsSuccess from '../../molecules/decision/success/CommentsSuccess';

interface IPostSuccessAC {
  post: newnewapi.Auction;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

// Copy
// AcPostSuccess
// wants_to_know
// in_total_bids
// others
// bid
// bid_chosen
// see_all
// watch_reponse_first_time
// watch_reponse_announcement
// watch_reponse_reponse

const PostSuccessAC: React.FunctionComponent<IPostSuccessAC> = ({
  post,
  postStatus,
  handleGoBack,
  handleUpdatePostStatus,
}) => {
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);

    // Video
  // Open video tab
  const [videoTab, setVideoTab] = useState<'announcement' | 'response'>('announcement');
  // Response viewed
  const [responseViewed, setResponseViewed] = useState(
    post.isResponseViewedByMe ?? false
  );
  // Muted mode
  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

    // Main screen vs all bids
  const [openedMainSection, setOpenedMainSection] = useState<'main' | 'bids'>('main');

    // Comments
  const {
    ref: commentsSectionRef,
    inView
  } = useInView({
    threshold: 0.8
  });

  // Scroll to comments if hash is present
  useEffect(() => {
    const handleCommentsInitialHash = () => {
      const { hash } = window.location;
      if (!hash) {
        return;
      }
      const parsedHash = hash.substring(1);

      if (parsedHash === 'comments') {
        document.getElementById('comments')?.scrollIntoView();
      }
    };

    handleCommentsInitialHash();
  }, []);

  useEffect(() => {
    if (inView) {
      window.history.replaceState(
        {
          postId: post.postUuid,
        },
        'Post',
        `/post/${post.postUuid}#comments`
      );
    } else {
      window.history.replaceState(
        {
          postId: post.postUuid,
        },
        'Post',
        `/post/${post.postUuid}`
      );
    }
  }, [inView, post.postUuid]);

  return (
    <>
      <SWrapper>
        <PostVideoSuccess
          postId={post.postUuid}
          announcement={post.announcement!!}
          response={post.response ?? undefined}
          responseViewed={responseViewed}
          openedTab={videoTab}
          setOpenedTab={(tab) => setVideoTab(tab)}
          isMuted={mutedMode}
          handleToggleMuted={() => handleToggleMutedMode()}
          handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
        />
        <SActivitesContainer>
          <DecisionEndedBox
            imgSrc={BoxIcon.src}
          >
            {t('AcPostSuccess.hero_text')}
          </DecisionEndedBox>
        </SActivitesContainer>
      </SWrapper>
      {post.isCommentsAllowed && (
        <SCommentsSection
          id="comments"
          ref={commentsSectionRef}
        >
          <SCommentsHeadline variant={4}>
            {t('SuccessCommon.Comments.heading')}
          </SCommentsHeadline>
          <CommentsSuccess
            commentsRoomId={post.commentsRoomId as number}
            handleGoBack={() => {}}
          />
        </SCommentsSection>
      )}
    </>
  );
};

export default PostSuccessAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    min-height: 0;

    display: inline-grid;
    grid-template-areas:
      'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: minmax(0, 1fr);

    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    grid-template-areas:
      'video activities';
    grid-template-columns: 410px 1fr;
  }
`;


const SActivitesContainer = styled.div`
  grid-area: activities;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  overflow: hidden;
  border-radius: 16px;

  margin-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 0px;
    height: 506px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
  }
`;

// Comments
const SCommentsHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SCommentsSection = styled.div`

`;
