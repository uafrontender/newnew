/* eslint-disable no-nested-ternary */
import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import Modal from '../../../organisms/Modal';
import ModalPaper from '../../../organisms/ModalPaper';
import Button from '../../../atoms/Button';
import votes from '../../../../public/images/dashboard/double-votes.png';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import { setBundleStatus } from '../../../../api/endpoints/bundles';

interface ITurnBundleModal {
  show: boolean;
  isBundlesEnabled: boolean | undefined;
  zIndex?: number;
  onBundlesStatusChange: () => void;
  onClose: () => void;
}

const TurnBundleModal: React.FC<ITurnBundleModal> = React.memo(
  ({ show, isBundlesEnabled, zIndex, onClose, onBundlesStatusChange }) => {
    const { t } = useTranslation('page-Creator');

    const toggleBundlesEnabled = useCallback(async () => {
      const payload = new newnewapi.SetBundleStatusRequest({
        bundleStatus: isBundlesEnabled
          ? newnewapi.CreatorBundleStatus.DISABLED
          : newnewapi.CreatorBundleStatus.ENABLED,
      });

      const res = await setBundleStatus(payload);

      // TODO: add translation
      if (!res.data || res.error) throw new Error('Request failed');

      onBundlesStatusChange();
    }, [isBundlesEnabled, onBundlesStatusChange]);

    return (
      <>
        <Modal show={show} additionalz={zIndex} onClose={onClose} overlaydim>
          <SModalPaper onClose={onClose} isCloseButton>
            <Content>
              {/* TODO: replace with TicketSet component, remove icon */}
              <SImgHolder>
                <img
                  src={votes.src}
                  alt={t('dashboard.aboutBundles.title')}
                  width={188}
                  height={144}
                />
              </SImgHolder>
              <STitle variant={4}>
                {isBundlesEnabled === true
                  ? t('myBundles.modals.turnoff.title')
                  : t('myBundles.modals.turnon.title')}
              </STitle>
              <SText variant={2}>
                {isBundlesEnabled === true
                  ? t('myBundles.modals.turnoff.text')
                  : t('myBundles.modals.turnon.text')}
              </SText>
              <SButton
                id='turn-on-bundles-modal-button'
                onClick={toggleBundlesEnabled}
                enabled={isBundlesEnabled}
                disabled={isBundlesEnabled === undefined}
              >
                {isBundlesEnabled
                  ? t('myBundles.buttonTurnOff')
                  : t('myBundles.buttonTurnOn')}
              </SButton>
            </Content>
          </SModalPaper>
        </Modal>
      </>
    );
  }
);

export default TurnBundleModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;
  padding: 24px;
  margin: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 32px;
    max-width: 500px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface ISButton {
  enabled?: boolean;
}
const SButton = styled(Button)<ISButton>`
  width: 100%;
  margin-left: 0;
  padding: 16px 20px;
  background: ${(props) =>
    !props.enabled
      ? props.theme.colorsThemed.accent.yellow
      : props.theme.colorsThemed.background.tertiary};
  color: ${(props) =>
    !props.enabled
      ? props.theme.colors.darkGray
      : props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    margin-left: 10px;
  }
  &:focus,
  &:active,
  &:hover {
    background: ${(props) =>
      !props.enabled
        ? props.theme.colorsThemed.accent.yellow
        : props.theme.colorsThemed.background.tertiary} !important;
    color: ${(props) =>
      !props.enabled
        ? props.theme.colors.darkGray
        : props.theme.name === 'light'
        ? props.theme.colorsThemed.text.primary
        : props.theme.colors.white} !important;
  }
`;

const SImgHolder = styled.div`
  margin: 38px 0 30px;
`;

const STitle = styled(Headline)`
  margin-bottom: 16px;
`;
const SText = styled(Text)`
  margin-bottom: 30px;
`;
