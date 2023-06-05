import React, { useMemo, useCallback, Fragment } from 'react';
import { Trans, useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import Link from 'next/link';

import preventParentClick from '../../../utils/preventParentClick';
import Modal, { ModalType } from '../../organisms/Modal';
import ModalPaper, { SContent } from '../../organisms/ModalPaper';
import UserAvatar from '../UserAvatar';
import assets from '../../../constants/assets';
import formatTimeLeft from '../../../utils/formatTimeLeft';
import BulletLine from './BulletLine';
import { formatNumber } from '../../../utils/format';
import HighlightedButton from '../../atoms/bundles/HighlightedButton';
import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';
import DisplayName from '../../atoms/DisplayName';
import Text from '../../atoms/Text';

interface ICreatorsBundleModal {
  show: boolean;
  creatorBundle: newnewapi.ICreatorBundle;
  modalType?: ModalType;
  onBuyMore: () => void;
  onClose: () => void;
}

const CreatorsBundleModal: React.FC<ICreatorsBundleModal> = React.memo(
  ({ show, creatorBundle, modalType, onBuyMore, onClose }) => {
    const { t } = useTranslation('common');
    const router = useRouter();

    const timeLeft =
      (creatorBundle.bundle!.accessExpiresAt!.seconds as number) * 1000 -
      Date.now();
    const formattedTimeLeft = formatTimeLeft(timeLeft);

    const { usersIBlocked, usersBlockedMe } = useGetBlockedUsers();
    const { creator } = creatorBundle;

    const isBlocked = useMemo(
      () =>
        usersIBlocked.includes(creator?.uuid ?? '') ||
        usersBlockedMe.includes(creator?.uuid ?? ''),
      [creator?.uuid, usersIBlocked, usersBlockedMe]
    );

    const disabled = useMemo(() => {
      if (!creatorBundle.creator?.options?.isOfferingBundles || isBlocked) {
        return true;
      }

      return false;
    }, [creatorBundle.creator?.options?.isOfferingBundles, isBlocked]);

    const onUserLinkClicked = useCallback(() => {
      if (router.asPath === `/${creatorBundle?.creator?.username}`) {
        onClose();
      }
    }, [router, creatorBundle?.creator?.username, onClose]);

    return (
      <>
        <Modal show={show} modalType={modalType} onClose={onClose}>
          <SModalPaper
            onClose={onClose}
            onClick={preventParentClick()}
            isCloseButton
          >
            <Content>
              <SBundleIcon src={assets.decision.votes} alt='votes' />
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
                <Link href={`/${creatorBundle?.creator?.username}`}>
                  <SUserAvatar
                    avatarUrl={creatorBundle?.creator?.avatarUrl ?? ''}
                    onClick={onUserLinkClicked}
                  />
                </Link>
                <SForLine>
                  <span>{t('modal.creatorsBundle.for')}</span>
                  <SDisplayName
                    user={creatorBundle?.creator}
                    href={`/${creatorBundle?.creator?.username}`}
                    onClick={onUserLinkClicked}
                  />
                </SForLine>
              </SUserInfo>
              <SBundleInfo>
                {formattedTimeLeft ? (
                  <>
                    <AccessDescription>
                      <Trans
                        t={t}
                        i18nKey='modal.creatorsBundle.access'
                        components={[
                          <>
                            {formattedTimeLeft?.map((time, index) => (
                              // eslint-disable-next-line react/no-array-index-key
                              <Fragment key={index}>
                                {index > 0
                                  ? t('modal.creatorsBundle.and')
                                  : null}
                                {t('modal.creatorsBundle.unitPair', {
                                  amount: time.value,
                                  unit: t(
                                    `modal.creatorsBundle.unit.${time.unit}`
                                  ),
                                })}
                              </Fragment>
                            ))}
                          </>,
                        ]}
                      />
                    </AccessDescription>
                    <BulletLine>
                      {t('modal.creatorsBundle.customOptions')}
                    </BulletLine>
                    <BulletLine>{t('modal.creatorsBundle.chat')}</BulletLine>
                  </>
                ) : (
                  <AccessDescription>
                    {t('modal.creatorsBundle.accessExpired')}
                  </AccessDescription>
                )}
              </SBundleInfo>
              <SBuyButton disabled={disabled} onClick={onBuyMore}>
                {t('modal.creatorsBundle.buyButton')}
              </SBuyButton>
              {creatorBundle.creator?.options &&
                !creatorBundle.creator.options.isOfferingBundles && (
                  <SNote variant='subtitle'>
                    {t('modal.creatorsBundle.bundlesDisabled')}
                  </SNote>
                )}
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

  ${SContent} {
    padding: 32px 48px;
    margin: -32px -48px;
  }

  ${({ theme }) => theme.media.tablet} {
    max-width: 500px;
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
  max-width: 100%;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 50%;
  margin-right: 8px;
  cursor: pointer;
`;

const SForLine = styled.div`
  display: inline-flex;
  white-space: pre;
  overflow: hidden;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const SDisplayName = styled(DisplayName)`
  cursor: pointer;
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

const SBuyButton = styled(HighlightedButton)`
  font-size: 14px;

  ${({ theme }) => theme.media.tablet} {
    width: auto;
  }
`;

const SNote = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  text-align: center;
  white-space: pre-wrap;
  margin-top: 8px;
`;
