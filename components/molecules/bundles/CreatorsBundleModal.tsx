/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';
import { useRouter } from 'next/router';

import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import assets from '../../../constants/assets';
import formatTimeLeft from '../../../utils/formatTimeLeft';
import BulletLine from './BulletLine';
import { formatNumber } from '../../../utils/format';
import HighlightedButton from '../../atoms/bundles/HighlightedButton';
import InlineSvg from '../../atoms/InlineSVG';
import VerificationCheckmark from '../../../public/images/svg/icons/filled/Verification.svg';
import getDisplayname from '../../../utils/getDisplayname';

interface ICreatorsBundleModal {
  show: boolean;
  creatorBundle: newnewapi.ICreatorBundle;
  onBuyMore: () => void;
  onClose: () => void;
}

const CreatorsBundleModal: React.FC<ICreatorsBundleModal> = React.memo(
  ({ show, creatorBundle, onBuyMore, onClose }) => {
    const { t } = useTranslation('common');
    const router = useRouter();

    const timeLeft =
      (creatorBundle.bundle!.accessExpiresAt!.seconds as number) * 1000 -
      Date.now();
    const formattedTimeLeft = formatTimeLeft(timeLeft);

    return (
      <>
        <Modal show={show} onClose={onClose}>
          <SModalPaper
            onClose={onClose}
            onClick={preventParentClick()}
            isCloseButton
          >
            <Content>
              <BundleIcon src={assets.common.vote} alt='votes' />
              <SVotesAvailable>
                <Trans
                  t={t}
                  i18nKey='modal.creatorsBundle.votesLeft'
                  // @ts-ignore
                  components={[
                    <VotesNumberSpan />,
                    {
                      amount: formatNumber(
                        creatorBundle?.bundle?.votesLeft as number,
                        true
                      ),
                    },
                  ]}
                />
              </SVotesAvailable>
              <SUserInfo>
                <SUserAvatar
                  avatarUrl={creatorBundle?.creator?.avatarUrl ?? ''}
                />
                <SForLine>
                  {t('modal.creatorsBundle.for')}
                  <Link href={`/${creatorBundle?.creator?.username}`}>
                    <SUserName
                      onClick={() => {
                        if (
                          router.asPath ===
                          `/${creatorBundle?.creator?.username}`
                        ) {
                          onClose();
                        }
                      }}
                    >
                      {getDisplayname(creatorBundle?.creator)}
                    </SUserName>
                  </Link>
                  {creatorBundle?.creator?.options?.isVerified && (
                    <SInlineSvg
                      svg={VerificationCheckmark}
                      width='24px'
                      height='24px'
                      fill='none'
                    />
                  )}
                </SForLine>
              </SUserInfo>
              <SBundleInfo>
                <AccessDescription>
                  <Trans
                    t={t}
                    i18nKey='modal.creatorsBundle.access'
                    // @ts-ignore
                    components={[
                      <>
                        {formattedTimeLeft.map((time, index) => (
                          <>
                            {index > 0 ? t('modal.creatorsBundle.and') : null}
                            {t('modal.creatorsBundle.unitPair', {
                              amount: time.value,
                              unit: t(`modal.creatorsBundle.unit.${time.unit}`),
                            })}
                          </>
                        ))}
                      </>,
                    ]}
                  />
                </AccessDescription>
                <BulletLine>
                  {t('modal.creatorsBundle.customOptions')}
                </BulletLine>
                <BulletLine>{t('modal.creatorsBundle.chat')}</BulletLine>
              </SBundleInfo>
              <BuyButton onClick={onBuyMore}>
                {t('modal.creatorsBundle.buyButton')}
              </BuyButton>
            </Content>
          </SModalPaper>
        </Modal>
      </>
    );
  }
);

export default CreatorsBundleModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;
  padding: 32px 48px;

  ${({ theme }) => theme.media.tablet} {
    max-width: 500px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BundleIcon = styled.img`
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

const SForLine = styled.p`
  display: inline-flex;
  white-space: pre;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const SUserName = styled.p`
  cursor: pointer;
  color: ${(props) => props.theme.colorsThemed.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SInlineSvg = styled(InlineSvg)`
  margin-left: 2px;
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

const BuyButton = styled(HighlightedButton)`
  font-size: 14px;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
  }
`;
