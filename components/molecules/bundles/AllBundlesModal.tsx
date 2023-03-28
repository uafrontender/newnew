/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import preventParentClick from '../../../utils/preventParentClick';
import Modal, { ModalType } from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import BundleCard from './BundleCard';
import { useAppState } from '../../../contexts/appStateContext';

interface IAllBundlesModal {
  show: boolean;
  modalType?: ModalType;
  creatorBundles: newnewapi.ICreatorBundle[];
  onClose: () => void;
}

const AllBundlesModal: React.FC<IAllBundlesModal> = React.memo(
  ({ show, modalType, creatorBundles, onClose }) => {
    const { t } = useTranslation('page-Bundles');
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const isTablet = ['tablet'].includes(resizeMode);
    const setSize = useMemo(() => {
      if (isMobile) {
        return 1;
      }

      if (isTablet) {
        return 2;
      }

      return 4;
    }, [isMobile, isTablet]);

    const setsOfBundles = useMemo(() => {
      const sets: newnewapi.ICreatorBundle[][] = [];
      while (setSize * sets.length < creatorBundles.length) {
        sets.push(
          creatorBundles.slice(
            sets.length * setSize,
            (sets.length + 1) * setSize
          )
        );
      }

      return sets;
    }, [setSize, creatorBundles]);

    return (
      <Modal show={show} modalType={modalType} onClose={onClose}>
        <SModalPaper
          title={!isMobile ? t('bundlesModal.title') : undefined}
          onClose={onClose}
          onClick={preventParentClick()}
          isCloseButton
          isMobileFullScreen={isMobile}
        >
          {isMobile && <SMobileTitle>{t('bundlesModal.title')}</SMobileTitle>}
          {setsOfBundles.map((set, setIndex) => (
            <SBundleSetContainer key={setIndex}>
              {set.map((bundle, index) => (
                <SBundleCard
                  key={`${setIndex}-${index}`}
                  small
                  creatorBundle={bundle}
                />
              ))}
              {[...Array(setSize - set.length)].map((v, index) => (
                <BundleCard key={`${setIndex}-${index}-holder`} small />
              ))}
            </SBundleSetContainer>
          ))}
        </SModalPaper>
      </Modal>
    );
  }
);

export default AllBundlesModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    max-width: 550px;
    max-height: 80vh;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 1100px;
  }
`;

const SMobileTitle = styled.h1`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;
  margin-top: 18px;
  width: 100%;
`;

const SBundleSetContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  margin-top: 12px;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
    margin-bottom: 30px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 20px;
  }
`;

const SBundleCard = styled(BundleCard)`
  background-color: ${(props) => props.theme.colorsThemed.background.tertiary};
`;
