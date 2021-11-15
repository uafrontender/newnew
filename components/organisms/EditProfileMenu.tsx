import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { isEqual } from 'lodash';

import { useAppSelector } from '../../redux-store/store';

// Components
import GoBackButton from '../molecules/GoBackButton';
import InlineSvg from '../atoms/InlineSVG';

// Icons
import CancelIcon from '../../public/images/svg/icons/outlined/Close.svg';
import Button from '../atoms/Button';
import DisplaynameInput from '../atoms/DisplayNameInput';
import UsernameInput from '../atoms/UsernameInput';

interface IEditProfileMenu {
  wasModified: boolean;
  handleClose: () => void;
  handleSetWasModified: (newState: boolean) => void;
  handleClosePreventDiscarding: () => void;
}

type ModalMenuUserData = Omit<newnewapi.Me, 'toJSON' | 'email' | 'options' | 'id'>
  // Temp
  & {
    bio: string;
    backgroundUrl: string;
  }

const EditProfileMenu: React.FunctionComponent<IEditProfileMenu> = ({
  wasModified,
  handleClose,
  handleSetWasModified,
  handleClosePreventDiscarding,
}) => {
  const { t } = useTranslation('profile');
  const theme = useTheme();
  const { user, ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(ui.resizeMode);

  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    bio: '',
    backgroundUrl: '',
    ...user.userData!!,
  });

  const handleUpdateDataInEdit = useCallback((
    key: keyof ModalMenuUserData,
    value: any,
  ) => {
    const workingData = { ...dataInEdit };
    workingData[key] = value;
    setDataInEdit({ ...workingData });
  },
  [dataInEdit, setDataInEdit]);

  useEffect(() => {
    // Temp
    const initialData: ModalMenuUserData = {
      bio: '',
      backgroundUrl: '',
      ...user.userData!!,
    };

    if (isEqual(dataInEdit, initialData)) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [dataInEdit, user.userData, handleSetWasModified]);

  return (
    <SEditProfileMenu
      onClick={(e) => e.stopPropagation()}
    >
      {isMobile
        ? (
          <SGoBackButtonMobile
            onClick={handleClosePreventDiscarding}
          >
            { t('EditProfileMenu.goBackBtn') }
          </SGoBackButtonMobile>
        ) : (
          <SGoBackButtonDesktop
            onClick={handleClosePreventDiscarding}
          >
            <div>{ t('EditProfileMenu.goBackBtn') }</div>
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </SGoBackButtonDesktop>
        )}
      <SInputsWrapper>
        <DisplaynameInput
          type="text"
          value={dataInEdit.displayName}
          placeholder={t('EditProfileMenu.inputs.displayName.placeholder')}
          isValid={dataInEdit.displayName.length > 0}
          onChange={(e) => handleUpdateDataInEdit('displayName', e.target.value)}
        />
        <UsernameInput
          type="text"
          value={dataInEdit.username}
          frequencyCaption={t('EditProfileMenu.inputs.username.frequencyCaption')}
          placeholder={t('EditProfileMenu.inputs.username.placeholder')}
          isValid={dataInEdit.username.length > 0}
          onChange={(e) => handleUpdateDataInEdit('username', e.target.value)}
        />
      </SInputsWrapper>
      <SControlsWrapper>
        {!isMobile
          ? (
            <Button
              view="secondary"
              onClick={handleClose}
            >
              { t('EditProfileMenu.cancelButton') }
            </Button>
          ) : null}
        <Button
          disabled={!wasModified}
          style={{
            width: isMobile ? '100%' : 'initial',
          }}
        >
          { t('EditProfileMenu.saveButton') }
        </Button>
      </SControlsWrapper>
    </SEditProfileMenu>
  );
};

export default EditProfileMenu;

const SEditProfileMenu = styled.div`
  position: relative;
  overflow-y: auto;

  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};

  ${({ theme }) => theme.media.tablet} {
    position: absolute;
    top: 136px;
    left: calc(50% - 232px);

    width: 464px;
    height: 70vh;
    max-height: 724px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${({ theme }) => theme.media.desktop} {
    top: 100px;
    left: calc(50% - 240px);

    width: 480px;
  }
`;

const SGoBackButtonMobile = styled(GoBackButton)`
  width: 100%;
  padding: 18px 16px;
`;

const SGoBackButtonDesktop = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SInputsWrapper = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;

  padding-left: 16px;
  padding-right: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const SControlsWrapper = styled.div`
  display: flex;

  padding: 16px;

  ${({ theme }) => theme.media.tablet} {
    justify-content: space-between;
    align-items: center;
  }
`;
