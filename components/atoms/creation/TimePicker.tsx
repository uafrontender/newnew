import React, { useRef, useState, useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';

import Text from '../Text';
import InlineSVG from '../InlineSVG';
import AnimatedPresence, { TAnimation } from '../AnimatedPresence';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useDropDownDirection from '../../../utils/hooks/useDropDownDirection';

import timeIcon from '../../../public/images/svg/icons/filled/Time.svg';

import { HOURS, MINUTES, FORMAT } from '../../../constants/general';

interface ITimePicker {
  time: any;
  format: 'pm' | 'am';
  onChange: (key: string, value: any) => void;
}

export const TimePicker: React.FC<ITimePicker> = (props) => {
  const { time, format, onChange } = props;
  const theme = useTheme();
  const wrapperRef: any = useRef();
  const [open, setOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animation, setAnimation] = useState('o-12');
  const direction = useDropDownDirection(wrapperRef, 340);

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
    setAnimation('o-12-reversed');
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
          handleTimeChange(`${item.value}:${minute}`);
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
    [handleTimeChange, isDragging, hour, minute]
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
      const handleItemClick = () => {
        handleFormatChange(item.value);
      };

      return (
        <SItem
          id={`format-${item.value}`}
          key={`format-item-${item.value}`}
          onClick={handleItemClick}
          selected={selected}
        >
          <SItemLabel weight={500} variant={2} selected={selected}>
            {item.name}
          </SItemLabel>
        </SItem>
      );
    },
    [format, handleFormatChange]
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
        animation={animation as TAnimation}
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
              {HOURS.map(renderHourItem)}
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
              {MINUTES.map(renderMinuteItem)}
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
  padding-right: 17px;
  margin-right: -17px;
  ${(props) =>
    !props.noPadding &&
    css`
      padding-right: 8px;
    `}
`;

interface ISItem {
  selected: boolean;
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
`;

const SItemLabel = styled(Text)<ISItem>`
  color: ${(props) =>
    props.selected
      ? props.theme.colors.white
      : props.theme.colorsThemed.text.primary};
`;
