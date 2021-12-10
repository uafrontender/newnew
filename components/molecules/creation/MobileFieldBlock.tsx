import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import Calendar from '../../atoms/creation/Calendar';
import InlineSVG from '../../atoms/InlineSVG';
import CustomToggle from '../CustomToggle';

import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';

interface IMobileFieldBlock {
  id: string;
  type?: 'input' | 'select' | 'date' | '';
  value: any;
  options?: {}[];
  onChange: (key: string, value: string | number | boolean | object) => void;
  inputType?: 'text' | 'number' | 'tel';
  formattedValue?: any;
  formattedDescription?: any;
}

export const MobileFieldBlock: React.FC<IMobileFieldBlock> = (props) => {
  const {
    id,
    type,
    value,
    options,
    inputType,
    formattedValue,
    formattedDescription,
    onChange,
  } = props;
  const inputRef: any = useRef();
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e) => {
    onChange(id, e.target.value);
  }, [id, onChange]);
  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);
  const handleClick = useCallback(() => {
    handleFocus();
  }, [handleFocus]);
  const handleBlur = useCallback(() => {
    setFocused(false);

    if (!value) {
      onChange(id, 1);
    }
  }, [id, onChange, value]);
  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const renderItem = useCallback((item: any) => {
    const handleItemClick = () => {
      onChange(id, item.id);
    };
    const selected = item.id === value;

    return (
      <SButton
        key={`select-${id}-${item.id}`}
        view={selected ? 'modalSecondarySelected' : 'modalSecondary'}
        onClick={handleItemClick}
        selected={selected}
      >
        <SItemTitle variant={3} weight={600}>
          {item.title}
        </SItemTitle>
      </SButton>
    );
  }, [id, onChange, value]);
  const getModal = useCallback(() => {
    if (type === 'select') {
      return (
        <Modal show={focused} onClose={handleBlur}>
          <SMobileListContainer focused={focused}>
            <SMobileList>
              {options?.map(renderItem)}
            </SMobileList>
            <SCancelButton
              view="modalSecondary"
              onClick={handleBlur}
            >
              {t('secondStep.button.cancel')}
            </SCancelButton>
          </SMobileListContainer>
        </Modal>
      );
    }

    if (type === 'date') {
      const typeOptions = [
        {
          id: 'schedule',
          title: t('secondStep.field.startsAt.modal.type.schedule'),
        },
        {
          id: 'right-away',
          title: t('secondStep.field.startsAt.modal.type.right-away'),
        },
      ];
      const formatOptions = [
        {
          id: 'am',
          title: t('secondStep.field.startsAt.modal.hours-format.am'),
        },
        {
          id: 'pm',
          title: t('secondStep.field.startsAt.modal.hours-format.pm'),
        },
      ];
      const days = [
        {
          id: 'sunday',
        },
        {
          id: 'monday',
        },
        {
          id: 'tuesday',
        },
        {
          id: 'wednesday',
        },
        {
          id: 'thursday',
        },
        {
          id: 'friday',
        },
        {
          id: 'saturday',
        },
      ];
      const renderDay = (el: any) => (
        <SDay key={el.id} variant={2} weight={500}>
          {t(`secondStep.field.startsAt.modal.days.${el.id}`)}
        </SDay>
      );
      const handleScheduleChange = (selectedId: string) => {
        onChange(id, { type: selectedId });
      };
      const handleFormatChange = (selectedId: string) => {
        onChange(id, { 'hours-format': selectedId });
      };

      return (
        <Modal show={focused} onClose={handleBlur}>
          <SMobileDateContainer focused={focused}>
            <SMobileDateContent onClick={preventCLick}>
              <SModalTopLine>
                <SModalTitle variant={6}>
                  {t('secondStep.field.startsAt.modal.title')}
                </SModalTitle>
                <SInlineSVGWrapper
                  onClick={handleBlur}
                >
                  <SInlineSVG
                    svg={closeIcon}
                    fill={theme.colorsThemed.text.primary}
                    width="20px"
                    height="20px"
                  />
                </SInlineSVGWrapper>
              </SModalTopLine>
              <SModalToggleWrapper>
                <CustomToggle
                  options={typeOptions}
                  selected={value?.type}
                  onChange={handleScheduleChange}
                />
              </SModalToggleWrapper>
              <SCustomDays>
                {days.map(renderDay)}
              </SCustomDays>
              <SSeparator />
              <SCalendarWrapper>
                <SCalendarTopGrad />
                <SCalendarContent>
                  <Calendar
                    minDate={moment().startOf('M')}
                    maxDate={moment().add(2, 'M').endOf('M')}
                    onSelect={() => {}}
                    selectedDate={moment().startOf('D')}
                  />
                </SCalendarContent>
                <SCalendarBottomGrad />
              </SCalendarWrapper>
              <SSeparator />
              <SModalToggleWrapper>
                <CustomToggle
                  options={formatOptions}
                  selected={value?.['hours-format']}
                  onChange={handleFormatChange}
                />
              </SModalToggleWrapper>
              <SScheduleButton
                view="primaryGrad"
                onClick={handleBlur}
              >
                {t('secondStep.button.schedule')}
              </SScheduleButton>
            </SMobileDateContent>
          </SMobileDateContainer>
        </Modal>
      );
    }

    return false;
  }, [
    t,
    id,
    type,
    value,
    focused,
    options,
    onChange,
    handleBlur,
    renderItem,
    theme.colorsThemed.text.primary,
  ]);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focused, inputRef]);

  return (
    <>
      {getModal()}
      <SContainer onClick={handleClick}>
        <STitle variant={2} weight={700}>
          {t(`secondStep.field.${id}.title`)}
        </STitle>
        {type === 'input' ? (
          <SInputWrapper>
            <SInputLabel htmlFor={id}>
              {t(`secondStep.field.${id}.label`)}
            </SInputLabel>
            <SInput
              id={id}
              min={1}
              ref={inputRef}
              type={inputType}
              value={value}
              onBlur={handleBlur}
              pattern="\d*"
              onFocus={handleFocus}
              onChange={handleChange}
              placeholder={t(`secondStep.field.${id}.placeholder`)}
            />
          </SInputWrapper>
        ) : (
          <SValue variant={6}>
            {t(`secondStep.field.${id}.value`, { value: formattedValue || value })}
          </SValue>
        )}
        <SDescription variant={2} weight={700}>
          {t(`secondStep.field.${id}.description`, { value: formattedDescription || value })}
        </SDescription>
      </SContainer>
    </>
  );
};

export default MobileFieldBlock;

MobileFieldBlock.defaultProps = {
  type: '',
  options: [],
  inputType: 'text',
  formattedValue: '',
  formattedDescription: '',
};

const SContainer = styled.div`
  cursor: pointer;
  display: flex;
  padding: 16px;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
  flex-direction: column;
`;

const STitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
`;

const SValue = styled(Headline)`
  margin-top: 16px;
`;

const SDescription = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  margin-top: 2px;
`;

const SInputLabel = styled.label`
  top: 50%;
  left: 0;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  position: absolute;
  transform: translateY(-50%);
  font-weight: bold;

  font-size: 18px;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 28px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }
`;

const SInputWrapper = styled.div`
  height: 26px;
  position: relative;
  margin-top: 16px;
`;

const SInput = styled.input`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding-left: 10px;

  -webkit-appearance: none;
  -moz-appearance: none;
  -ms-appearance: none;
  -o-appearance: none;
  appearance: none;

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  font-size: 18px;
  font-weight: bold;
  line-height: 26px;

  ${({ theme }) => theme.media.tablet} {
    font-size: 20px;
    line-height: 28px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 20px;
    line-height: 28px;
  }
`;

interface ISMobileListContainer {
  focused: boolean;
}

const SMobileListContainer = styled.div<ISMobileListContainer>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100%;
  padding: 16px;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileDateContainer = styled.div<ISMobileListContainer>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100vh;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileDateContent = styled.div`
  display: flex;
  padding: 16px;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  flex-direction: column;
  background-color: ${(props) => props.theme.colorsThemed.background.backgroundDD};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

const SMobileList = styled.div`
  display: flex;
  padding: 12px;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) => props.theme.colorsThemed.background.backgroundDD};
`;

interface ISButton {
  selected: boolean;
}

const SButton = styled(Button)<ISButton>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 16px;

  ${(props) => props.theme.media.tablet} {
    min-width: 136px;
    justify-content: flex-start;
  }
`;

const SCancelButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 4px;
`;

const SScheduleButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 12px;
  margin-bottom: 8px;
`;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  text-align: center;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
  }
`;

const SModalTopLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-direction: row;
  justify-content: space-between;
`;

const SModalTitle = styled(Headline)`
`;

const SInlineSVGWrapper = styled.div`
  cursor: pointer;
  padding: 16px;
`;

const SInlineSVG = styled(InlineSVG)``;

const SModalToggleWrapper = styled.div`
  width: 100%;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SSeparator = styled.div`
  width: 100%;
  height: 1px;
  border-radius: 2px;
  background-color: ${(props) => props.theme.colorsThemed.background.outlines1};
`;

const SCustomDays = styled.div`
  display: flex;
  padding: 18px 0;
  align-items: center;
  flex-direction: row;
  justify-content: space-around;
`;

const SDay = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SCalendarWrapper = styled.div`
  position: relative;
`;

const SCalendarContent = styled.div`
  height: 325px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const SCalendarTopGrad = styled.div`
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 1;
  position: absolute;
  background: ${(props) => props.theme.gradients.calendarTop};
`;

const SCalendarBottomGrad = styled.div`
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
  z-index: 1;
  position: absolute;
  background: ${(props) => props.theme.gradients.calendarBottom};
`;
