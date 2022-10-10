/* eslint-disable react/no-array-index-key */
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';
import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import PackCard from './PackCard';

interface IAllPacksModal {
  show: boolean;
  creatorPacks: newnewapi.ICreatorPack[];
  onClose: () => void;
}

const AllPacksModal: React.FC<IAllPacksModal> = React.memo(
  ({ show, creatorPacks, onClose }) => {
    const { t } = useTranslation('page-Packs');
    const { resizeMode } = useAppSelector((state) => state.ui);
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

    const setsOfPacks = useMemo(() => {
      const sets: newnewapi.ICreatorPack[][] = [];
      while (setSize * sets.length < creatorPacks.length) {
        sets.push(
          creatorPacks.slice(sets.length * setSize, (sets.length + 1) * setSize)
        );
      }

      return sets;
    }, [setSize, creatorPacks]);

    return (
      <Modal show={show} onClose={onClose}>
        <SModalPaper
          title={t('packsModal.title')}
          onClose={onClose}
          onClick={preventParentClick()}
          isCloseButton
        >
          {setsOfPacks.map((set, setIndex) => (
            <SPackSetContainer>
              {set.map((pack, index) => (
                <SPackCard
                  key={`${setIndex}-${index}`}
                  small
                  creatorPack={pack}
                />
              ))}
              {Array.from('x'.repeat(setSize - set.length)).map((v, index) => (
                <PackCard key={`${setIndex}-${index}-holder`} small />
              ))}
            </SPackSetContainer>
          ))}
        </SModalPaper>
      </Modal>
    );
  }
);

export default AllPacksModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    max-width: 550px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 1100px;
  }
`;

const SPackSetContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  margin-bottom: 20px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 30px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 20px;
  }
`;

const SPackCard = styled(PackCard)`
  background-color: ${(props) => props.theme.colorsThemed.background.tertiary};
`;
