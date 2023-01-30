import React from 'react';
import Image from 'next/image';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import UserAvatar from '../UserAvatar';

import { formatNumber } from '../../../utils/format';

export type TStaticPost = {
  coverImageUrl: string;
  avatarUrl: string;
  username: string;
  title: string;
  postType: 'mc' | 'ac' | 'cf';
  totalVotes: number;
  totalAmount: number;
  targetBackerCount: number;
  currentBackerCount: number;
};

interface IStaticPostCardProps {
  width: string;
  maxWidthTablet: string;
  height?: string;
  staticPost: TStaticPost;
}

const StaticPostCard = ({
  width,
  maxWidthTablet,
  height,
  staticPost: {
    coverImageUrl,
    avatarUrl,
    username,
    title,
    postType,
    totalVotes,
    totalAmount,
    targetBackerCount,
    currentBackerCount,
  },
}: IStaticPostCardProps) => {
  const { t } = useTranslation('component-PostCard');

  return (
    <SWrapper width={width} maxWidthTablet={maxWidthTablet ?? undefined}>
      <SImageBG id='backgroundPart' height={height}>
        <SImageHolder id='animatedPart'>
          <SThumnailHolder
            className='thumnailHolder'
            layout='fill'
            src={coverImageUrl ?? ''}
            alt='Post'
            draggable={false}
          />
        </SImageHolder>
      </SImageBG>
      <SBottomContent>
        <SBottomStart>
          <SUserAvatar avatarUrl={avatarUrl} withClick />
          <SUsernameContainer>
            <SUsername variant={2}>{username}</SUsername>
          </SUsernameContainer>
        </SBottomStart>
        <SText variant={3} weight={600}>
          {title}
        </SText>
        <SBottomEnd type={postType}>
          {postType === 'mc' ? (
            <SButton cardType={postType}>
              {t('button.withActivity.mc', {
                votes: formatNumber(totalVotes ?? 0, true),
                total: formatNumber(targetBackerCount ?? 0, true),
                backed: formatNumber(currentBackerCount ?? 0, true),
                amount: `$${formatNumber(totalAmount ?? 0, true)}`,
              })}
            </SButton>
          ) : (
            <SButton
              // view={postType === 'cf' ? 'primaryProgress' : 'primary'}
              cardType={postType}
              // progress={
              //   postType === 'cf'
              //     ? Math.floor((currentBackerCount * 100) / targetBackerCount)
              //     : 0
              // }
              // withProgress={postType === 'cf'}
            >
              {t(`button.withActivity.${postType}`, {
                votes: formatNumber(totalVotes ?? 0, true),
                total: formatNumber(targetBackerCount ?? 0, true),
                backed: formatNumber(currentBackerCount ?? 0, true),
                amount: `$${formatNumber(totalAmount ?? 0, true)}`,
              })}
            </SButton>
          )}
        </SBottomEnd>
      </SBottomContent>
    </SWrapper>
  );
};

export default StaticPostCard;

interface ISWrapper {
  width?: string;
  maxWidthTablet?: string;
}

const SThumnailHolder = styled(Image)``;

const SWrapper = styled.div<ISWrapper>`
  width: ${(props) => props.width};
  display: flex;
  position: relative;
  flex-direction: column;

  /* padding: 10px; */
  padding-top: 10px;
  padding-bottom: 10px;

  border: 1.5px solid;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-color: ${({ theme }) => theme.colorsThemed.background.outlines1};

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    max-width: ${({ maxWidthTablet }) => maxWidthTablet ?? '200px'};

    transition: transform ease 0.5s;
  }

  ${(props) => props.theme.media.laptop} {
    max-width: 224px;
  }
`;

interface ISImageBG {
  height?: string;
}

const SImageBG = styled.div<ISImageBG>`
  width: 100%;
  padding: 70% 0px;
  position: relative;

  ${(props) => props.theme.media.tablet} {
    border-radius: 10px;
  }
`;

const SImageHolder = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  padding: 16px;
  position: absolute;
  transition: all ease 0.5s;

  width: calc(100% - 20px);
  left: 10px;
  padding: 10px;
  overflow: hidden;
  border-radius: 10px;

  ${(props) => props.theme.media.tablet} {
    padding: 12px;
    overflow: hidden;
    border-radius: 10px;
  }

  .thumnailHolder {
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;
    /* z-index: -1; */
  }
`;

const SBottomContent = styled.div`
  padding: 8px 10px 0 10px;
  display: flex;
  flex-direction: column;
`;

const SText = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  display: -webkit-box;
  overflow: hidden;
  position: relative;

  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  margin-bottom: 10px;

  height: 40px;
`;

const SBottomStart = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  height: 24px;

  margin-bottom: 4px;
  overflow: hidden;
`;

const SUserAvatar = styled(UserAvatar)`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;
`;

// Move all styles to here
const SUsernameContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-shrink: 1;
  flex-grow: 1;
  overflow: hidden;
`;

const SUsername = styled(Text)`
  display: inline-block;
  flex-shrink: 1;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  margin-left: 6px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface ISBottomEnd {
  type: 'ac' | 'mc' | 'cf';
}

const SBottomEnd = styled.div<ISBottomEnd>`
  display: flex;
  align-items: ${(props) => (props.type === 'cf' ? 'flex-end' : 'center')};
  flex-direction: ${(props) => (props.type === 'cf' ? 'column' : 'row')};
  justify-content: space-between;

  ${(props) =>
    props.type === 'cf' &&
    css`
      div {
        width: 100%;
      }

      p {
        margin-top: 16px;
      }

      ${props.theme.media.tablet} {
        p {
          margin-top: 12px;
        }
      }
    `}
`;

interface ISButtonSpan {
  cardType: string;
}

const SButton = styled.div<ISButtonSpan>`
  padding: 12px;
  border-radius: 12px;
  width: 100%;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;

  color: ${({ theme }) => theme.colorsThemed.button.color.primary};
  background: ${({ theme }) => theme.colorsThemed.button.background.primary};

  font-weight: 700;
  font-size: 16px;
  line-height: 20px;

  ${(props) =>
    props.cardType === 'cf'
      ? css`
          width: 100%;
          text-align: center;
        `
      : ''}

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;

    font-size: 14px;
  }

  ${(props) => props.theme.media.laptop} {
    font-size: 16px;
  }
`;
