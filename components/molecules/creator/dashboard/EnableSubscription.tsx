import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { newnewapi } from 'newnew-api';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import emptyFolder from '../../../../public/images/notifications/no-results.png';
import { getMyOnboardingState } from '../../../../api/endpoints/user';

export const EnableSubscription = () => {
  const { t } = useTranslation('creator');

  const [onboardingState, setOnboardingState] =
    useState<newnewapi.GetMyOnboardingStateResponse>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchOnboardingState() {
      if (isLoading) return;
      try {
        setIsLoading(false);
        const payload = new newnewapi.EmptyRequest({});
        const res = await getMyOnboardingState(payload);

        if (res.data) {
          setOnboardingState(res.data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }

    fetchOnboardingState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SContainer>
      <Image
        src={emptyFolder}
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
            onboardingState?.isCreatorConnectedToStripe
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
  margin-top: 16px;

  background: ${(props) => props.theme.colorsThemed.accent.yellow};
  color: #2c2c33;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-top: 24px;
  }
  &:hover {
    background: ${(props) => props.theme.colorsThemed.accent.yellow} !important;
  }
`;

const SDescriptionWrapper = styled.div`
  margin-top: 8px;

  p {
    display: inline;
  }

  ${(props) => props.theme.media.tablet} {
    margin-top: 12px;
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
