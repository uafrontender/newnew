/* eslint-disable no-nested-ternary */
import React, { useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import PostCard, {
  SUserAvatarOutside,
  SBottomStart,
  STextOutside,
  SUsername,
  SButton,
  SButtonFirst,
} from '../../molecules/PostCard';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

import { formatString } from '../../../utils/format';

import switchPostType from '../../../utils/switchPostType';
import { CardSkeletonSection } from '../../molecules/CardSkeleton';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

interface ICardSection {
  user?: {
    avatarUrl: string;
    username: string;
  };
  type?: 'default' | 'creator';
  title?: string;
  category: string;
  collection: newnewapi.IPost[];
  loading?: boolean;
  seeMoreLink?: string;
  padding?: 'small' | 'large';
  onReachEnd?: () => void;
}

export const CardsSection: React.FC<ICardSection> = React.memo(
  ({
    user,
    type,
    title,
    category,
    collection,
    loading,
    seeMoreLink,
    onReachEnd,
    ...restProps
  }) => {
    const { t } = useTranslation('page-Home');
    const router = useRouter();
    const ref: any = useRef();

    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);
    const isLaptop = ['laptop'].includes(resizeMode);
    // const isDesktop = ['laptopL'].includes(resizeMode);

    const renderShowMore = useMemo(() => {
      if (isMobile && collection?.length > 3) {
        return false;

        // TODO:temporary see more is hided
        // return true;
      }

      return false;
    }, [isMobile, collection?.length]);

    const renderItem = (item: any, index: number) => (
      <Link
        href={`/p/${
          switchPostType(item)[0].postShortId
            ? switchPostType(item)[0].postShortId
            : switchPostType(item)[0].postUuid
        }`}
        key={switchPostType(item)[0].postUuid}
      >
        <SItemWrapper name={`cards-section-${category}-${index}`}>
          <SPostCard
            item={item}
            index={index}
            height={isMobile ? '564px' : isTablet ? '412px' : '596px'}
            maxWidthTablet='224px'
          />
        </SItemWrapper>
      </Link>
    );

    const handleSeeMoreClick = () => {
      Mixpanel.track('See More in Category Clicked');
      if (type === 'default' && seeMoreLink) {
        router.push(seeMoreLink);
      }
    };

    // Try to pre-fetch the content
    useEffect(() => {
      if (seeMoreLink) {
        router.prefetch(seeMoreLink);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <SWrapper name={category} {...restProps}>
        <STopWrapper>
          <SDefaultHeadline variant={3} animation='t-01'>
            {title}
          </SDefaultHeadline>
        </STopWrapper>
        <SListContainer ref={ref}>
          <SListWrapper id={`${category}-scrollContainer`}>
            {!loading ? (
              collection?.map(renderItem)
            ) : (
              <SCardSkeletonSection
                count={!isMobile ? (isLaptop || isTablet ? 3 : 4) : 1}
              />
            )}
          </SListWrapper>
        </SListContainer>
        {renderShowMore && type === 'default' && (
          <SButtonHolder>
            <Button size='lg' view='secondary' onClick={handleSeeMoreClick}>
              {t(
                type === 'default' || isMobile
                  ? 'cardsSection.button.showMore'
                  : 'cardsSection.button.showMoreCreator',
                { name: formatString(user?.username, true) }
              )}
            </Button>
          </SButtonHolder>
        )}
      </SWrapper>
    );
  }
);

export default CardsSection;

CardsSection.defaultProps = {
  type: 'default',
  user: {
    avatarUrl: '',
    username: '',
  },
  title: '',
  loading: undefined,
};

interface ISWrapper {
  name: string;
  padding?: 'small' | 'large';
}

const SWrapper = styled.section<ISWrapper>`
  padding: 20px 0;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    margin: 0 -32px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: ${({ padding }) => (padding === 'small' ? '40px 0' : '60px 0')};
    margin: 0;
  }

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin: 0 auto;
  }
`;

const SListContainer = styled.div`
  position: relative;
`;

const SListWrapper = styled.div`
  width: 100%;
  cursor: grab;
  display: flex;
  padding: 8px 0 0 0;

  position: relative;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    /* padding: 24px 24px 0 24px; */
    /* padding: 32px 56px 0 64px; */
    padding: 24px 32px 0 32px;
    width: calc(100% + 16px);
    left: -8px;

    flex-direction: row;
    flex-wrap: wrap;
  }

  ${(props) => props.theme.media.laptop} {
    left: -16px;
    width: calc(100% + 32px);
    padding: 16px 0 0 0;
  }

  ${(props) => props.theme.media.laptopL} {
    width: calc(100% + 32px);
  }
`;

const SCardSkeletonSection = styled(CardSkeletonSection)`
  &&& {
    & > span {
      width: 100%;
      margin: 16px 0;
      gap: 0;
      left: 0;

      ${({ theme }) => theme.media.tablet} {
        margin: 0;
        gap: 16px;
        left: 8px;
      }

      ${({ theme }) => theme.media.laptop} {
        gap: 32px;
        left: 16px;
      }
    }
  }

  & > span > div {
    width: calc(100vw - 32px);
    height: 584px;

    ${({ theme }) => theme.media.tablet} {
      width: 224px;
      height: 414px;
    }

    ${({ theme }) => theme.media.laptop} {
      width: calc((100% - 32px * 3) / 3);
      max-width: calc((100% - 32px * 3) / 3);
      height: 454px;
    }

    ${(props) => props.theme.media.laptopM} {
      width: calc((100% - 32px * 4) / 4);
    }

    ${(props) => props.theme.media.laptopL} {
      width: calc((100% - 32px * 4) / 4);
      height: 592px;
    }
  }
`;

interface ISItemWrapper {
  name: string;
}

const SItemWrapper = styled.div<ISItemWrapper>`
  margin: 16px 0;

  & > div > div:first-child {
    padding: 73.6% 0px;
  }

  ${(props) => props.theme.media.tablet} {
    width: calc((100% - 16px * 3) / 3);
    margin: 8px;

    & > div > div:first-child {
      padding: 61% 0px;
    }
  }

  ${(props) => props.theme.media.laptop} {
    width: calc((100% - 32px * 3) / 3);
    margin: 16px;
  }

  ${(props) => props.theme.media.laptopM} {
    width: calc((100% - 32px * 4) / 4);
  }

  ${(props) => props.theme.media.laptopL} {
    width: calc((100% - 32px * 4) / 4);

    & > div > div:first-child {
      padding: 74% 0px;
    }

    ${SUserAvatarOutside} {
      width: 30px;
      height: 30px;
    }

    ${SBottomStart} {
      height: 30px;
    }

    ${STextOutside} {
      height: 48px;

      font-size: 16px;
      line-height: 24px;
    }

    ${SUsername} {
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
    }

    ${SButton}, ${SButtonFirst} {
      height: 48px;

      border-radius: ${({ theme }) => theme.borderRadius.medium};
    }
  }
`;

const SPostCard = styled(PostCard)`
  width: 100%;
  max-width: 100%;
  min-width: 100%;
`;

const SButtonHolder = styled.div`
  display: flex;
  position: relative;
  margin-top: 8px;
  align-items: center;
  justify-content: center;

  button {
    width: 100%;
  }
`;

const STopWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${(props) => props.theme.media.tablet} {
    padding: 0 32px;
  }

  ${(props) => props.theme.media.laptop} {
    padding: initial;
    margin-bottom: initial;
  }
`;

const SDefaultHeadline = styled(Headline)`
  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 40px;
    line-height: 48px;
  }
`;
