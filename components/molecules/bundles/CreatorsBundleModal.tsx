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
import InlineSvg from '../../atoms/InlineSVG';
import RadioIcon from '../../../public/images/svg/icons/filled/Radio.svg';

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
    const daysOfAccessLeft = Math.floor(timeLeft / 1000 / 60 / 60 / 24);

    return (
      <>
        <Modal show={show} onClose={onClose}>
          <SModalPaper
            onClose={onClose}
            onClick={preventParentClick()}
            isCloseButton
          >
            <Content>
              <BundleIcon
                // TODO: change to single ticket asset from AWS
                src={assets.decision.votes}
                alt='votes'
              />
              <SVotesAvailable>
                <Trans
                  t={t}
                  i18nKey='modal.creatorsBundleModal.votesLeft'
                  // @ts-ignore
                  components={[
                    <VotesNumberSpan />,
                    { amount: creatorsBundle?.bundle?.votesLeft },
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
                    amount: daysOfAccessLeft,
                  })}
                </AccessDescription>
                <SDescriptionLine>
                  <SBullet>
                    <InlineSvg
                      svg={RadioIcon}
                      width='6px'
                      height='6px'
                      fill='#000'
                    />
                  </SBullet>
                  <SDescriptionText>
                    {t('modal.creatorsBundleModal.customOptions')}
                  </SDescriptionText>
                </SDescriptionLine>
                <SDescriptionLine last>
                  <SBullet>
                    <InlineSvg
                      svg={RadioIcon}
                      width='6px'
                      height='6px'
                      fill='#000'
                    />
                  </SBullet>
                  <SDescriptionText>
                    {t('modal.creatorsBundleModal.chat')}
                  </SDescriptionText>
                </SDescriptionLine>
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
  color: ${({ theme }) => theme.colorsThemed.accent.yellow};
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

  margin-bottom: 12px;
`;

const SDescriptionLine = styled.div<{ last?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({ last }) => (last ? '0px' : '8px;')};
  width: 100%;

  overflow: hidden;
`;

const SBullet = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  width: 12px;
  height: 12px;
  margin-top: 4px;
  margin-right: 8px;
  background: ${({ theme }) => theme.colorsThemed.accent.yellow};
`;

const SDescriptionText = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 14px;
  line-height: 20px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
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
