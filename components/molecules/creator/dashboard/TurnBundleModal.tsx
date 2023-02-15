/* eslint-disable no-nested-ternary */
import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Modal, { ModalType } from '../../../organisms/Modal';
import ModalPaper, { SContent } from '../../../organisms/ModalPaper';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import { Mixpanel } from '../../../../utils/mixpanel';
import assets from '../../../../constants/assets';

interface ITurnBundleModal {
  show: boolean;
  modalType?: ModalType;
  isBundlesEnabled: boolean | undefined;
  zIndex?: number;
  onToggleBundles: () => void;
  onClose: () => void;
}

const TurnBundleModal: React.FC<ITurnBundleModal> = React.memo(
  ({ show, modalType, isBundlesEnabled, zIndex, onClose, onToggleBundles }) => {
    const { t } = useTranslation('page-Creator');
    const theme = useTheme();

    return (
      <>
        <Modal
          show={show}
          modalType={modalType}
          additionalz={zIndex}
          onClose={onClose}
        >
          <SModalPaper onClose={onClose} isCloseButton>
            <Content>
              <SBundlesImage
                src={
                  theme.name === 'light'
                    ? assets.bundles.lightBundles
                    : assets.bundles.darkBundles
                }
                alt={t('dashboard.aboutBundles.title')}
              />
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
                view={isBundlesEnabled ? 'quaternary' : 'brandYellow'}
                onClick={() => {
                  Mixpanel.track(
                    isBundlesEnabled ? 'Turn Off Bundles' : 'Turn On Bundles',
                    {
                      _stage: 'Dashboard',
                    }
                  );
                  onToggleBundles();
                }}
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

interface ISButton {
  enabled?: boolean;
}
const SButton = styled(Button)<ISButton>`
  width: 100%;
  margin-left: 0;
  padding: 16px 20px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
    // TODO: Is margin needed?
    margin-left: 10px;
  }
`;

const SBundlesImage = styled.img`
  width: 200px;
  height: 200px;
  margin: 38px 0 30px;
`;

const STitle = styled(Headline)`
  margin-bottom: 16px;
`;
const SText = styled(Text)`
  margin-bottom: 30px;
`;
