import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import emptyFolder from '../../../../public/images/dashboard/turnon-sub.png';
import { useAppSelector } from '../../../../redux-store/store';

export const EnableSubscription = () => {
  const { t } = useTranslation('creator');
  const user = useAppSelector((state) => state.user);

  return (
    <SContainer>
      <img
        src={emptyFolder.src}
        alt={t('dashboard.enableSubscription.title')}
        width={176}
        height={176}
      />
      <SContent>
        <STitle variant={6}>{t('dashboard.enableSubscription.title')}</STitle>
        <SDescriptionWrapper>
          <SDescription variant={3} weight={600}>
            {t('dashboard.enableSubscription.description')}
          </SDescription>
        </SDescriptionWrapper>
        <Link
          href={
            user.creatorData?.options?.isCreatorConnectedToStripe
              ? '/creator/subscribers/edit-subscription-rate'
              : '/creator/get-paid'
          }
        >
          <a>
            <SButton>{t('dashboard.enableSubscription.submit')}</SButton>
          </a>
        </Link>
      </SContent>
    </SContainer>
  );
};

export default EnableSubscription;

const SContainer = styled.div`
  padding: 16px;
  display: flex;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.primary
      : props.theme.colorsThemed.background.secondary};
  align-items: center;
  border-radius: 16px;
  flex-direction: column;
  justify-content: center;

  ${(props) => props.theme.media.tablet} {
    padding: 18px 24px 18px 32px;
    flex-direction: row-reverse;
    justify-content: space-between;
  }
`;

const SContent = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    width: 100%;
    max-width: calc(100% - 222px);
    align-items: flex-start;
  }
`;

const STitle = styled(Headline)`
  margin-top: 16px;
  font-weight: 600;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;
  background: ${(props) => props.theme.colorsThemed.accent.yellow};
  color: #2c2c33;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
  }
  &:enabled,
  &:hover {
    background: ${(props) => props.theme.colorsThemed.accent.yellow} !important;
  }
`;

const SDescriptionWrapper = styled.div`
  margin-top: 8px;
  padding-bottom: 16px;
  p {
    display: inline;
  }

  ${(props) => props.theme.media.tablet} {
    margin-top: 12px;
    padding-bottom: 24px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: 8px;
  }
`;

const SDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

// const SLearnMore = styled.p`
//   color: ${(props) => props.theme.colorsThemed.text.secondary};
//   cursor: pointer;
//   font-size: 14px;
//   line-height: 24px;
//   margin-left: 5px;
// `;
