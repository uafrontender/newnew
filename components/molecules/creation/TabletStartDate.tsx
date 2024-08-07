import React, { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import CheckBox from '../CheckBox';
import TimePicker from '../../atoms/creation/TimePicker';
import CalendarSimple from '../../atoms/creation/calendar/CalendarSimple';
import AnimatedPresence, {
  TElementAnimations,
} from '../../atoms/AnimatedPresence';

interface ITabletStartDate {
  id: string;
  value: {
    type: string;
    date: string;
    time: string;
    'hours-format': 'am' | 'pm';
  };
  onChange: (key: string, value: string | number | boolean | object) => void;
}

const TabletStartDate: React.FC<ITabletStartDate> = (props) => {
  const { id, value, onChange } = props;
  const { t } = useTranslation('page-Creation');
  const [animate, setAnimate] = useState(value.type === 'schedule');
  const [animation, setAnimation] = useState<TElementAnimations>('o-12');

  const maxDate: Date = useMemo(() => {
    // If today is the last day of the month, max date is the last day of next month
    if (moment().endOf('day').isSame(moment().endOf('month'))) {
      return moment().add(1, 'M').endOf('month').toDate();
    }

    return moment().add(1, 'M').toDate();
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setAnimate(false);
  }, []);

  const handleTimeChange = useCallback(
    (key: string, time: any) => {
      onChange(id, { [key]: time });
    },
    [id, onChange]
  );

  const handleDateChange = useCallback(
    (date: any) => {
      onChange(id, { date });

      // Date here is a string
      const resultingDate = moment(
        `${moment(date).format('YYYY-MM-DD')}  ${value.time}:00 ${
          value['hours-format']
        }`
      );

      if (resultingDate.isBefore(moment())) {
        onChange(id, {
          time: moment().add(1, 'minute').format('hh:mm'),
        });

        onChange(id, {
          'hours-format': moment().format('a'),
        });
      }
    },
    [id, value, onChange]
  );

  const handleTypeChange = useCallback(
    (e: any, type: any) => {
      const changeBody: any = { type };
      if (type === 'right-away') {
        changeBody.date = moment().format();
        changeBody.time = moment().format('hh:mm');
        changeBody['hours-format'] = moment().format('a');
      } else {
        changeBody.time = moment().add(2, 'minute').format('hh:mm');
      }

      onChange(id, changeBody);
      setAnimate(true);
      setAnimation(type === 'schedule' ? 'o-12' : 'o-12-reverse');
    },
    [id, onChange]
  );

  // Animation for a case when props changed from outside
  useEffect(() => {
    setAnimation((curr) => {
      if (curr === 'o-12' && value.type === 'schedule') {
        return curr;
      }

      if (curr === 'o-12-reverse' && value.type === 'right-away') {
        return curr;
      }

      setAnimate(true);
      return value.type === 'schedule' ? 'o-12' : 'o-12-reverse';
    });
  }, [value.type]);

  return (
    <SContainer>
      <SCheckBoxWrapper>
        <CheckBox
          id='right-away'
          label={t('secondStep.field.startsAt.tablet.type.right-away')}
          selected={value.type === 'right-away'}
          handleChange={handleTypeChange}
        />
      </SCheckBoxWrapper>
      <CheckBox
        id='schedule'
        label={t('secondStep.field.startsAt.tablet.type.schedule')}
        selected={value.type === 'schedule'}
        handleChange={handleTypeChange}
      />
      <AnimatedPresence
        start={animate}
        animation={animation}
        onAnimationEnd={handleAnimationEnd}
      >
        <SCalendarWrapper>
          <SCalendarInput>
            <CalendarSimple
              date={value?.date}
              maxDate={maxDate}
              onChange={handleDateChange}
            />
          </SCalendarInput>
          <STimeInput>
            <TimePicker
              time={value?.time}
              format={value?.['hours-format']}
              currValue={value}
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

const SCalendarInput = styled.div`
  width: 65%;
`;

const STimeInput = styled.div`
  width: 35%;
`;
