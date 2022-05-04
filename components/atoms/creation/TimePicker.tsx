import React, { useRef, useState, useEffect, useCallback } from 'react';
import { scroller } from 'react-scroll';
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
    (value: any) => {
      onChange('time', value);
    },
    [onChange]
  );
  const handleFormatChange = useCallback(
    (value: any) => {
      onChange('hours-format', value);
    },
    [onChange]
  );

  const renderHourItem = useCallback(
    (item: any) => {
      const selected = hour === item.value;
      const handleItemClick = () => {
        handleTimeChange(`${item.value}:${minute}`);
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
    [handleTimeChange, hour, minute]
  );
  const renderMinuteItem = useCallback(
    (item: any) => {
      const selected = minute === item.value;
      const handleItemClick = () => {
        handleTimeChange(`${hour}:${item.value}`);
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
    [handleTimeChange, hour, minute]
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

  useEffect(() => {
    scroller.scrollTo(`hour-${hour}`, {
      offset: 0,
      smooth: 'easeInOutQuart',
      duration: 500,
      containerId: 'hoursContainer',
    });
  }, [hour]);
  useEffect(() => {
    scroller.scrollTo(`minute-${minute}`, {
      offset: 0,
      smooth: 'easeInOutQuart',
      duration: 500,
      containerId: 'minutesContainer',
    });
  }, [minute]);

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
            <SScrollList id='hoursContainer'>
              {HOURS.map(renderHourItem)}
            </SScrollList>
          </SScrollListWrapper>
          <SScrollListWrapper>
            <SScrollList id='minutesContainer'>
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
