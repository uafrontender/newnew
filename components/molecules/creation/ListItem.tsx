/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import Link from 'next/link';
import styled, { useTheme } from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Caption from '../../atoms/Caption';

import assets from '../../../constants/assets';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';
import { usePostCreationState } from '../../../contexts/postCreationContext';

const DARK_IMAGES_ANIMATED: Record<string, () => string> = {
  auction: assets.common.ac.darkAcAnimated,
  crowdfunding: assets.creation.darkCfAnimated,
  'multiple-choice': assets.common.mc.darkMcAnimated,
};

const DARK_IMAGES_STATIC: any = {
  auction: assets.common.ac.darkAcStatic,
  crowdfunding: assets.creation.darkCfStatic,
  'multiple-choice': assets.common.mc.darkMcStatic,
};

const LIGHT_IMAGES_ANIMATED: Record<string, () => string> = {
  auction: assets.common.ac.lightAcAnimated,
  crowdfunding: assets.creation.lightCfAnimated,
  'multiple-choice': assets.common.mc.lightMcAnimated,
};

const LIGHT_IMAGES_STATIC: any = {
  auction: assets.common.ac.lightAcStatic,
  crowdfunding: assets.creation.lightCfStatic,
  'multiple-choice': assets.common.mc.lightMcStatic,
};

interface IListItem {
  itemKey: string;
}

const ListItem: React.FC<IListItem> = React.memo(({ itemKey }) => {
  const { t } = useTranslation('page-Creation');
  const theme = useTheme();
  const router = useRouter();
  const { clearCreation, clearPostData } = usePostCreationState();
  const { resizeMode } = useAppState();
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
        id={itemKey}
        role='button'
        onMouseEnter={() => {
          setMouseEntered(true);
        }}
        onMouseLeave={() => {
          setMouseEntered(false);
        }}
        onClick={() => {
          Mixpanel.track('Post Type Selected', {
            _stage: 'Creation',
            _postType: itemKey,
          });

          clearCreation();

          clearPostData();
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            clearCreation();

            clearPostData();
          }
        }}
      >
        <SWrapper>
          <SContent>
            <STitle variant={1} weight={700}>
              {t(`first-step-${itemKey}-title` as any)}
            </STitle>
            <SDescription variant={2} weight={600}>
              {t(`first-step-${itemKey}-sub-title` as any)}
            </SDescription>
          </SContent>
          <SImageWrapper>
            <img
              src={
                isMobile || isTablet || mouseEntered
                  ? theme.name === 'light'
                    ? LIGHT_IMAGES_ANIMATED[itemKey]()
                    : DARK_IMAGES_ANIMATED[itemKey]()
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

  @media (hover: hover) {
    :hover {
      background-color: ${(props) =>
        props.theme.colorsThemed.background.quinary};
    }
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
