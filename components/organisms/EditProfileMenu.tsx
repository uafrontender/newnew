/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { isEqual } from 'lodash';
import validator from 'validator';

import { useAppSelector } from '../../redux-store/store';

// Components
import GoBackButton from '../molecules/GoBackButton';
import InlineSvg from '../atoms/InlineSVG';

// Icons
import CancelIcon from '../../public/images/svg/icons/outlined/Close.svg';
import Button from '../atoms/Button';
import DisplaynameInput from '../atoms/profile/DisplayNameInput';
import UsernameInput from '../atoms/profile/UsernameInput';
import BioTextarea from '../atoms/profile/BioTextarea';

interface IEditProfileMenu {
  wasModified: boolean;
  handleClose: () => void;
  handleSetWasModified: (newState: boolean) => void;
  handleClosePreventDiscarding: () => void;
}

type ModalMenuUserData = {
  username: string;
  displayName: string;
  bio: string;
}

type TFormErrors = {
  displaynameError?: string;
  usernameError?: string;
};

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

  // Image data
  const [avatarUrl, setAvatarUrl] = useState(user.userData?.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(user.userData?.coverUrl);

  // Textual data
  const [dataInEdit, setDataInEdit] = useState<ModalMenuUserData>({
    displayName: user.userData?.displayName ?? '',
    username: user.userData?.username ?? '',
    bio: user.userData?.bio ?? '',
  });
  const [isDataValid, setIsDataValid] = useState(false);
  const [formErrors, setFormErrors] = useState<TFormErrors>({
    displaynameError: '',
    usernameError: '',
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

  // Check if data was modified
  useEffect(() => {
    // Temp
    const initialData: ModalMenuUserData = {
      displayName: user.userData?.displayName ?? '',
      username: user.userData?.username ?? '',
      bio: user.userData?.bio ?? '',
    };

    if (isEqual(dataInEdit, initialData)) {
      handleSetWasModified(false);
    } else {
      handleSetWasModified(true);
    }
  }, [dataInEdit, user.userData, handleSetWasModified]);

  // Check fields validity
  useEffect(() => {
    const isUsernameValid = dataInEdit.username.length >= 8
      && dataInEdit.username.length <= 15
      && validator.isAlphanumeric(dataInEdit.username)
      && validator.isLowercase(dataInEdit.username);
    const isDisplaynameValid = dataInEdit && dataInEdit!!.displayName!!.length > 0;

    if (!isDisplaynameValid || !isUsernameValid) {
      setFormErrors((errors) => {
        const errorsWorking = { ...errors };
        errorsWorking.usernameError = isUsernameValid ? '' : 'Wrong input';
        errorsWorking.displaynameError = isDisplaynameValid ? '' : 'Wrong input';
        return errorsWorking;
      });
      setIsDataValid(false);
    } else {
      setFormErrors({
        usernameError: '',
        displaynameError: '',
      });
      setIsDataValid(true);
    }
  }, [dataInEdit]);

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
          value={dataInEdit.displayName as string}
          placeholder={t('EditProfileMenu.inputs.displayName.placeholder')}
          isValid={!formErrors.displaynameError}
          onChange={(e) => handleUpdateDataInEdit('displayName', e.target.value)}
        />
        <UsernameInput
          type="text"
          value={dataInEdit.username}
          popupCaption={(
            <UsernamePopupList
              points={[
                t('EditProfileMenu.inputs.username.points.1'),
                t('EditProfileMenu.inputs.username.points.2'),
                t('EditProfileMenu.inputs.username.points.3'),
              ]}
            />
          )}
          frequencyCaption={t('EditProfileMenu.inputs.username.frequencyCaption')}
          placeholder={t('EditProfileMenu.inputs.username.placeholder')}
          isValid={!formErrors.usernameError}
          onChange={(e) => handleUpdateDataInEdit('username', e.target.value)}
        />
        <BioTextarea
          maxChars={150}
          value={dataInEdit.bio}
          placeholder={t('EditProfileMenu.inputs.bio.placeholder')}
          onChange={(e) => handleUpdateDataInEdit('bio', e.target.value)}
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
          disabled={!wasModified || !isDataValid}
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

const UsernamePopupList = ({ points } : { points: string[] }) => (
  <SUsernamePopupList>
    {points.map((p) => (
      <div key={p}>
        { p }
      </div>
    ))}
  </SUsernamePopupList>
);

const SUsernamePopupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: #FFFFFF;

  div {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &:before {
      content: '';
      display: block;

      position: relative;
      top: -1px;

      width: 13px;
      height: 13px;
      margin-right: 4px;

      border-radius: 50%;
      border-width: 1.5px;
      border-style: solid;
      border-color: ${({ theme }) => theme.colorsThemed.text.secondary};
    }
  }
`;
