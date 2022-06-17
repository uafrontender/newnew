/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Caption from '../../atoms/Caption';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import assets from '../../../constants/assets';
import {
  clearCreation,
  clearPostData,
} from '../../../redux-store/slices/creationStateSlice';

const DARK_IMAGES_ANIMATED: any = {
  auction: assets.creation.darkAcAnimated,
  crowdfunding: assets.creation.darkCfAnimated,
  'multiple-choice': assets.creation.darkMcAnimated,
};

const DARK_IMAGES_STATIC: any = {
  auction: assets.creation.darkAcStatic,
  crowdfunding: assets.creation.darkCfStatic,
  'multiple-choice': assets.creation.darkMcStatic,
};

const LIGHT_IMAGES_ANIMATED: any = {
  auction: assets.creation.lightAcAnimated,
  crowdfunding: assets.creation.lightCfAnimated,
  'multiple-choice': assets.creation.lightMcAnimated,
};

const LIGHT_IMAGES_STATIC: any = {
  auction: assets.creation.lightAcStatic,
  crowdfunding: assets.creation.lightCfStatic,
  'multiple-choice': assets.creation.lightMcStatic,
};

interface IListItem {
  itemKey: string;
}

const ListItem: React.FC<IListItem> = React.memo(({ itemKey }) => {
  const { t } = useTranslation('page-Creation');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const [mouseEntered, setMouseEntered] = useState(false);

  let link = `${router.pathname}/${itemKey}`;

  if (router.query?.referer) {
    link += `?referer=${router.query.referer}`;
  }

  return (
    <Link href={link}>
      <a
        role='button'
        onMouseEnter={() => {
          setMouseEntered(true);
        }}
        onMouseLeave={() => {
          setMouseEntered(false);
        }}
        onClick={() => {
          dispatch(clearCreation({}));
          dispatch(clearPostData({}));
        }}
        onKeyUp={(e: any) => {
          if (e.key === 'Enter') {
            dispatch(clearCreation({}));
            dispatch(clearPostData({}));
          }
        }}
      >
        <SWrapper>
          <SContent>
            <STitle variant={1} weight={700}>
              {t(`first-step-${itemKey}-title`)}
            </STitle>
            <SDescription variant={2} weight={600}>
              {t(`first-step-${itemKey}-sub-title`)}
            </SDescription>
          </SContent>
          <SImageWrapper>
            <img
              src={
                isMobile || isTablet || mouseEntered
                  ? theme.name === 'light'
                    ? LIGHT_IMAGES_ANIMATED[itemKey]
                    : DARK_IMAGES_ANIMATED[itemKey]
                  : theme.name === 'light'
                  ? LIGHT_IMAGES_STATIC[itemKey]
                  : DARK_IMAGES_STATIC[itemKey]
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
});

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
    padding: 20px 24px 24px 24px;
  }

  ${(props) => props.theme.media.laptop} {
    img {
      transition: all ease 0.5s;
    }
    :hover {
      transform: translateY(-12px);
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
  margin-top: 18px;

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
    top: -100px;
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    min-width: 120px;
    min-height: 120px;
  }
`;
