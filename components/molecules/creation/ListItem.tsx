import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Caption from '../../atoms/Caption';

import { useAppSelector } from '../../../redux-store/store';

import acImage from '../../../public/images/creation/AC.png';
import mcImage from '../../../public/images/creation/MC.png';
import cfImage from '../../../public/images/creation/CF.png';

const IMAGES: any = {
  auction: acImage,
  crowdfunding: cfImage,
  'multiple-choice': mcImage,
};

interface IListItem {
  item: {
    key: string,
  };
}

export const ListItem: React.FC<IListItem> = (props) => {
  const { item } = props;
  const { t } = useTranslation('creation');
  const router = useRouter();
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  return (
    <Link href={`${router.pathname}/${item.key}`}>
      <a>
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
            <Image
              src={IMAGES[item.key]}
              alt="Post type image"
              width={isMobile ? 80 : 120}
              height={isMobile ? 80 : 120}
              objectFit="cover"
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
  color: ${(props) => props.theme.colorsThemed.text.primary};
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
