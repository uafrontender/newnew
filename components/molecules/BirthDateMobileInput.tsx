import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import Button from '../atoms/Button';
import { TDropdownSelectItem } from '../atoms/DropdownSelect';

interface IBirthDateMobileInput {
  currentDate: newnewapi.IDateComponents;
  months: TDropdownSelectItem<number>[];
  years: TDropdownSelectItem<number>[];
  handleChangeDate: (newValue: newnewapi.IDateComponents) => void;
  handleClose: () => void;
}

const BirthDateMobileInput: React.FunctionComponent<IBirthDateMobileInput> = ({
  currentDate,
  months,
  years,
  handleChangeDate,
  handleClose,
}) => {
  const theme = useTheme();
  const [innerDate, setInnerDate] = useState(
    currentDate.day && currentDate.month && currentDate.year
      ? currentDate
      : {
          day: 1,
          month: 1,
          year: years[0].value,
        }
  );
  const [availableDays, setAvailableDays] = useState<
    TDropdownSelectItem<number>[]
  >(() => {
    if (!innerDate?.month || !innerDate?.year) {
      return Array(31)
        .fill('')
        .map((_, i) => ({
          name: (i + 1).toString(),
          value: i + 1,
        }));
    }

    return Array(new Date(innerDate?.year, innerDate?.month, 0).getDate())
      .fill('')
      .map((_, i) => ({
        name: (i + 1).toString(),
        value: i + 1,
      }));
  });

  const handleUpdateDay = useCallback(
    (day: number) => {
      const working = { ...innerDate };
      working.day = day;
      setInnerDate(working);
    },
    [innerDate]
  );

  const handleUpdateMonth = useCallback(
    (month: number) => {
      const working = { ...innerDate };
      working.month = month;
      setInnerDate(working);
    },
    [innerDate]
  );

  const handleUpdateYear = useCallback(
    (year: number) => {
      const working = { ...innerDate };
      working.year = year;
      setInnerDate(working);
    },
    [innerDate]
  );

  const daysScrollerRef = useRef<HTMLDivElement>();
  const monthsScrollerRef = useRef<HTMLDivElement>();
  const yearsScrollerRef = useRef<HTMLDivElement>();

  const daysRefs = useRef<HTMLDivElement[]>(new Array(31));
  const monthsRefs = useRef<HTMLDivElement[]>(new Array(months.length));
  const yearsRefs = useRef<HTMLDivElement[]>(new Array(years.length));

  useEffect(() => {
    const updateDay = () => {
      const boundingRect = daysScrollerRef.current?.getBoundingClientRect();
      for (let i = 0; i < daysRefs.current.length; i++) {
        const itemRect = daysRefs.current[i]?.getBoundingClientRect();
        if (!itemRect) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const pos = itemRect.top - boundingRect!!.top!!;
        if (pos > 48 && pos < 72) {
          handleUpdateDay(availableDays[i].value);
          break;
        }
      }
    };

    const updateMonth = () => {
      const boundingRect = monthsScrollerRef.current?.getBoundingClientRect();
      for (let i = 0; i < monthsRefs.current.length; i++) {
        const pos =
          monthsRefs.current[i].getBoundingClientRect().top -
          boundingRect!!.top!!;
        if (pos > 48 && pos < 72) {
          handleUpdateMonth(months[i].value);
          break;
        }
      }
    };

    const updateYear = () => {
      const boundingRect = yearsScrollerRef.current?.getBoundingClientRect();
      for (let i = 0; i < yearsRefs.current.length; i++) {
        const pos =
          yearsRefs.current[i].getBoundingClientRect().top -
          boundingRect!!.top!!;
        if (pos > 48 && pos < 72) {
          handleUpdateYear(years[i].value);
          break;
        }
      }
    };

    daysScrollerRef.current?.addEventListener('scroll', updateDay);
    monthsScrollerRef.current?.addEventListener('scroll', updateMonth);
    yearsScrollerRef.current?.addEventListener('scroll', updateYear);

    return () => {
      daysScrollerRef.current?.removeEventListener('scroll', updateDay);
      monthsScrollerRef.current?.removeEventListener('scroll', updateMonth);
      yearsScrollerRef.current?.removeEventListener('scroll', updateYear);
    };
  }, [
    availableDays,
    handleUpdateDay,
    handleUpdateMonth,
    handleUpdateYear,
    months,
    years,
  ]);

  useEffect(() => {
    daysScrollerRef.current?.scrollBy({
      top: availableDays.findIndex((i) => i.value === currentDate.day) * 28,
    });
    monthsScrollerRef.current?.scrollBy({
      top: months.findIndex((i) => i.value === currentDate.month) * 28,
    });
    yearsScrollerRef.current?.scrollBy({
      top: years.findIndex((i) => i.value === currentDate.year) * 28,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAvailableDays(() => {
      if (!innerDate?.month || !innerDate?.year) {
        return Array(31)
          .fill('')
          .map((_, i) => ({
            name: (i + 1).toString(),
            value: i + 1,
          }));
      }

      return Array(new Date(innerDate?.year, innerDate?.month, 0).getDate())
        .fill('')
        .map((_, i) => ({
          name: (i + 1).toString(),
          value: i + 1,
        }));
    });
  }, [innerDate?.month, innerDate?.year, setAvailableDays]);

  useEffect(() => {
    if (
      innerDate?.day &&
      availableDays.findIndex((o) => o.value === innerDate.day) === -1
    ) {
      daysScrollerRef.current?.scrollTo({
        top: daysRefs.current[availableDays.length - 1].offsetTop,
      });
    }
  }, [availableDays, innerDate.day]);

  return (
    <SContainer onClick={(e) => e.stopPropagation()}>
      <SDateInputContainer>
        <SScroller
          ref={(el) => {
            daysScrollerRef.current = el!!;
          }}
        >
          {availableDays.map((d, i) => (
            <SScrollerItem
              ref={(el) => {
                daysRefs.current[i] = el!!;
              }}
              key={d.value}
              style={{
                ...(innerDate.day === d.value
                  ? {
                      color: theme.colorsThemed.text.primary,
                    }
                  : {}),
              }}
            >
              {d.value}
            </SScrollerItem>
          ))}
        </SScroller>
        <SScroller
          ref={(el) => {
            monthsScrollerRef.current = el!!;
          }}
        >
          {months.map((m, i) => (
            <SScrollerItem
              ref={(el) => {
                monthsRefs.current[i] = el!!;
              }}
              key={m.value}
              style={{
                ...(innerDate.month === m.value
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
        <SScroller
          ref={(el) => {
            yearsScrollerRef.current = el!!;
          }}
        >
          {years.map((y, i) => (
            <SScrollerItem
              ref={(el) => {
                yearsRefs.current[i] = el!!;
              }}
              key={y.value}
              style={{
                ...(innerDate.year === y.value
                  ? {
                      color: theme.colorsThemed.text.primary,
                    }
                  : {}),
              }}
            >
              {y.value}
            </SScrollerItem>
          ))}
        </SScroller>
      </SDateInputContainer>
      <SButton
        view='primaryGrad'
        onClick={() => {
          handleChangeDate(innerDate);
          handleClose();
        }}
      >
        Save
      </SButton>
    </SContainer>
  );
};

export default BirthDateMobileInput;

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
