/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import moment from 'moment';

import { ITimeComponents } from './TimePicker';
import { TDropdownSelectItem } from '../../atoms/DropdownSelect';
import Button from '../../atoms/Button';
import { MINUTES } from '../../../constants/general';

interface ITimePickerMobileModal {
  currentTime: ITimeComponents;
  isDaySame: boolean;
  hours: TDropdownSelectItem<string>[];
  hoursFormat: 'am' | 'pm';
  handleChangeTime: (newValue: ITimeComponents) => void;
  handleClose: () => void;
}

const TimePickerMobileModal: React.FunctionComponent<
  ITimePickerMobileModal
> = ({
  currentTime,
  isDaySame,
  hours,
  hoursFormat,
  handleChangeTime,
  handleClose,
}) => {
  const theme = useTheme();
  const [innerTime, setInnerTime] = useState(
    currentTime.hours && currentTime.minutes
      ? currentTime
      : {
          hours: '00',
          minutes: '00',
        }
  );

  const { isHourSame, minutesOffset } = useMemo(() => {
    const t = moment();
    const h = t.hour();

    const timeForCurrentValue = moment(
      `${innerTime.hours}:${innerTime.minutes} ${hoursFormat}`,
      'HH:mm a'
    );

    return {
      isHourSame: timeForCurrentValue.hour() === h,
      minutesOffset: t.minute() - 59,
    };
  }, [hoursFormat, innerTime.hours, innerTime.minutes]);

  const minutes: TDropdownSelectItem<string>[] = useMemo(() => {
    const minutesAll = new Array(60).fill('').map((_, i) => ({
      value: i.toString().length > 1 ? i.toString() : `0${i.toString()}`,
      name: i.toString().length > 1 ? i.toString() : `0${i.toString()}`,
    }));

    if (isDaySame && isHourSame && minutesOffset) {
      return minutesAll.slice(minutesOffset);
    }

    return minutesAll;
  }, [isDaySame, isHourSame, minutesOffset]);

  const handleUpdateHours = useCallback(
    (newHours: string) => {
      const working = { ...innerTime };
      working.hours = newHours;

      // Check if day and time are going to be the same
      const time = moment();
      const h = time.hour();
      const ltd = h >= 12 ? 'pm' : 'am';

      const timeForItemValue = moment(`${working} ${hoursFormat}`, 'HH:mm a');

      const isTimeOfTheDaySameForItemValue = ltd === hoursFormat;
      const localTimeOfTheDayForItemValue = ltd;
      const isHourSameForItemValue = timeForItemValue.hour() === h;
      const minutesOffsetForItemValue = timeForItemValue.minute() - 59;
      const availableMinutes = MINUTES.slice(minutesOffsetForItemValue);
      let minuteIsInAvailableMinutes = false;
      for (let i = 0; i < availableMinutes.length; i++) {
        if (availableMinutes[i].value === working.minutes) {
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
          working.minutes = availableMinutes[0].value;
        }
      }

      setInnerTime(working);
    },
    [hoursFormat, innerTime]
  );

  const handleUpdateMinutes = useCallback(
    (newMinutes: string) => {
      const working = { ...innerTime };
      working.minutes = newMinutes;
      setInnerTime(working);
    },
    [innerTime]
  );

  const hoursScrollerRef = useRef<HTMLDivElement>();
  const minutesScrollerRef = useRef<HTMLDivElement>();

  const hoursRefs = useRef<HTMLDivElement[]>(new Array(12));
  const minutesRefs = useRef<HTMLDivElement[]>(new Array(60));

  useEffect(() => {
    const updateHours = () => {
      const boundingRect = hoursScrollerRef.current?.getBoundingClientRect();
      for (let i = 0; i < hoursRefs.current.length; i++) {
        const itemRect = hoursRefs.current[i]?.getBoundingClientRect();
        if (!itemRect) continue;
        const pos = itemRect.top - boundingRect!!.top!!;
        if (pos > 48 && pos < 72) {
          handleUpdateHours(hours[i].value);
          break;
        }
      }
    };

    const updateMinutes = () => {
      const boundingRect = minutesScrollerRef.current?.getBoundingClientRect();
      for (let i = 0; i < minutesRefs.current.length; i++) {
        const pos = minutesRefs.current[i]?.getBoundingClientRect?.()?.top
          ? minutesRefs.current[i].getBoundingClientRect().top -
            boundingRect!!.top!!
          : boundingRect!!.top!!;
        if (pos > 48 && pos < 72 && minutes[i]?.value) {
          handleUpdateMinutes(minutes[i].value);
          break;
        } else if (
          !minutes[i]?.value &&
          !minutesRefs.current[i]?.getBoundingClientRect?.()?.top
        ) {
          handleUpdateMinutes(minutes[0].value);
          break;
        }
      }
    };

    hoursScrollerRef.current?.addEventListener('scroll', updateHours);
    minutesScrollerRef.current?.addEventListener('scroll', updateMinutes);

    return () => {
      hoursScrollerRef.current?.removeEventListener('scroll', updateHours);
      minutesScrollerRef.current?.removeEventListener('scroll', updateMinutes);
    };
  }, [hours, minutes, handleUpdateHours, handleUpdateMinutes]);

  useEffect(() => {
    hoursScrollerRef.current?.scrollBy({
      top: hours.findIndex((i) => i.value === currentTime.hours) * 28,
    });
    minutesScrollerRef.current?.scrollBy({
      top: minutes.findIndex((i) => i.value === currentTime.minutes) * 28,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      innerTime?.hours &&
      hours.findIndex((o) => o.value === innerTime.hours) === -1
    ) {
      hoursScrollerRef.current?.scrollTo({
        top: 0,
      });
    }
  }, [hours, innerTime.hours]);

  return (
    <SContainer onClick={(e) => e.stopPropagation()}>
      <SDateInputContainer>
        <SScroller
          ref={(el) => {
            hoursScrollerRef.current = el!!;
          }}
        >
          {hours.map((d, i) => (
            <SScrollerItem
              ref={(el) => {
                hoursRefs.current[i] = el!!;
              }}
              key={d.value}
              style={{
                ...(innerTime.hours === d.value
                  ? {
                      color: theme.colorsThemed.text.primary,
                    }
                  : {}),
              }}
            >
              {d.name}
            </SScrollerItem>
          ))}
        </SScroller>
        <SScroller
          ref={(el) => {
            minutesScrollerRef.current = el!!;
          }}
        >
          {minutes.map((m, i) => (
            <SScrollerItem
              ref={(el) => {
                minutesRefs.current[i] = el!!;
              }}
              key={m.value}
              style={{
                ...(innerTime.minutes === m.value
                  ? {
                      color: theme.colorsThemed.text.primary,
                    }
                  : {}),
              }}
            >
              {m.name}
            </SScrollerItem>
          ))}
        </SScroller>
      </SDateInputContainer>
      <SButton
        view='primaryGrad'
        onClick={() => {
          handleChangeTime(innerTime);
          handleClose();
        }}
      >
        Save
      </SButton>
    </SContainer>
  );
};

export default TimePickerMobileModal;

const SContainer = styled.div`
  position: absolute;
  bottom: 0;

  height: 318px;
  width: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.primary};
`;

const SButton = styled(Button)`
  height: 56px;
  width: calc(100% - 32px);
  margin-top: 24px;
  margin-left: 16px;
  margin-right: 16px;
`;

const SDateInputContainer = styled.div`
  position: relative;

  height: 204px;
  width: 100%;

  padding-top: 24px;
  padding-bottom: 24px;
  overflow: hidden;

  display: flex;
  justify-content: center;

  &::before {
    position: absolute;
    top: 0px;
    content: '';
    width: 100%;
    box-shadow: 0px 0px 32px 60px
      ${({ theme }) =>
        theme.name === 'dark'
          ? 'rgba(11, 10, 19, 1)'
          : 'rgba(255, 255, 255, 1)'};
    clip-path: inset(0px 0px -100px 0px);
  }
  &::after {
    position: absolute;
    bottom: 0px;
    content: '';
    width: 100%;
    box-shadow: 0px 0px 32px 60px
      ${({ theme }) =>
        theme.name === 'dark'
          ? 'rgba(11, 10, 19, 1)'
          : 'rgba(255, 255, 255, 1)'};
    clip-path: inset(-100px 0px 0px 0px);
  }
`;

const SScroller = styled.div`
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;

  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  padding-bottom: 64px;
  padding-top: 64px;
`;

const SScrollerItem = styled.div`
  height: 24px;
  scroll-snap-align: center;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;

  padding: 0px 12px;

  margin-left: 12px;
  margin-right: 12px;
  margin-top: 4px;
  margin-bottom: 4px;
`;
