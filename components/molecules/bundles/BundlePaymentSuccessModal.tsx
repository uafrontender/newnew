/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import Modal from '../../organisms/Modal';
import ModalPaper, { SContent } from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import assets from '../../../constants/assets';
import { formatNumber } from '../../../utils/format';
import BulletLine from './BulletLine';
import Button from '../../atoms/Button';
import AnimatedBackground from '../../atoms/AnimationBackground';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import InlineSvg from '../../atoms/InlineSVG';
import getDisplayname from '../../../utils/getDisplayname';
import getBundleOfferLevel from '../../../utils/getCurrentBundleLevel';

interface IBuyBundleModal {
  show: boolean;
  creator: newnewapi.IUser;
  bundleOffer: newnewapi.IBundleOffer;
  zIndex?: number;
  onClose: () => void;
}

const BundlePaymentSuccessModal: React.FC<IBuyBundleModal> = React.memo(
  ({ show, creator, bundleOffer, zIndex, onClose }) => {
    const { t } = useTranslation('common');
    const theme = useTheme();

    const daysOfAccess = bundleOffer.accessDurationInSeconds! / 60 / 60 / 24;
    const monthsOfAccess = Math.floor(daysOfAccess / 30);

    const unitOfTimeLeft = monthsOfAccess > 1 ? 'months' : 'month';

    const bundleOfferLevel = getBundleOfferLevel(bundleOffer.votesAmount!);

    return (
      <>
        <Modal show={show} additionalz={zIndex} onClose={onClose} overlaydim>
          <AnimatedBackground src={assets.decision.votes} alt='vote' />
          <SModalPaper onClose={onClose}>
            <Content>
              <SBundleIcon
                src={
                  theme.name === 'light'
                    ? assets.bundles.lightVotes[bundleOfferLevel].animated()
                    : assets.bundles.darkVotes[bundleOfferLevel].animated()
                }
                alt='Bundle votes'
              />
              <SVotesAvailable>
                <Trans
                  t={t}
                  i18nKey='modal.buyBundleSuccess.votes'
                  // @ts-ignore
                  components={[
                    <VotesNumberSpan />,
                    {
                      amount: formatNumber(
                        bundleOffer.votesAmount as number,
                        true
                      ),
                    },
                  ]}
                />
              </SVotesAvailable>
              <SUserInfo>
                <SUserAvatar avatarUrl={creator?.avatarUrl ?? ''} />
                <SUsername>
                  <Trans
                    t={t}
                    i18nKey='modal.buyBundleSuccess.for'
                    // @ts-ignore
                    components={[
                      <SLink href={`/${creator?.username}`} />,
                      { creator: getDisplayname(creator) },
                    ]}
                  />
                  {creator.options?.isVerified && (
                    <InlineSvg
                      svg={VerificationCheckmark}
                      width='24px'
                      height='24px'
                      fill='none'
                    />
                  )}
                </SUsername>
              </SUserInfo>
              <SBundleInfo>
                <AccessDescription>
                  {t('modal.buyBundleSuccess.access', {
                    amount: monthsOfAccess,
                    unit: t(`modal.buyBundleSuccess.unit.${unitOfTimeLeft}`),
                  })}
                </AccessDescription>
                <BulletLine>
                  {t('modal.buyBundleSuccess.customOptions')}
                </BulletLine>
                <BulletLine>{t('modal.buyBundleSuccess.chat')}</BulletLine>
              </SBundleInfo>
              <SDoneButton id='bundleSuccess' onClick={onClose}>
                {t('modal.buyBundleSuccess.button')}
              </SDoneButton>
            </Content>
          </SModalPaper>
        </Modal>
      </>
    );
  }
);

export default BundlePaymentSuccessModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;
  padding: 24px;
  margin: 16px;

  ${SContent} {
    padding: 24px;
    margin: -24px;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: 32px;
    max-width: 500px;

    ${SContent} {
      padding: 32px;
      margin: -32px;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SBundleIcon = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 30px;
`;

const SVotesAvailable = styled.h2`
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 32px;
  line-height: 40px;
  font-weight: 700;

  margin-bottom: 24px;
  text-align: center;
`;

const VotesNumberSpan = styled.span`
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.accent.yellow};
`;

const SUserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  margin-right: 8px;
`;

const SUsername = styled.div`
  display: inline-flex;
  align-items: center;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  white-space: pre;
`;

const SLink = styled.a`
  color: ${(props) => props.theme.colorsThemed.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SBundleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px 24px;
  margin-bottom: 30px;
  border: 1px solid;
  border-radius: 16px;
  border-color: ${({ theme }) => theme.colors.darkGray};
`;

const AccessDescription = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 4px;
`;

const SDoneButton = styled(Button)`
  width: fit-content;
  min-width: 140px;

  margin-left: auto;
  margin-right: auto;
`;
