import React, { useCallback, useState } from 'react';
import moment from 'moment';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import CheckBox from '../CheckBox';
import InlineSVG from '../../atoms/InlineSVG';
import TimePicker from '../../atoms/creation/TimePicker';
import AnimatedPresence, { TAnimation } from '../../atoms/AnimatedPresence';

import calendarIcon from '../../../public/images/svg/icons/filled/Calendar.svg';

interface ITabletStartDate {
  id: string;
  value: any;
  onChange: (key: string, value: string | number | boolean | object) => void;
}

export const TabletStartDate: React.FC<ITabletStartDate> = (props) => {
  const {
    id,
    value,
    onChange,
  } = props;
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const [animate, setAnimate] = useState(value.type === 'schedule');
  const [animation, setAnimation] = useState('o-12');

  const handleAnimationEnd = useCallback(() => {
    setAnimate(false);
  }, []);
  const handleTimeChange = useCallback((key, time: any) => {
    onChange(id, { [key]: time });
  }, [id, onChange]);
  const handleTypeChange = useCallback((e, type) => {
    onChange(id, { type });
    setAnimate(true);
    setAnimation(type === 'schedule' ? 'o-12' : 'o-12-reverse');
  }, [id, onChange]);

  return (
    <SContainer>
      <SCheckBoxWrapper>
        <CheckBox
          id="right-away"
          label={t('secondStep.field.startsAt.tablet.type.right-away')}
          selected={value.type === 'right-away'}
          handleChange={handleTypeChange}
        />
      </SCheckBoxWrapper>
      <CheckBox
        id="schedule"
        label={t('secondStep.field.startsAt.tablet.type.schedule')}
        selected={value.type === 'schedule'}
        handleChange={handleTypeChange}
      />
      <AnimatedPresence
        start={animate}
        animation={animation as TAnimation}
        onAnimationEnd={handleAnimationEnd}
      >
        <SCalendarWrapper>
          <SCalendarInput>
            <SCalendarLabel variant={2} weight={500}>
              {moment(value?.date)
                .format('DD MMMM')}
            </SCalendarLabel>
            <InlineSVG
              svg={calendarIcon}
              fill={theme.colorsThemed.text.secondary}
              width="24px"
              height="24px"
            />
          </SCalendarInput>
          <STimeInput>
            <TimePicker
              time={value?.time}
              format={value?.['hours-format']}
              onChange={handleTimeChange}
            />
          </STimeInput>
        </SCalendarWrapper>
      </AnimatedPresence>
    </SContainer>
  );
};

export default TabletStartDate;

TabletStartDate.defaultProps = {};

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SCheckBoxWrapper = styled.div`
  margin-bottom: 16px;
`;

const SCalendarWrapper = styled.div`
  gap: 16px;
  display: flex;
  margin-top: 16px;
`;

const SCalendarField = styled.div`
  width: 60%;
  cursor: pointer;
  display: flex;
  padding: 12px 20px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
  justify-content: space-between;

  transition: .2s linear;

  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quaternary};
  }
`;

const SCalendarInput = styled(SCalendarField)`
  width: 60%;
`;

const STimeInput = styled.div`
  width: 40%;
`;

const SCalendarLabel = styled(Text)``;
