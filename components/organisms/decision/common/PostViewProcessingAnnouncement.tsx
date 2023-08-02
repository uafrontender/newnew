import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { usePostInnerState } from '../../../../contexts/postInnerContext';
import Text from '../../../atoms/Text';
import PostTopInfo from '../../../molecules/decision/common/PostTopInfo';
import PostTopInfoModeration from '../../../molecules/decision/moderation/PostTopInfoModeration';
import PostVideoProcessingHolder from '../../../molecules/decision/common/PostVideoProcessingHolder';

import assets from '../../../../constants/assets';
import { useAppState } from '../../../../contexts/appStateContext';
// import { SubscriptionToPost } from '../../../molecules/profile/SmsNotificationModal';

const GoBackButton = dynamic(() => import('../../../molecules/GoBackButton'));

const DARK_IMAGES: Record<string, () => string> = {
  ac: assets.common.mc.darkMcAnimated,
  // TODO: light votes version? why not animated?
  // mc: assets.common.ac.darkAcAnimated,
  mc: () => assets.decision.votes,
  cf: assets.creation.darkCfAnimated,
};

const LIGHT_IMAGES: Record<string, () => string> = {
  ac: assets.common.mc.lightMcAnimated,
  // TODO: light votes version? why not animated?
  // mc: assets.common.ac.lightAcAnimated,
  mc: () => assets.decision.votes,
  cf: assets.creation.lightCfAnimated,
};
interface IPostViewProcessingAnnouncement {
  variant: 'decision' | 'moderation';
}

// TODO: memorize
const PostViewProcessingAnnouncement: React.FunctionComponent<
  IPostViewProcessingAnnouncement
> = ({ variant }) => {
  const { t } = useTranslation('page-Post');
  const theme = useTheme();
  const { resizeMode, userUuid, userLoggedIn } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const { postParsed, typeOfPost, handleGoBackInsidePost } =
    usePostInnerState();
  const post = useMemo(
    () =>
      postParsed as
        | newnewapi.Auction
        | newnewapi.Crowdfunding
        | newnewapi.MultipleChoice,
    [postParsed]
  );

  /* const subscription: SubscriptionToPost = useMemo(
    () => ({
      type: 'post',
      postUuid: post.postUuid,
      postTitle: post.title,
    }),
    [post]
  ); */

  return (
    <SWrapper>
      {isMobile && (
        <SExpiresSection>
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBackInsidePost}
          />
        </SExpiresSection>
      )}
      <PostVideoProcessingHolder
        holderText={
          userLoggedIn && userUuid === post.postUuid ? 'moderation' : 'decision'
        }
      />
      {isMobile &&
        (variant === 'decision' ? (
          <PostTopInfo /* subscription={subscription} */ hasWinner={false} />
        ) : (
          <PostTopInfoModeration hasWinner={false} />
        ))}
      <SActivitiesContainer>
        <div
          style={{
            flex: '0 0 auto',
            width: '100%',
          }}
        >
          {!isMobile &&
            (variant === 'decision' ? (
              <PostTopInfo
                /* subscription={subscription} */ hasWinner={false}
              />
            ) : (
              <PostTopInfoModeration hasWinner={false} />
            ))}
        </div>
        <div
          style={{
            flex: '1 1 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SDecisionImage
            src={
              theme.name === 'light'
                ? /* @ts-ignore */
                  LIGHT_IMAGES[typeOfPost]()
                : /* @ts-ignore */
                  DARK_IMAGES[typeOfPost]()
            }
          />
          <SText variant={2} weight={600}>
            {typeOfPost
              ? t(`postViewProcessingAnnouncement.stayTuned.${typeOfPost}`)
              : ''}
          </SText>
        </div>
      </SActivitiesContainer>
    </SWrapper>
  );
};

export default PostViewProcessingAnnouncement;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;
    min-height: 0;
    align-items: flex-start;

    display: flex;
    gap: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    display: flex;
    gap: 32px;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'closeBtnMobile timer closeBtnDesktop';

  width: 100%;

  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: none;
    grid-area: unset;
  }
`;

const SActivitiesContainer = styled.div`
  ${({ theme }) => theme.media.tablet} {
    align-items: flex-start;

    display: flex;
    flex-direction: column;
    gap: 16px;

    height: 506px;
    max-height: 506px;
    width: 100%;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
    max-height: 728px;
    width: 100%;
  }
`;

const SDecisionImage = styled.img`
  width: 140px;
`;

const SText = styled(Text)`
  margin-top: 8px;

  text-align: center;
  white-space: pre;
`;
