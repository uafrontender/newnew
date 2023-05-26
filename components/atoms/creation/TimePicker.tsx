import React, { useRef, useState, useCallback, useMemo } from 'react';
import styled, { css, useTheme } from 'styled-components';
import moment from 'moment';

import Text from '../Text';
import InlineSVG from '../InlineSVG';
import AnimatedPresence, { TElementAnimations } from '../AnimatedPresence';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useDropDownDirection from '../../../utils/hooks/useDropDownDirection';

import timeIcon from '../../../public/images/svg/icons/filled/Time.svg';

import { HOURS, MINUTES, FORMAT } from '../../../constants/general';

interface ITimePicker {
  time: any;
  format: 'pm' | 'am';
  currValue: {
    type: string;
    date: string;
    time: string;
    'hours-format': 'am' | 'pm';
  };
  onChange: (key: string, value: any) => void;
}

export const TimePicker: React.FC<ITimePicker> = (props) => {
  const { time, format, currValue, onChange } = props;
  const theme = useTheme();
  const wrapperRef: any = useRef();
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState<TElementAnimations>('o-12');
  const direction = useDropDownDirection(wrapperRef, 340);

  const isDaySame = useMemo(() => {
    const selectedDate = moment(currValue?.date).startOf('D');
    if (selectedDate) {
      return selectedDate?.isSame(moment().startOf('day'));
    }

    return false;
  }, [currValue.date]);

  const { isTimeOfTheDaySame, localTimeOfTheDay, isHourSame, minutesOffset } =
    useMemo(() => {
      const currentTime = moment();
      const h = currentTime.hour();
      const ltd = h >= 12 ? 'pm' : 'am';

      const timeForCurrentValue = moment(
        `${currValue.time} ${currValue['hours-format']}`,
        'HH:mm a'
      );

      return {
        isTimeOfTheDaySame: ltd === currValue?.['hours-format'],
        localTimeOfTheDay: ltd,
        isHourSame: timeForCurrentValue.hour() === h,
        minutesOffset: currentTime.minute() - 59,
      };
    }, [currValue]);

  const hours = useMemo(() => {
    let offset;
    if (isDaySame) {
      const h = moment().hour();

      if (isTimeOfTheDaySame && localTimeOfTheDay === 'pm' && h !== 12) {
        const hCorrected = h - 13;
        return HOURS.slice(hCorrected);
      }

      if (isTimeOfTheDaySame && localTimeOfTheDay === 'am' && h !== 0) {
        offset = h - 1;

        if (h > 0) {
          return HOURS.slice(offset, HOURS.length - 1);
        }
      }
    }

    if (offset) {
      return HOURS.slice(offset);
    }

    return HOURS;
  }, [isDaySame, isTimeOfTheDaySame, localTimeOfTheDay]);

  const minutes = useMemo(() => {
    if (isDaySame && isHourSame && minutesOffset) {
      return MINUTES.slice(minutesOffset);
    }

    return MINUTES;
  }, [isDaySame, isHourSame, minutesOffset]);

  // Dragging state hours
  const [clientY, setClientY] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseIsDown, setMouseIsDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const mouseDownHandler = (e: any) => {
    if (!scrollContainerRef.current) {
      return;
    }

    setMouseIsDown(true);
    setClientY(e.clientY);
    setScrollY(scrollContainerRef.current.scrollTop);
  };

  const mouseMoveHandler = (e: any) => {
    if (!mouseIsDown) {
      return;
    }

    if (!scrollContainerRef.current) {
      return;
    }

    if (e.clientY === clientY) {
      return;
    }

    scrollContainerRef.current.scrollTop = scrollY - e.clientY + clientY;
    setClientY(e.clientY);
    setScrollY(scrollY - e.clientY + clientY);
    setIsDragging(true);
  };

  const mouseUpHandler = () => {
    setMouseIsDown(false);

    if (isDragging) {
      setTimeout(() => {
        setIsDragging(false);
      }, 0);
    }
  };

  // Dragging state minutes
  const [clientYMinutes, setClientYMinutes] = useState<number>(0);
  const [scrollYMinutes, setScrollYMinutes] = useState<number>(0);
  const [isDraggingMinutes, setIsDraggingMinutes] = useState(false);
  const [mouseIsDownMinutes, setMouseIsDownMinutes] = useState(false);
  const scrollContainerRefMinutes = useRef<HTMLDivElement>(null);

  const mouseDownHandlerMinutes = (e: any) => {
    if (!scrollContainerRefMinutes.current) {
      return;
    }

    setMouseIsDownMinutes(true);
    setClientYMinutes(e.clientY);
    setScrollYMinutes(scrollContainerRefMinutes.current.scrollTop);
  };

  const mouseMoveHandlerMinutes = (e: any) => {
    if (!mouseIsDownMinutes) {
      return;
    }

    if (!scrollContainerRefMinutes.current) {
      return;
    }

    if (e.clientY === clientYMinutes) {
      return;
    }

    scrollContainerRefMinutes.current.scrollTop =
      scrollYMinutes - e.clientY + clientYMinutes;
    setClientYMinutes(e.clientY);
    setScrollYMinutes(scrollYMinutes - e.clientY + clientYMinutes);
    setIsDraggingMinutes(true);
  };

  const mouseUpHandlerMinutes = () => {
    setMouseIsDownMinutes(false);

    if (isDraggingMinutes) {
      setTimeout(() => {
        setIsDraggingMinutes(false);
      }, 0);
    }
  };

  const hour = time.split(':')[0];
  const minute = time.split(':')[1];

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
  const handleTimeChange = useCallback(
    (value: string) => {
      onChange('time', value);
    },
    [onChange]
  );
  const handleFormatChange = useCallback(
    (value: string) => {
      onChange('hours-format', value);
    },
    [onChange]
  );

  const renderHourItem = useCallback(
    (item: any) => {
      const selected = hour === item.value;

      const handleItemClick = () => {
        if (!isDragging) {
          // Check if day and time are going to be the same

          const currentTime = moment();
          const h = currentTime.hour();
          const ltd = h >= 12 ? 'pm' : 'am';

          const timeForItemValue = moment(
            `${item.value}:${minute} ${currValue['hours-format']}`,
            'HH:mm a'
          );

          const isTimeOfTheDaySameForItemValue =
            ltd === currValue?.['hours-format'];
          const localTimeOfTheDayForItemValue = ltd;
          const isHourSameForItemValue = timeForItemValue.hour() === h;
          const minutesOffsetForItemValue = currentTime.minute() - 59;
          const availableMinutes = MINUTES.slice(minutesOffsetForItemValue);
          let minuteIsInAvailableMinutes = false;
          for (let i = 0; i < availableMinutes.length; i++) {
            if (availableMinutes[i].value === minute) {
              minuteIsInAvailableMinutes = true;
              break;
            }
          }
          if (
            isTimeOfTheDaySameForItemValue &&
            localTimeOfTheDayForItemValue &&
            isHourSameForItemValue
          ) {
            if (!minuteIsInAvailableMinutes) {
              handleTimeChange(`${item.value}:${availableMinutes[0].value}`);
            } else {
              handleTimeChange(`${item.value}:${minute}`);
            }
          } else {
            handleTimeChange(`${item.value}:${minute}`);
          }
        }
      };

      return (
        <SItem
          id={`hour-${item.value}`}
          key={`hours-item-${item.value}`}
          onClick={handleItemClick}
          selected={selected}
        >
          <SItemLabel weight={500} variant={2} selected={selected}>
            {item.name}
          </SItemLabel>
        </SItem>
      );
    },
    [hour, minute, currValue, isDragging, handleTimeChange]
  );

  const renderMinuteItem = useCallback(
    (item: any) => {
      const selected = minute === item.value;
      const handleItemClick = () => {
        if (!isDraggingMinutes) {
          handleTimeChange(`${hour}:${item.value}`);
        }
      };

      return (
        <SItem
          id={`minute-${item.value}`}
          key={`minute-item-${item.value}`}
          onClick={handleItemClick}
          selected={selected}
        >
          <SItemLabel weight={500} variant={2} selected={selected}>
            {item.name}
          </SItemLabel>
        </SItem>
      );
    },
    [handleTimeChange, isDraggingMinutes, hour, minute]
  );
  const renderFormatItem = useCallback(
    (item: any) => {
      const selected = format === item.value;

      const isDisabled =
        item.value === 'am' && isDaySame && localTimeOfTheDay === 'pm';
      const handleItemClick = () => {
        if (isDisabled) return;
        handleFormatChange(item.value);
      };

      return (
        <SItem
          id={`format-${item.value}`}
          key={`format-item-${item.value}`}
          onClick={handleItemClick}
          isDisabled={isDisabled}
          selected={selected}
        >
          <SItemLabel weight={500} variant={2} selected={selected}>
            {item.name}
          </SItemLabel>
        </SItem>
      );
    },
    [format, handleFormatChange, isDaySame, localTimeOfTheDay]
  );

  useOnClickEsc(wrapperRef, handleClose);
  useOnClickOutside(wrapperRef, handleClose);

  return (
    <SWrapper ref={wrapperRef}>
      <SContainer onClick={open ? handleClose : handleClick}>
        <SCalendarLabel variant={2} weight={500}>
          {`${time} ${format.toUpperCase()}`}
        </SCalendarLabel>
        <InlineSVG
          svg={timeIcon}
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
          <SScrollListWrapper>
            <SScrollList
              id='hoursContainer'
              ref={scrollContainerRef}
              onMouseUp={mouseUpHandler}
              onMouseDown={mouseDownHandler}
              onMouseMove={mouseMoveHandler}
              onMouseLeave={mouseUpHandler}
            >
              {hours.map(renderHourItem)}
            </SScrollList>
          </SScrollListWrapper>
          <SScrollListWrapper>
            <SScrollList
              id='minutesContainer'
              ref={scrollContainerRefMinutes}
              onMouseUp={mouseUpHandlerMinutes}
              onMouseDown={mouseDownHandlerMinutes}
              onMouseMove={mouseMoveHandlerMinutes}
              onMouseLeave={mouseUpHandlerMinutes}
            >
              {minutes.map(renderMinuteItem)}
            </SScrollList>
          </SScrollListWrapper>
          <SScrollList noPadding>{FORMAT.map(renderFormatItem)}</SScrollList>
        </SListHolder>
      </AnimatedPresence>
    </SWrapper>
  );
};

export default TimePicker;

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
  right: 0;
  height: 340px;
  padding: 10px;
  z-index: 5;
  display: flex;
  overflow: hidden;
  position: absolute;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  border-radius: 16px;
  flex-direction: row;
  justify-content: space-between;

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

interface ISScrollList {
  noPadding?: boolean;
}

const SScrollListWrapper = styled.div`
  overflow: hidden;
`;
const SScrollList = styled.div<ISScrollList>`
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 14px;
  margin-right: -14px;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${(props) =>
    !props.noPadding &&
    css`
      padding-right: 8px;
    `}
`;

interface ISItem {
  selected: boolean;
  isDisabled?: boolean;
}

const SItem = styled.div<ISItem>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 5px 0;
  margin: 0 8px;
  width: 40px;
  text-align: center;
  background: ${(props) =>
    props.selected ? props.theme.colorsThemed.accent.blue : 'transparent'};
  border-radius: 12px;

  user-select: none;

  :hover {
    background: ${(props) =>
      props.selected
        ? props.theme.colorsThemed.accent.blue
        : props.theme.colorsThemed.background.quaternary};
  }

  ${({ isDisabled }) =>
    isDisabled
      ? css`
          opacity: 0.6;
          cursor: not-allowed;
        `
      : null}
`;

const SItemLabel = styled(Text)<ISItem>`
  color: ${(props) =>
    props.selected
      ? props.theme.colors.white
      : props.theme.colorsThemed.text.primary};
`;
