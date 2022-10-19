/* eslint-disable react/no-array-index-key */
import React from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import assets from '../../../constants/assets';
import formatTimeLeft from '../../../utils/formatTimeLeft';
import BulletLine from './BulletLine';
import { splitNumber } from '../../../utils/format';

interface ICreatorsBundleModal {
  show: boolean;
  creatorsBundle: newnewapi.ICreatorBundle;
  onBuyMore: () => void;
  onClose: () => void;
}

const CreatorsBundleModal: React.FC<ICreatorsBundleModal> = React.memo(
  ({ show, creatorsBundle, onBuyMore, onClose }) => {
    const { t } = useTranslation('common');

    const timeLeft =
      (creatorsBundle.bundle!.accessExpiresAt!.seconds as number) * 1000 -
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
                  i18nKey='modal.creatorsBundleModal.votesLeft'
                  // @ts-ignore
                  components={[
                    <VotesNumberSpan />,
                    { amount: splitNumber(creatorsBundle?.bundle?.votesLeft!) },
                  ]}
                />
              </SVotesAvailable>
              <SUserInfo>
                <SUserAvatar
                  avatarUrl={creatorsBundle?.creator?.avatarUrl ?? ''}
                />
                <SUsername>
                  <Trans
                    t={t}
                    i18nKey='modal.creatorsBundleModal.for'
                    // @ts-ignore
                    components={[
                      <SLink href={`/${creatorsBundle?.creator?.username}`} />,
                      { creator: creatorsBundle?.creator?.username },
                    ]}
                  />
                </SUsername>
              </SUserInfo>
              <SBundleInfo>
                <AccessDescription>
                  {t('modal.creatorsBundleModal.access', {
                    amount: formattedTimeLeft.value,
                    unit: t(
                      `modal.creatorsBundleModal.unit.${formattedTimeLeft.unit}`
                    ),
                  })}
                </AccessDescription>
                <BulletLine>
                  {t('modal.creatorsBundleModal.customOptions')}
                </BulletLine>
                <BulletLine>{t('modal.creatorsBundleModal.chat')}</BulletLine>
              </SBundleInfo>
              <BuyButton onClick={onBuyMore}>
                {t('modal.creatorsBundleModal.buyButton')}
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

const SUsername = styled.p`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
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

const BuyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;

  white-space: nowrap;

  font-size: 14px;
  line-height: 24px;
  font-weight: bold;

  padding: 12px 24px;
  width: 100%;

  color: ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
  }
`;
