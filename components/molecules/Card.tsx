import React, { useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Text from '../atoms/Text';
import Button from '../atoms/Button';
import Caption from '../atoms/Caption';
import InlineSVG from '../atoms/InlineSVG';
import UserAvatar from './UserAvatar';

import { formatNumber } from '../../utils/format';
import { useAppSelector } from '../../redux-store/store';

import iconLight1 from '../../public/images/svg/numbers/1_light.svg';
import iconLight2 from '../../public/images/svg/numbers/2_light.svg';
import iconLight3 from '../../public/images/svg/numbers/3_light.svg';
import iconLight4 from '../../public/images/svg/numbers/4_light.svg';
import iconLight5 from '../../public/images/svg/numbers/5_light.svg';
import iconLight6 from '../../public/images/svg/numbers/6_light.svg';
import iconLight7 from '../../public/images/svg/numbers/7_light.svg';
import iconLight8 from '../../public/images/svg/numbers/8_light.svg';
import iconLight9 from '../../public/images/svg/numbers/9_light.svg';
import iconLight10 from '../../public/images/svg/numbers/10_light.svg';
import iconDark1 from '../../public/images/svg/numbers/1_dark.svg';
import iconDark2 from '../../public/images/svg/numbers/2_dark.svg';
import iconDark3 from '../../public/images/svg/numbers/3_dark.svg';
import iconDark4 from '../../public/images/svg/numbers/4_dark.svg';
import iconDark5 from '../../public/images/svg/numbers/5_dark.svg';
import iconDark6 from '../../public/images/svg/numbers/6_dark.svg';
import iconDark7 from '../../public/images/svg/numbers/7_dark.svg';
import iconDark8 from '../../public/images/svg/numbers/8_dark.svg';
import iconDark9 from '../../public/images/svg/numbers/9_dark.svg';
import iconDark10 from '../../public/images/svg/numbers/10_dark.svg';
import moreIcon from '../../public/images/svg/icons/filled/More.svg';

const NUMBER_ICONS: any = {
  light: {
    1: iconLight1,
    2: iconLight2,
    3: iconLight3,
    4: iconLight4,
    5: iconLight5,
    6: iconLight6,
    7: iconLight7,
    8: iconLight8,
    9: iconLight9,
    10: iconLight10,
  },
  dark: {
    1: iconDark1,
    2: iconDark2,
    3: iconDark3,
    4: iconDark4,
    5: iconDark5,
    6: iconDark6,
    7: iconDark7,
    8: iconDark8,
    9: iconDark9,
    10: iconDark10,
  },
};

interface ICard {
  item: any;
  type?: 'inside' | 'outside';
  index: number;
  preventClick?: boolean;
  restore?: () => void;
  onMouseDownCapture?: (e: any) => void;
  onMouseLeave?: () => void;
}

export const Card: React.FC<ICard> = (props) => {
  const {
    item,
    type,
    index,
    preventClick,
    restore,
    onMouseDownCapture,
    onMouseLeave,
  } = props;
  const { t } = useTranslation('home');
  const theme = useTheme();
  const router = useRouter();
  const {
    resizeMode,
    colorMode,
  } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isDesktop = !isMobile && resizeMode !== 'tablet';

  const handleUserClick = () => {
    router.push('/profile');
  };
  const handleMoreClick = () => {
    router.push('/post-detailed');
  };
  const handleItemClick = useCallback(() => {
    router.push('/post-detailed');
  }, [router]);
  const handleBidClick = () => {
    router.push('/post-detailed');
  };

  const onClick = useCallback((e) => {
    if (preventClick) {
      e.preventDefault();
      restore?.();
      return;
    }
    handleItemClick();
  }, [handleItemClick, preventClick, restore]);

  if (type === 'inside') {
    return (
      <SWrapper
        index={index}
        onClick={onClick}
        onMouseLeave={onMouseLeave}
        onMouseDownCapture={onMouseDownCapture}
      >
        {!isMobile && (
          <SNumberImageHolder index={index}>
            <InlineSVG
              svg={NUMBER_ICONS[colorMode][index]}
              width="100%"
              height="100%"
            />
          </SNumberImageHolder>
        )}
        <SImageHolder>
          <Image src={item.url} objectFit="cover" layout="fill" draggable={false} />
          <SImageMask />
          <STopContent>
            {!isDesktop && (
              <SButtonIcon iconOnly size="sm" view="transparent" onClick={handleMoreClick}>
                <InlineSVG
                  svg={moreIcon}
                  fill={theme.colors.white}
                  width="20px"
                  height="20px"
                />
              </SButtonIcon>
            )}
          </STopContent>
          <SBottomContent>
            <SUserAvatar user={item.user} withClick onClick={handleUserClick} />
            <SText variant={3}>
              {item.title}
            </SText>
          </SBottomContent>
        </SImageHolder>
      </SWrapper>
    );
  }

  return (
    <SWrapperOutside
      onClick={onClick}
      onMouseLeave={onMouseLeave}
      onMouseDownCapture={onMouseDownCapture}
    >
      <SImageBG id="backgroundPart">
        <SImageHolderOutside id="animatedPart">
          <Image src={item.url} objectFit="cover" layout="fill" draggable={false} />
          <STopContent>
            {!isDesktop && (
              <SButtonIcon iconOnly size="sm" view="transparent" onClick={handleMoreClick}>
                <InlineSVG
                  svg={moreIcon}
                  fill={theme.colors.white}
                  width="20px"
                  height="20px"
                />
              </SButtonIcon>
            )}
          </STopContent>
        </SImageHolderOutside>
      </SImageBG>
      <SBottomContentOutside>
        <SBottomStart>
          <SUserAvatar user={item.user} withClick onClick={handleUserClick} />
          <STextOutside variant={3}>
            {item.title}
          </STextOutside>
        </SBottomStart>
        <SBottomEnd type={item.type}>
          <SButton
            noShadow
            view={item.type === 'cf' ? 'primaryProgress' : 'primary'}
            onClick={handleBidClick}
            cardType={item.type}
            progress={item.type === 'cf' ? (item.backed * 100) / item.total : 0}
            animateProgress={item.type === 'cf'}
          >
            {t(`button-card-${item.type}`, {
              votes: item.votes,
              total: formatNumber(item.total),
              backed: formatNumber(item.backed),
              amount: `$ ${item.amount}`,
            })}
          </SButton>
          <SCaption variant={2}>
            {t('card-time-left', { time: '24h 40m' })}
          </SCaption>
        </SBottomEnd>
      </SBottomContentOutside>
    </SWrapperOutside>
  );
};

export default Card;

Card.defaultProps = {
  type: 'outside',
  preventClick: false,
  restore: () => {
  },
  onMouseDownCapture: () => {
  },
  onMouseLeave: () => {
  },
};

interface ISWrapper {
  index?: number;
}

const SWrapper = styled.div<ISWrapper>`
  width: 254px;
  height: 382px;
  cursor: pointer;
  display: flex;
  position: relative;
  align-items: flex-end;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    width: ${(props) => {
    if (props.index === 1) {
      return '312px';
    }

    if (props.index === 10) {
      return '412px';
    }

    return '342px';
  }};
    height: 320px;
  }

  ${(props) => props.theme.media.laptop} {
    width: ${(props) => {
    if (props.index === 1) {
      return '376px';
    }

    if (props.index === 10) {
      return '496px';
    }

    return '406px';
  }};
    height: 384px;
  }
`;

const SNumberImageHolder = styled.div<ISWrapper>`
  width: 188px;
  height: 240px;
  position: relative;

  ${(props) => props.theme.media.tablet} {
    width: ${(props) => {
    if (props.index === 10) {
      return '306px';
    }

    return '188px';
  }};
    height: 240px;
  }

  ${(props) => props.theme.media.laptop} {
    width: ${(props) => {
    if (props.index === 10) {
      return '358px';
    }

    return '220px';
  }};
    height: 280px;
  }
`;

const SImageHolder = styled.div`
  top: 0;
  right: 0;
  width: 254px;
  height: 100%;
  display: flex;
  padding: 16px;
  z-index: 2;
  overflow: hidden;
  position: absolute;
  flex-direction: column;
  justify-content: space-between;
  border-radius: ${(props) => props.theme.borderRadius.medium};

  ${(props) => props.theme.media.tablet} {
    width: 212px;
  }

  ${(props) => props.theme.media.laptop} {
    width: 256px;
  }
`;

const SImageMask = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  position: absolute;
  background: linear-gradient(180deg, rgba(11, 10, 19, 0) 49.87%, rgba(11, 10, 19, 0.8) 100%);
  border-radius: ${(props) => props.theme.borderRadius.medium};
  pointer-events: none;
`;

const STopContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const SBottomContent = styled.div`
  z-index: 2;
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SText = styled(Text)`
  color: ${(props) => props.theme.colors.white};
  display: -webkit-box;
  overflow: hidden;
  margin-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SWrapperOutside = styled.div<ISWrapper>`
  width: 100vw;
  cursor: pointer;
  display: flex;
  position: relative;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    width: 200px;

    :hover {
      #animatedPart {
        transform: translate(10px, -10px);
      }

      #backgroundPart:before {
        transform: rotate(-45deg) scale(1);
      }

      #backgroundPart:after {
        transform: rotate(45deg) scale(1);
      }
    }
  }

  ${(props) => props.theme.media.laptop} {
    width: 224px;
  }
`;

const SImageBG = styled.div`
  width: 100%;
  height: 564px;
  position: relative;
  background-color: ${(props) => props.theme.colorsThemed.accent.blue};

  ${(props) => props.theme.media.tablet} {
    height: 300px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }

  ${(props) => props.theme.media.laptop} {
    height: 336px;
  }

  &:before,
  &:after {
    width: 10px;
    height: 10px;
    content: '';
    display: block;
    position: absolute;
    transition: all .4s ease;
    background-color: ${(props) => props.theme.colorsThemed.accent.blue};
  }

  &:before {
    top: 3px;
    left: 6px;
    transform: rotate(-45deg) scale(0);
    transform-origin: top left;
  }

  &:after {
    right: 3px;
    bottom: 6px;
    z-index: 0;
    transform: rotate(45deg) scale(0);
    transform-origin: bottom right;
  }
`;

const SImageHolderOutside = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  padding: 16px;
  position: absolute;
  transition: all ease 0.5s;

  ${(props) => props.theme.media.tablet} {
    overflow: hidden;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SBottomContentOutside = styled.div`
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    padding: 14px 0 0;
  }
`;

const STextOutside = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  display: -webkit-box;
  overflow: hidden;
  margin-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SBottomStart = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-direction: row;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 14px;
  }
`;

interface ISBottomEnd {
  type: 'ac' | 'mc' | 'cf',
}

const SBottomEnd = styled.div<ISBottomEnd>`
  display: flex;
  align-items: ${(props) => (props.type === 'cf' ? 'flex-end' : 'center')};
  flex-direction: ${(props) => (props.type === 'cf' ? 'column' : 'row')};
  justify-content: space-between;

  ${(props) => props.type === 'cf' && css`
    button {
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
  cardType: string,
}

const SButton = styled(Button)<ISButtonSpan>`
  padding: 12px;
  border-radius: 12px;
  
  span {
    font-size: 12px;
    line-height: 16px;
    
    ${(props) => (props.cardType === 'cf' ? css`
      width: 100%;
      text-align: left;
    ` : '')}
  }

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;
  }
`;

const SCaption = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SUserAvatar = styled(UserAvatar)`
  ${(props) => props.theme.media.tablet} {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
  }
`;

const SButtonIcon = styled(Button)`
  border-radius: 12px;
`;
