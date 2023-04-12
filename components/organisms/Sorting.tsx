import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Modal from './Modal';
import Button from '../atoms/Button';
import Caption from '../atoms/Caption';
import Headline from '../atoms/Headline';
import SortItem from '../molecules/SortItem';
import InlineSVG from '../atoms/InlineSVG';
import SortIconAnimated from '../atoms/SortIconAnimated';
import AnimatedPresence from '../atoms/AnimatedPresence';

import { useOnClickEsc } from '../../utils/hooks/useOnClickEsc';
import { useOnClickOutside } from '../../utils/hooks/useOnClickOutside';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';
import { useAppState } from '../../contexts/appStateContext';

interface ISorting {
  category: string;
  options: Record<string, string>[];
  selected?: Record<string, string>;
  onChange: (selected: any) => void;
}

export const Sorting: React.FC<ISorting> = (props) => {
  const { category, options, selected, onChange } = props;
  const { t } = useTranslation('page-SeeMore');
  const ref: any = useRef();
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const selectedCount = selected ? Object.keys(selected).length : 0;

  const handleToggleSortingClick = useCallback(() => {
    setFocused(!focused);
  }, [focused]);
  const handleCloseClick = useCallback(() => {
    setFocused(false);
  }, []);
  const handleChange = useCallback(
    (itemKey: string, parentKey: string) => {
      const newSelected: any = {
        ...selected,
      };

      if (newSelected[parentKey] === itemKey) {
        // @ts-ignore
        delete newSelected[parentKey];
      } else {
        // @ts-ignore
        newSelected[parentKey] = itemKey;
      }

      onChange(newSelected);
    },
    [selected, onChange]
  );
  const renderItem = useCallback(
    (item: any, index: number) => {
      const isLast = index !== options.length - 1;

      return (
        <SItemWrapper key={`sort-item-${item.key}`}>
          <SortItem
            item={item}
            category={category}
            selected={selected}
            handleChange={handleChange}
          />
          {isLast && <SSeparator />}
        </SItemWrapper>
      );
    },
    [handleChange, selected, options.length, category]
  );
  const handleSubmit = useCallback(() => {
    setFocused(false);
  }, []);

  useOnClickEsc(ref, handleCloseClick);
  const handleClickOutside = useCallback(() => {
    if (!isMobile) {
      handleCloseClick();
    }
  }, [isMobile, handleCloseClick]);

  useOnClickOutside(ref, handleClickOutside);

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 0);
  }, []);

  const content = (
    <SWrapper ref={ref}>
      <SButton
        view={isMobile ? 'primary' : 'secondary'}
        onClick={handleToggleSortingClick}
      >
        <SButtonContent>
          {/* {t('sorting.title')} */}
          {!!selectedCount && isMobile && (
            <SSelectedCounter>
              <SSelectedCounterText variant={2} weight={700}>
                {selectedCount}
              </SSelectedCounterText>
            </SSelectedCounter>
          )}
          <SMenuButton>
            <SortIconAnimated
              color={
                isMobile
                  ? theme.colorsThemed.button.color.primary
                  : theme.colorsThemed.text.secondary
              }
              width={16}
              height={10}
              isOpen={focused}
              onClick={handleToggleSortingClick}
              strokeWidth={2}
            />
          </SMenuButton>
        </SButtonContent>
      </SButton>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused}>
            <SMobileList>
              <STopLine>
                <Headline variant={6}>{t('sorting.title')}</Headline>
                <SCloseIconWrapper onClick={handleCloseClick}>
                  <InlineSVG
                    svg={closeIcon}
                    fill={theme.colorsThemed.text.primary}
                    width='20px'
                    height='20px'
                  />
                </SCloseIconWrapper>
              </STopLine>
              {options.map(renderItem)}
            </SMobileList>
            <SCancelButton withShadow view='primaryGrad' onClick={handleSubmit}>
              {t('sorting.button.showResults')}
            </SCancelButton>
          </SMobileListContainer>
        </Modal>
      ) : (
        <SListHolder focused={focused}>{options.map(renderItem)}</SListHolder>
      )}
    </SWrapper>
  );

  if (isMobile) {
    if (
      animate &&
      (document?.getElementById('sorting-container') as HTMLElement)
    ) {
      return createPortal(
        <AnimatedPresence
          start={animate}
          animation='trans-06'
          animateWhenInView={false}
        >
          {content}
        </AnimatedPresence>,
        document?.getElementById('sorting-container') as HTMLElement
      );
    }
    return <div />;
  }

  return content;
};

export default Sorting;

const SWrapper = styled.div`
  position: relative;
  pointer-events: all;
`;

const SButton = styled(Button)`
  padding: 12px 16px;
  border-radius: 50px;

  ${(props) => props.theme.media.tablet} {
    padding: 8px 16px;
    border-radius: 12px;
  }
`;

const SButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SCloseIconWrapper = styled.div`
  width: 36px;
  cursor: pointer;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SMenuButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ISListHolder {
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  top: 52px;
  left: 0;
  opacity: ${(props) => (props.focused ? 1 : 0)};
  z-index: 2;
  padding: 8px;
  overflow: hidden;
  position: absolute;
  transition: opacity ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  pointer-events: ${(props) => (props.focused ? 'unset' : 'none')};
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};

  ${(props) => props.theme.media.tablet} {
    left: unset;
    right: 0;
  }
`;

const SItemWrapper = styled.div`
  min-width: 200px;
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

const SMobileList = styled.div`
  padding: 16px;
  display: flex;
  overflow: auto;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};
`;

const SCancelButton = styled(Button)`
  padding: 16px 20px;
  margin-top: 4px;
`;

const STopLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  justify-content: space-between;
`;

const SSeparator = styled.div`
  left: -16px;
  width: calc(100% + 32px);
  margin: 8px 0;
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  position: relative;

  ${(props) => props.theme.media.tablet} {
    left: 0;
    width: 100%;
  }
`;

const SSelectedCounter = styled.div`
  width: 18px;
  height: 18px;
  overflow: hidden;
  position: relative;
  margin-left: 4px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colors.white};
`;

const SSelectedCounterText = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  line-height: 18px;
`;
