import React from 'react';
import moment from 'moment';
import styled from 'styled-components';

import Text from '../../Text';

const isSameDate = (firstDate: moment.Moment, secondDate: Date) =>
  moment(firstDate, 'DD/MM/YYYY').diff(
    moment(secondDate, 'DD/MM/YYYY'),
    'days',
    false
  ) === 0;

const isDisabled = (
  minDate: Date,
  currentDate: moment.Moment,
  maxDate: Date
) => {
  const min = moment(moment(minDate).format('DD/MM/YYYY'), 'DD/MM/YYYY');
  const max = moment(
    moment(maxDate || currentDate).format('DD/MM/YYYY'),
    'DD/MM/YYYY'
  );
  const current = moment(
    moment(currentDate).format('DD/MM/YYYY'),
    'DD/MM/YYYY'
  );
  return !(min <= current && current <= max);
};

interface ICalendarScrollableVertically {
  minDate: any;
  maxDate: any;
  onSelect: (value: any) => void;
  selectedDate?: any | null;
}

export const CalendarScrollableVertically: React.FC<
  ICalendarScrollableVertically
> = (props) => {
  const { minDate, maxDate, onSelect, selectedDate } = props;

  const handleSelectedDate = (e: any, value: any) => {
    if (e) {
      e.preventDefault();
    }

    if (onSelect) {
      onSelect(value);
    }
  };

  return (
    <RenderCalendarYear
      minDate={minDate}
      maxDate={maxDate}
      selectedDate={selectedDate}
      handleSelect={handleSelectedDate}
    />
  );
};

CalendarScrollableVertically.defaultProps = {
  selectedDate: null,
};

export default CalendarScrollableVertically;

export const RenderCalendarYear = (props: any) => {
  const { minDate, maxDate } = props;
  const totalMonth = Math.round(maxDate.diff(minDate, 'months', true)) + 1;
  const elements = [];
  let now = moment(minDate, 'DD/MMM/YYYY');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < totalMonth; i++) {
    elements.push(
      <RenderMonthCard key={i} currentMonth={now.clone()} {...props} />
    );
    now = now.add(1, 'M');
  }
  return <SContent>{elements}</SContent>;
};

const SContent = styled.div`
  width: 100%;
  color: #53576d;

  :before,
  :after {
    content: ' ';
    display: table;
  }

  :after {
    clear: both;
  }
`;

export const RenderMonthCard = (props: any) => {
  const { currentMonth } = props;
  return (
    <SMonth id={currentMonth.format('MMMM-YYYY')}>
      <RenderMonthHeader date={currentMonth} {...props} />
      <RenderDays date={currentMonth} {...props} />
    </SMonth>
  );
};

const SMonth = styled.section`
  width: 100%;
  margin-bottom: 16px;

  &:first-child {
    padding-top: 24px;
  }

  :before,
  :after {
    content: ' ';
    display: table;
  }

  :after {
    clear: both;
  }
`;

export const RenderMonthHeader = (props: any) => {
  const { date } = props;
  const month = date.format('MMMM');
  const year = date.format('YYYY');
  return (
    <SMonthHeader variant={1} weight={600}>
      {`${month}, ${year}`}
    </SMonthHeader>
  );
};

const SMonthHeader = styled(Text)`
  text-align: center;
  margin-bottom: 16px;
`;

export const RenderSingleDay = (props: any) => {
  const {
    i,
    view,
    isActive,
    handleClick,
    currentValue,
    isDisabled: _isDisabled,
  } = props;
  const onClick = (e: any) => {
    handleClick(e, currentValue);
  };

  return (
    <SDayHolder key={i}>
      <SDay
        weight={isActive ? 600 : 500}
        variant={view === 'sm' ? 2 : 1}
        onClick={onClick}
        isActive={isActive}
        isDisabled={_isDisabled}
      >
        {currentValue.date()}
      </SDay>
    </SDayHolder>
  );
};

const SDayHolder = styled.li`
  width: 14.28%;
  float: left;
  display: flex;
  min-height: 44px;
  text-align: center;
  align-items: center;
  border-radius: 50%;
  justify-content: center;
`;

interface ISDay {
  isActive: boolean;
  isDisabled: boolean;
}

const SDay = styled(Text)<ISDay>`
  width: 44px;
  color: ${(props) =>
    props.isActive
      ? props.theme.colors.white
      : `${
          props.isDisabled
            ? props.theme.colorsThemed.text.tertiary
            : props.theme.colorsThemed.text.primary
        }`};
  cursor: ${(props) =>
    props.isDisabled || props.isActive ? 'not-allowed' : 'pointer'};
  height: 44px;
  display: inline-block;
  background: ${(props) =>
    props.isActive ? props.theme.colorsThemed.accent.blue : 'transparent'};
  line-height: 46px !important;
  border-radius: 22px;
  pointer-events: ${(props) =>
    props.isDisabled || props.isActive ? 'none' : 'unset'};

  :hover {
    background: ${(props) =>
      props.isActive
        ? props.theme.colorsThemed.accent.blue
        : props.theme.colorsThemed.background.quaternary};
  }
`;

export const RenderDays = (props: any) => {
  const {
    date,
    view = 'md',
    minDate,
    maxDate,
    selectedDate,
    handleSelect,
  } = props;
  const startDate = date.startOf('month');
  const daysInMonth = date.daysInMonth();
  const balanceDayCount = startDate.day();

  const renderDay = () => {
    const elements = [];
    let now = moment(date, 'DD/MMM/YYYY');
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= daysInMonth; i++) {
      elements.push(
        <RenderSingleDay
          key={i}
          view={view}
          isActive={isSameDate(now.clone(), selectedDate)}
          isDisabled={isDisabled(minDate, now.clone(), maxDate)}
          handleClick={handleSelect}
          currentValue={now.clone()}
        />
      );
      now = now.add(1, 'days');
    }
    return elements;
  };
  const renderUnwantedDay = (count: number) => {
    const elements = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < count; i++) {
      elements.push(<SUnwantedDays key={i} />);
    }
    return elements;
  };

  return (
    <SList>
      {renderUnwantedDay(balanceDayCount)}
      {renderDay()}
    </SList>
  );
};

const SList = styled.ul`
  list-style: none;
  padding-left: 0;
  overflow: hidden; //remove vertical scroll

  :before,
  :after {
    content: ' ';
    display: table;
  }

  :after {
    clear: both;
  }
`;

const SUnwantedDays = styled.li`
  float: left;
  width: 14.28%;
  min-height: 44px;
  text-align: center;
`;
