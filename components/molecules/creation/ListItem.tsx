/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Caption from '../../atoms/Caption';

import { useAppSelector } from '../../../redux-store/store';
import assets from '../../../constants/assets';

const IMAGES: any = {
  auction: assets.creation.AcAnimated,
  crowdfunding: assets.creation.CfAnimated,
  'multiple-choice': assets.creation.McAnimated,
};

const IMAGES_STATIC: any = {
  auction: assets.creation.AcStatic,
  crowdfunding: assets.creation.CfStatic,
  'multiple-choice': assets.creation.McStatic,
};

interface IListItem {
  item: {
    key: string;
  };
}

export const ListItem: React.FC<IListItem> = (props) => {
  const { item } = props;
  const { t } = useTranslation('creation');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const [mouseEntered, setMouseEntered] = useState(false);

  let link = `${router.pathname}/${item.key}`;

  if (router.query?.referer) {
    link += `?referer=${router.query.referer}`;
  }

  return (
    <Link href={link}>
      <a
        onMouseEnter={() => {
          setMouseEntered(true);
        }}
        onMouseLeave={() => {
          setMouseEntered(false);
        }}
      >
        <SWrapper>
          <SContent>
            <STitle variant={1} weight={700}>
              {t(`first-step-${item.key}-title`)}
            </STitle>
            <SDescription variant={2} weight={600}>
              {t(`first-step-${item.key}-sub-title`)}
            </SDescription>
          </SContent>
          <SImageWrapper>
            <img
              src={
                isMobile || isTablet
                  ? IMAGES[item.key]
                  : mouseEntered
                  ? IMAGES[item.key]
                  : IMAGES_STATIC[item.key]
              }
              alt='Post type'
              width={isMobile ? 80 : 120}
              height={isMobile ? 80 : 120}
              style={{ objectFit: 'contain' }}
            />
          </SImageWrapper>
        </SWrapper>
      </a>
    </Link>
  );
};

export default ListItem;

const SWrapper = styled.div`
  width: 100%;
  cursor: pointer;
  padding: 16px;
  display: flex;
  position: relative;
  transition: all ease 0.5s;
  align-items: center;
  border-radius: 16px;
  flex-direction: row;
  justify-content: center;
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};

  :hover {
    background-color: ${(props) => props.theme.colorsThemed.background.quinary};
  }

  ${(props) => props.theme.media.tablet} {
    padding: 44px 24px 24px 24px;
  }

  ${(props) => props.theme.media.laptop} {
    img {
      transition: all ease 0.5s;
      filter: grayscale(1);
    }
    :hover {
      transform: translateY(-12px);
      img {
        filter: grayscale(0);
      }
    }
  }
`;

const SContent = styled.div`
  width: calc(100% - 90px);
  display: flex;
  padding-right: 24px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    width: 100%;
    align-items: center;
    padding-right: unset;
  }
`;

const STitle = styled(Caption)`
  margin-bottom: 4px;

  ${(props) => props.theme.media.tablet} {
    text-align: center;
    margin-bottom: 8px;
  }
`;

const SDescription = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};

  ${(props) => props.theme.media.tablet} {
    text-align: center;
  }
`;

const SImageWrapper = styled.div`
  min-width: 80px;
  min-height: 80px;

  ${(props) => props.theme.media.tablet} {
    top: -77px;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    min-width: 120px;
    min-height: 120px;
  }
`;
