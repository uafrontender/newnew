/* eslint-disable arrow-body-style */
import React, { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

interface IPostViewCF {
  post: newnewapi.Crowdfunding;
  handleGoBack: () => void;
}

const PostViewCF: React.FunctionComponent<IPostViewCF> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  return (
    <SWrapper>
      <SExpiresSection>
        {isMobile && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBack}
          />
        )}
        <PostTimer
          timestampSeconds={new Date((post.expiresAt?.seconds as number) * 1000).getTime()}
          postType="cf"
        />
        {!isMobile && (
          <SGoBackButtonDesktop
            onClick={handleGoBack}
          >
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </SGoBackButtonDesktop>
        )}
      </SExpiresSection>
      <PostVideo
        videoSrc={post.announcement?.videoUrl ?? MockVideo}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <PostTitle>
        { post.title }
      </PostTitle>
    </SWrapper>
  );
};

export default PostViewCF;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'expires'
    'video'
    'title'
    'activites'
  ;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
      grid-template-areas:
      'expires expires'
      'title title'
      'video activites'
    ;
  }

  ${({ theme }) => theme.media.laptop} {
      grid-template-areas:
      'video expires'
      'video title'
      'video activites'
    ;

    grid-template-columns: 1fr 1fr;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'closeBtnMobile timer closeBtnDesktop';

  width: 100%;

  margin-bottom: 6px;
`;

const SGoBackButtonDesktop = styled.button`
  grid-area: closeBtnDesktop;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;
