/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React, {
  useEffect, useState,
} from 'react';
import { OnChangeDateCallback } from 'react-calendar';
import styled from 'styled-components';
import validator from 'validator';

import Button from '../../atoms/Button';
import SettingsBirthDateInput from '../../molecules/profile/SettingsBirthDateInput';
import SettingsEmailInput from '../../molecules/profile/SettingsEmailInput';

type TSettingsPersonalInformationSection = {
  currentEmail?: string;
  currentDate?: Date;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
}
const SettingsPersonalInformationSection: React.FunctionComponent<TSettingsPersonalInformationSection> = ({
  currentEmail,
  currentDate,
  handleSetActive,
}) => {
  const [wasModifed, setWasModified] = useState(false);
  const [emailInEdit, setEmailInEdit] = useState(currentEmail ?? '');
  const [dateInEdit, setDateInEdit] = useState(currentDate ?? undefined);

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInEdit(e.target.value);
  };
  const handleDateInput: OnChangeDateCallback = (value: Date) => {
    setDateInEdit(value);
  };

  const handleResetModifications = () => {
    setEmailInEdit(currentEmail ?? '');
    setDateInEdit(currentDate ?? undefined);
  };

  useEffect(() => {
    if (emailInEdit !== currentEmail || dateInEdit !== currentDate) {
      setWasModified(true);
    } else {
      setWasModified(false);
    }
  }, [
    emailInEdit, currentEmail,
    dateInEdit, currentDate,
    setWasModified,
  ]);

  return (
    <SWrapper>
      <SInputsWrapper>
        <SettingsEmailInput
          value={emailInEdit}
          isValid={emailInEdit.length > 0 ? validator.isEmail(emailInEdit) : true}
          errorCaption="temp"
          onChange={handleEmailInput}
          onFocus={() => handleSetActive()}
        />
        <SettingsBirthDateInput
          value={dateInEdit}
          onChange={handleDateInput}
        />
      </SInputsWrapper>
      {wasModifed ? (
        <SControlsWrapper>
          <Button>
            Save
          </Button>
          <Button
            onClick={() => handleResetModifications()}
          >
            Cancel
          </Button>
        </SControlsWrapper>
      ) : null}
    </SWrapper>
  );
};

SettingsPersonalInformationSection.defaultProps = {
  currentEmail: undefined,
  currentDate: undefined,
};

export default SettingsPersonalInformationSection;

const SWrapper = styled.div`

`;

const SInputsWrapper = styled.div`
  display: flex;

  padding-bottom: 24px;
`;

const SControlsWrapper = styled.div`
  display: flex;

  padding-bottom: 24px;
`;
