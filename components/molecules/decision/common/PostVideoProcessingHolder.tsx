/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../../atoms/Text';
import Headline from '../../../atoms/Headline';
import assets from '../../../../constants/assets';

interface IPostVideoProcessingHolder {
  holderText: 'decision' | 'moderation';
}

const PostVideoProcessingHolder: React.FunctionComponent<
  IPostVideoProcessingHolder
> = ({ holderText }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  return (
    <SVideoWrapper>
      <SHourglassCard>
        <SImgContainer>
          <img
            className='hourglass-img'
            src={
              theme.name === 'light'
                ? assets.decision.lightHourglassAnimated()
                : assets.decision.darkHourglassAnimated()
            }
            alt='video is processed'
          />
        </SImgContainer>
        <SHeadline variant={6}>
          {t(`postViewProcessingAnnouncement.videoHolder.${holderText}.title`)}
        </SHeadline>
        <SText variant={3}>
          {t(`postViewProcessingAnnouncement.videoHolder.${holderText}.body`)}
        </SText>
      </SHourglassCard>
    </SVideoWrapper>
  );
};

export default PostVideoProcessingHolder;

const SVideoWrapper = styled.div`
  grid-area: video;

  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;

  width: 100vw;
  height: calc(100vh - 72px);
  margin-left: -16px;

  background-color: ${({ theme }) => theme.colorsThemed.background.quinary};

  ${({ theme }) => theme.media.tablet} {
    width: 284px;
    height: 506px;
    margin-left: initial;

    flex-shrink: 0;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.laptop} {
    width: 410px;
    height: 728px;

    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  }
`;

const SHourglassCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.media.tablet} {
    border-radius: ${({ theme }) => theme.borderRadius.medium};

    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

    padding: 40px 16px;
    max-width: 80%;
  }

  ${({ theme }) => theme.media.laptop} {
    background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

    padding: 40px 24px;
  }
`;

const SImgContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100px;
  height: 120px;

  .hourglass-img {
    width: 100%;
    object-fit: contain;
    position: relative;
    top: -32px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 78px;
    height: 20px;

    justify-self: center;

    margin-bottom: 24px;

    .hourglass-video {
      width: 100%;
      height: 90px;
      object-fit: contain;
      position: absolute;

      top: -350%;
    }
  }
`;

const SHeadline = styled(Headline)`
  text-align: center;
`;

const SText = styled(Text)`
  text-align: center;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  max-width: 90%;
`;
