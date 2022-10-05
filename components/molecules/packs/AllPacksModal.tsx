import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../../redux-store/store';
import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import ModalPaper from '../../organisms/ModalPaper';
import { PacksContext } from '../../../contexts/packsContext';
import PackCard from './PackCard';

interface IAllPacksModal {
  show: boolean;
  onClose: () => void;
}

const AllPacksModal: React.FC<IAllPacksModal> = React.memo(
  ({ show, onClose }) => {
    const { t } = useTranslation('page-Packs');
    const { packs } = useContext(PacksContext);
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
      const sets: newnewapi.Pack[][] = [];
      while (setSize * sets.length < packs.length) {
        sets.push(
          packs.slice(sets.length * setSize, (sets.length + 1) * setSize)
        );
      }

      return sets;
    }, [setSize, packs]);

    return (
      <Modal show={show} onClose={onClose}>
        <SModalPaper
          title={t('packsModal.title')}
          onClose={onClose}
          onClick={preventParentClick()}
          isCloseButton
        >
          {setsOfPacks.map((set) => (
            <SPackSetContainer>
              {set.map((pack) => (
                <SPackCard small pack={pack} />
              ))}
              {Array.from('x'.repeat(setSize - set.length)).map(() => (
                <PackCard small />
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
