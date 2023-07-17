import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import { TPostType } from '../../../../utils/switchPostType';
import { Mixpanel } from '../../../../utils/mixpanel';
import { markPost } from '../../../../api/endpoints/post';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { usePushNotifications } from '../../../../contexts/pushNotificationsContext';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';
import PostEllipseMenu from './PostEllipseMenu';
import PostShareEllipseMenu from './PostShareEllipseMenu';
import PostEllipseModal from './PostEllipseModal';
import PostShareEllipseModal from './PostShareEllipseModal';

// Icons
import ShareIcon from '../../../../public/images/svg/icons/filled/Share.svg';
import MoreIcon from '../../../../public/images/svg/icons/filled/More.svg';
import { useAppState } from '../../../../contexts/appStateContext';
import { MarkPostAsFavoriteAfterSignUp } from '../../../../utils/hooks/useAfterSighUp';

interface IPostSuccessOrWaitingControls {}

const PostSuccessOrWaitingControls: React.FunctionComponent<
  IPostSuccessOrWaitingControls
> = () => {
  const theme = useTheme();
  const router = useRouter();
  const { resizeMode, userLoggedIn } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const moreButtonRef: any = useRef();
  const shareButtonRef: any = useRef();

  const {
    postParsed,
    typeOfPost,
    isFollowingDecision,
    // hasRecommendations,
    handleReportOpen,
    handleSetIsFollowingDecision,
  } = usePostInnerState();

  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [ellipseMenuOpen, setEllipseMenuOpen] = useState(false);

  const postUuid = useMemo(() => postParsed?.postUuid ?? '', [postParsed]);
  const postShortId = useMemo(
    () => postParsed?.postShortId ?? '',
    [postParsed]
  );
  const postType = useMemo(() => typeOfPost ?? 'ac', [typeOfPost]);

  const handleOpenShareMenu = () => {
    Mixpanel.track('Open Share Menu', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostSuccessOrWaitingControls',
    });
    setShareMenuOpen(true);
  };

  const handleCloseShareMenu = useCallback(() => {
    Mixpanel.track('Close Share Menu', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostSuccessOrWaitingControls',
    });
    setShareMenuOpen(false);
  }, [postUuid]);

  const handleOpenEllipseMenu = () => {
    Mixpanel.track('Open Ellipse Menu', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostSuccessOrWaitingControls',
    });
    setEllipseMenuOpen(true);
  };

  const handleCloseEllipseMenu = useCallback(() => {
    Mixpanel.track('Close Ellipse Menu', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostSuccessOrWaitingControls',
    });
    setEllipseMenuOpen(false);
  }, [postUuid]);

  const handleFollowDecision = useCallback(async () => {
    try {
      Mixpanel.track('Favorite Post', {
        _stage: 'Post',
        _postUuid: postUuid,
        _component: 'PostSuccessOrWaitingControls',
      });

      if (!userLoggedIn) {
        const onLogin: MarkPostAsFavoriteAfterSignUp = {
          action: 'favorite-post',
          postUuid,
        };

        const [path, query] = window.location.href.split('?');
        const onLoginQuery = `onLogin=${JSON.stringify(onLogin)}`;
        const queryWithOnLogin = query
          ? `${query}&${onLoginQuery}`
          : onLoginQuery;
        router.push(
          `/sign-up?reason=follow-decision&redirect=${encodeURIComponent(
            `${path}?${queryWithOnLogin}`
          )}`
        );
        return;
      }
      const markAsFavoritePayload = new newnewapi.MarkPostRequest({
        markAs: !isFollowingDecision
          ? newnewapi.MarkPostRequest.Kind.FAVORITE
          : newnewapi.MarkPostRequest.Kind.NOT_FAVORITE,
        postUuid,
      });

      const res = await markPost(markAsFavoritePayload);

      if (!res.error) {
        handleSetIsFollowingDecision(!isFollowingDecision);
      }

      if (!isFollowingDecision) {
        promptUserWithPushNotificationsPermissionModal();
      }
    } catch (err) {
      console.error(err);
    }
  }, [
    handleSetIsFollowingDecision,
    promptUserWithPushNotificationsPermissionModal,
    isFollowingDecision,
    postUuid,
    router,
    userLoggedIn,
  ]);

  return (
    <SContainer>
      <SWrapper>
        <SActionsDiv>
          <SButtonEnabling
            view='transparent'
            iconOnly
            withDim
            withShrink
            onClick={() => handleOpenShareMenu()}
            ref={shareButtonRef}
          >
            <InlineSvg
              svg={ShareIcon}
              fill={theme.colorsThemed.text.secondary}
              width='20px'
              height='20px'
            />
          </SButtonEnabling>
          <SButtonEnabling
            view='transparent'
            iconOnly
            onClick={() => handleOpenEllipseMenu()}
            ref={moreButtonRef}
          >
            <InlineSvg
              svg={MoreIcon}
              fill={theme.colorsThemed.text.secondary}
              width='20px'
              height='20px'
            />
          </SButtonEnabling>
          {/* Share menu */}
          {!isMobile && (
            <PostShareEllipseMenu
              postUuid={postUuid}
              postShortId={postShortId}
              isVisible={shareMenuOpen}
              onClose={handleCloseShareMenu}
              anchorElement={shareButtonRef.current}
            />
          )}
          {isMobile && shareMenuOpen ? (
            <PostShareEllipseModal
              isOpen={shareMenuOpen}
              zIndex={11}
              postUuid={postUuid}
              postShortId={postShortId}
              onClose={handleCloseShareMenu}
            />
          ) : null}
          {/* Ellipse menu */}
          {!isMobile && (
            <PostEllipseMenu
              postType={postType as TPostType}
              isFollowingDecision={isFollowingDecision}
              isVisible={ellipseMenuOpen}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              onClose={handleCloseEllipseMenu}
              anchorElement={moreButtonRef.current}
            />
          )}
          {isMobile && ellipseMenuOpen ? (
            <PostEllipseModal
              postType={postType as TPostType}
              isFollowingDecision={isFollowingDecision}
              zIndex={11}
              isOpen={ellipseMenuOpen}
              handleFollowDecision={handleFollowDecision}
              handleReportOpen={handleReportOpen}
              onClose={handleCloseEllipseMenu}
            />
          ) : null}
        </SActionsDiv>
      </SWrapper>
    </SContainer>
  );
};

export default PostSuccessOrWaitingControls;

const SContainer = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 0px;
    margin-bottom: 0px;
    padding-right: 16px;
  }
`;

const SWrapper = styled.div``;

const SActionsDiv = styled.div`
  position: relative;

  display: flex;
  justify-content: flex-end;
`;

const SButtonEnabling = styled(Button)`
  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  margin-left: 4px;
  padding: 8px;

  &:focus:enabled {
    background: ${({ theme, view }) =>
      view ? theme.colorsThemed.button.background[view] : ''};
  }
`;
