import React, { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Toggle from '../../atoms/Toggle';
import InlineSVG from '../../atoms/InlineSVG';

import chevronRight from '../../../public/images/svg/icons/outlined/ChevronRight.svg';

interface IMobileField {
  id: string;
  type: undefined | 'toggle';
  value: any;
  onChange: (key: string, value: string | boolean) => void;
}

export const MobileField: React.FC<IMobileField> = (props) => {
  const {
    id,
    type,
    value,
    onChange,
  } = props;
  const { t } = useTranslation('creation');
  const theme = useTheme();

  const handleChange = useCallback(() => {
    if (type === 'toggle') {
      onChange(id, !value);
    }
  }, [id, type, onChange, value]);

  return (
    <SContainer>
      <STitle>
        {t(`secondStep.field.${id}.title`)}
      </STitle>
      <SRightPart>
        {type === 'toggle' ? (
          <Toggle
            checked={!!value}
            onChange={handleChange}
          />
        ) : (
          <>
            <SValue>
              {value}
            </SValue>
            <SInlineSVG
              svg={chevronRight}
              fill={theme.colorsThemed.text.secondary}
              width="24px"
              height="24px"
            />
          </>
        )}
      </SRightPart>
    </SContainer>
  );
};

export default MobileField;

const SContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const STitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  font-weight: bold;
  line-height: 24px;
`;

const SRightPart = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SValue = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  font-size: 14px;
  font-weight: bold;
  line-height: 24px;
`;

const SInlineSVG = styled(InlineSVG)`
  margin-left: 4px;
`;
