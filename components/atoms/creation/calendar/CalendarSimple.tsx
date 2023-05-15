import React, { useRef, useState, useCallback, useEffect } from 'react';
import moment from 'moment';
import { scroller } from 'react-scroll';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';
import { useRouter } from 'next/router';

import Text from '../../Text';
import InlineSVG from '../../InlineSVG';
import { RenderDays } from './CalendarScrollableVertically';
import AnimatedPresence, { TElementAnimations } from '../../AnimatedPresence';

import useOnClickEsc from '../../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import useDropDownDirection from '../../../../utils/hooks/useDropDownDirection';

import chevronLeft from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import chevronRight from '../../../../public/images/svg/icons/outlined/ChevronRight.svg';
import calendarIcon from '../../../../public/images/svg/icons/filled/Calendar.svg';

import { DAYS } from '../../../../constants/general';

interface ICalendarSimple {
  date: any;
  maxDate?: Date;
  onChange: (date: any) => void;
}

export const CalendarSimple: React.FC<ICalendarSimple> = (props) => {
  const { date, maxDate, onChange } = props;
  const monthsToRender = [
    moment().startOf('month'),
    moment().startOf('month').add(1, 'month'),
  ];

  const theme = useTheme();
  const { locale } = useRouter();
  const { t } = useTranslation('page-Creation');
  const wrapperRef: any = useRef();
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState<TElementAnimations>('o-12');
  const [visibleMonth, setVisibleMonth] = useState(
    monthsToRender.findIndex((m) => m.format('M') === moment(date).format('M'))
  );
  const direction = useDropDownDirection(wrapperRef, 400);

  const hasPrevMonth = visibleMonth !== 0;
  const hasNextMonth = visibleMonth < monthsToRender.length - 1;

  const handleClick = useCallback(() => {
    setAnimation('o-12');
    setAnimate(true);
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setAnimation('o-12-reverse');
    setAnimate(true);
    setOpen(false);
  }, []);
  const handleAnimationEnd = useCallback(() => {
    setAnimate(false);
  }, []);
  const handleChange = useCallback(
    (e: any, value: any) => {
      if (e) {
        e.preventDefault();
      }
      onChange(value.format());
    },
    [onChange]
  );
  const handlePrevMonth = useCallback(() => {
    setVisibleMonth(visibleMonth - 1);
  }, [visibleMonth]);
  const handleNextMonth = useCallback(() => {
    setVisibleMonth(visibleMonth + 1);
  }, [visibleMonth]);
  const renderDay = useCallback(
    (el: any) => (
      <SDay key={el.value}>
        <SDayLabel variant={2} weight={500}>
          {t(`secondStep.field.startsAt.modal.days.${el.value}` as any)}
        </SDayLabel>
      </SDay>
    ),
    [t]
  );
  const renderMonth = useCallback(
    (el: moment.Moment, index: number) => {
      const opts: any = {
        date: el,
        maxDate,
      };

      if (index === 0) {
        opts.minDate = moment().startOf('day');
      }

      return (
        <SDaysListItem id={`month-item-${index}`} key={`month-list-${el}`}>
          <RenderDays
            view='sm'
            selectedDate={moment(date).startOf('day')}
            handleSelect={handleChange}
            {...opts}
          />
        </SDaysListItem>
      );
    },
    [date, maxDate, handleChange]
  );

  useOnClickEsc(wrapperRef, handleClose);
  useOnClickOutside(wrapperRef, handleClose);

  useEffect(() => {
    scroller.scrollTo(`month-item-${visibleMonth}`, {
      offset: 0,
      smooth: 'easeInOutQuart',
      duration: 500,
      horizontal: true,
      containerId: 'monthsContainer',
      ignoreCancelEvents: true,
    });
  }, [visibleMonth]);

  return (
    <SWrapper ref={wrapperRef}>
      <SContainer onClick={open ? handleClose : handleClick}>
        <SCalendarLabel variant={2} weight={500}>
          {moment(date)
            .locale(locale || 'en-US')
            .format('MMMM DD')}
        </SCalendarLabel>
        <InlineSVG
          svg={calendarIcon}
          fill={theme.colorsThemed.text.secondary}
          width='24px'
          height='24px'
        />
      </SContainer>
      <AnimatedPresence
        start={animate}
        animation={animation}
        onAnimationEnd={handleAnimationEnd}
        animateWhenInView={false}
      >
        <SListHolder direction={direction}>
          <STopLine>
            <SInlineSVGWrapper
              onClick={handlePrevMonth}
              disabled={!hasPrevMonth}
            >
              {hasPrevMonth && (
                <InlineSVG
                  svg={chevronLeft}
                  fill={theme.colorsThemed.text.secondary}
                  width='20px'
                  height='20px'
                />
              )}
            </SInlineSVGWrapper>
            <SMonth variant={2} weight={600}>
              {moment()
                .locale(locale || 'en-US')
                .add(visibleMonth, 'month')
                .format('MMMM YYYY')}
            </SMonth>
            <SInlineSVGWrapper
              onClick={handleNextMonth}
              disabled={!hasNextMonth}
            >
              {hasNextMonth && (
                <InlineSVG
                  svg={chevronRight}
                  fill={theme.colorsThemed.text.secondary}
                  width='20px'
                  height='20px'
                />
              )}
            </SInlineSVGWrapper>
          </STopLine>
          <SDays>{DAYS.map(renderDay)}</SDays>
          <SDaysList id='monthsContainer'>
            {monthsToRender.map(renderMonth)}
          </SDaysList>
        </SListHolder>
      </AnimatedPresence>
    </SWrapper>
  );
};

export default CalendarSimple;

const SWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const SContainer = styled.div`
  width: 100%;
  cursor: pointer;
  display: flex;
  padding: 12px 20px;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
  justify-content: space-between;

  transition: 0.2s linear;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colorsThemed.background.quaternary};
  }
`;

const SCalendarLabel = styled(Text)``;

interface ISListHolder {
  direction: string;
}

const SListHolder = styled.div<ISListHolder>`
  left: 0;
  width: 356px;
  padding: 24px;
  z-index: 5;
  display: flex;
  overflow: hidden;
  position: absolute;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  box-shadow: ${(props) => props.theme.shadows.intenseGrey};
  border-radius: 16px;
  flex-direction: column;

  ${(props) => {
    if (props.direction === 'down') {
      return css`
        top: 54px;
      `;
    }

    return css`
      bottom: 54px;
    `;
  }}
`;

const STopLine = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SMonth = styled(Text)``;

const SDays = styled.div`
  width: 100%;
  display: flex;
  margin-top: 16px;
  align-items: center;
  justify-content: space-between;
`;

const SDay = styled.div`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SDayLabel = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

interface ISInlineSVGWrapper {
  disabled: boolean;
}

const SInlineSVGWrapper = styled.div<ISInlineSVGWrapper>`
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
    `}
`;

const SDaysList = styled.div`
  display: flex;
  overflow-x: hidden;
  flex-direction: row;
`;

const SDaysListItem = styled.div`
  min-width: 308px;
`;
