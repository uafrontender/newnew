import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../atoms/Text';
import Modal from './Modal';
import Button from '../atoms/Button';
import Caption from '../atoms/Caption';
import Headline from '../atoms/Headline';
import CheckBox from '../molecules/CheckBox';
import InlineSVG from '../atoms/InlineSVG';
import SortIconAnimated from '../atoms/SortIconAnimated';
import AnimatedPresence from '../atoms/AnimatedPresence';

import { useOnClickEsc } from '../../utils/hooks/useOnClickEsc';
import { useAppSelector } from '../../redux-store/store';
import { useOnClickOutside } from '../../utils/hooks/useOnClickOutside';

import closeIcon from '../../public/images/svg/icons/outlined/Close.svg';

interface ISorting {
  options: any;
  selected: any;
  onChange: (selected: any) => void;
}

export const Sorting: React.FC<ISorting> = (props) => {
  const {
    options,
    selected,
    onChange,
  } = props;
  const { t } = useTranslation('home');
  const ref: any = useRef();
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);
  const [focused, setFocused] = useState(false);
  const [localSelected, setLocalSelected] = useState({});
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const selectedCount = Object.keys(selected).length;
  let ddHeight = 0;

  if (options.length <= 2) {
    ddHeight = options.length * 124;
  } else if (options.length > 2) {
    ddHeight = ((options.length - 2) * 176) + (124 * 2);
  }

  ddHeight += 16;

  const handleToggleSortingClick = () => {
    setFocused(!focused);
  };
  const handleCloseClick = () => {
    setFocused(false);
    setLocalSelected(selected);
  };
  const renderItemOption = (option: any, index: number, parentOption: any) => {
    let optionSelected: boolean = false;

    // @ts-ignore
    if (localSelected[parentOption.key] === option.key) {
      optionSelected = true;
    }

    const handleChange = (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      const newSelected = {
        ...localSelected,
      };

      if (optionSelected) {
        // @ts-ignore
        delete newSelected[parentOption.key];
      } else {
        // @ts-ignore
        newSelected[parentOption.key] = option.key;
      }

      if (isMobile) {
        setLocalSelected(newSelected);
      } else {
        onChange(newSelected);
      }
    };

    return (
      <SItemOptionWrapper
        key={`change-language-${parentOption.key}-${option.key}`}
      >
        <CheckBox
          label={t(`sort-title-option-${parentOption.key}-${option.key}`)}
          selected={optionSelected}
          handleChange={handleChange}
        />
      </SItemOptionWrapper>
    );
  };
  const renderItem = (item: any, index: number) => {
    const isLast = index !== options.length - 1;

    return (
      <SItemWrapper
        key={`change-language-${item.key}`}
      >
        <SItemHolder>
          <SItemTitle variant={3} weight={600}>
            {t(`sort-title-option-${item.key}`)}
          </SItemTitle>
          {item.options.map(
            (option: any, optIndex: number) => renderItemOption(option, optIndex, item),
          )}
        </SItemHolder>
        {isLast && <SSeparator />}
      </SItemWrapper>
    );
  };
  const handleSubmit = () => {
    onChange(localSelected);
    setFocused(false);
  };

  useOnClickEsc(ref, handleCloseClick);
  useOnClickOutside(ref, () => {
    if (!isMobile) {
      handleCloseClick();
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
    }, 0);
  }, []);
  useEffect(() => {
    setLocalSelected(selected);
  }, [selected]);

  const content = (
    <SWrapper ref={ref}>
      <SButton
        view={isMobile ? 'primary' : 'secondary'}
        onClick={handleToggleSortingClick}
      >
        <SButtonContent>
          {t('sort-title')}
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
                <Headline variant={6}>
                  {t('sort-title')}
                </Headline>
                <SCloseIconWrapper
                  onClick={handleCloseClick}
                >
                  <InlineSVG
                    svg={closeIcon}
                    fill={theme.colorsThemed.text.primary}
                    width="20px"
                    height="20px"
                  />
                </SCloseIconWrapper>
              </STopLine>
              {options.map(renderItem)}
            </SMobileList>
            <SCancelButton
              withShadow
              view="primaryGrad"
              onClick={handleSubmit}
            >
              {t('button-show-results')}
            </SCancelButton>
          </SMobileListContainer>
        </Modal>
      ) : (
        <SListHolder
          height={ddHeight}
          focused={focused}
        >
          {options.map(renderItem)}
        </SListHolder>
      )}
    </SWrapper>
  );

  if (isMobile) {
    if (animate) {
      // @ts-ignore
      return createPortal(
        <AnimatedPresence
          start={animate}
          animation="trans-06"
          animateWhenInView={false}
        >
          {content}
        </AnimatedPresence>,
        document.getElementById('sorting-container') as HTMLElement,
      );
    }
    return <></>;
  }

  return content;
};

export default Sorting;

const SWrapper = styled.div`
  position: relative;
  pointer-events: all;
`;

const SButton = styled(Button)`
  padding: 12px 12px 11px 20px;
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
  margin-left: 8px;
  align-items: center;
  justify-content: center;
`;

interface ISListHolder {
  height: number;
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  top: 52px;
  left: 0;
  height: ${(props) => (props.focused ? `${props.height}px` : '0px')};
  z-index: 2;
  padding: ${(props) => (props.focused ? '8px' : '0px 8px')};
  overflow: hidden;
  position: absolute;
  transition: all ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDD};

  ${(props) => props.theme.media.tablet} {
    left: unset;
    right: 0;
  }
`;

const SItemHolder = styled.div``;

const SItemWrapper = styled.div`
  min-width: 200px;
`;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  padding: 8px;
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
  background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDD};
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
  border: 1px solid ${(props) => props.theme.colorsThemed.grayscale.outlines1};
  position: relative;

  ${(props) => props.theme.media.tablet} {
    left: 0;
    width: 100%;
  }
`;

const SItemOptionWrapper = styled.div`
  cursor: pointer;
  padding: 8px 8px 8px 0;
  border-radius: 12px;
  
  :hover {
    background-color: ${(props) => props.theme.colorsThemed.grayscale.backgroundDDSelected};
  }
`;

const SSelectedCounter = styled.div`
  width: 18px;
  height: 18px;
  overflow: hidden;
  margin-left: 4px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colors.white};
`;

const SSelectedCounterText = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.accent.blue};
  line-height: 18px;
`;
