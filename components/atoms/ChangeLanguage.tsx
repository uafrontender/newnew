import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Text from './Text';
import Modal from '../organisms/Modal';
import Caption from './Caption';

import { useOnClickEsc } from '../../utils/clickEsc';
import { useAppSelector } from '../../redux-store/store';
import { useOnClickOutside } from '../../utils/clickOutside';

import { SUPPORTED_LANGUAGES } from '../../constants/general';

interface IChangeLanguage {
}

export const ChangeLanguage: React.FC<IChangeLanguage> = () => {
  const { t } = useTranslation();
  const ref: any = useRef();
  const {
    push,
    locale,
    pathname,
  } = useRouter();
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const options = SUPPORTED_LANGUAGES;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const ddHeight = (options.length > 6 ? 432 : options.length * 72) + 12;

  const handleChangeLanguageClick = () => {
    setFocused(!focused);
  };
  const handleCloseClick = () => {
    setFocused(false);
  };
  const renderItem = (item: string) => {
    const handleItemClick = () => {
      push(pathname, pathname, { locale: item });
    };

    return (
      <SItemHolder
        key={`change-language-${item}`}
        onClick={handleItemClick}
        selected={item === locale}
      >
        <SItemTitle variant={3}>
          {t(`dd-language-title-${item}`)}
        </SItemTitle>
        <SItemSubTitle variant={1}>
          {t(`dd-language-subTitle-${item}`)}
        </SItemSubTitle>
      </SItemHolder>
    );
  };

  useOnClickEsc(ref, handleCloseClick);
  useOnClickOutside(ref, () => {
    if (!isMobile) {
      handleCloseClick();
    }
  });

  return (
    <SContainer ref={ref}>
      <SContent onClick={handleChangeLanguageClick}>
        <STitle>
          {t(`selected-language-title-${locale}`)}
        </STitle>
      </SContent>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused} height={ddHeight}>
            <SMobileList height={ddHeight} focused={focused}>
              {options.map(renderItem)}
            </SMobileList>
            <SCancelItemHolder onClick={handleCloseClick}>
              <SCancelItemTitleHolder>
                Close
              </SCancelItemTitleHolder>
            </SCancelItemHolder>
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
    </SContainer>
  );
};

export default ChangeLanguage;

const SContainer = styled.div`
  position: relative;
`;

const SContent = styled.div`
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};
`;

const STitle = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
`;

interface ISListHolder {
  height: number;
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  left: 0;
  height: ${(props) => (props.focused ? `${props.height}px` : '0px')};
  bottom: 52px;
  z-index: 1;
  overflow: auto;
  position: absolute;
  min-width: 160px;
  transition: all ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  padding-bottom: ${(props) => (props.focused ? '12px' : '0px')};
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};

  ${(props) => props.theme.media.tablet} {
    left: unset;
    right: 0;
  }
`;

interface ISItemHolder {
  selected: boolean;
}

const SItemHolder = styled.div<ISItemHolder>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  margin: 12px 12px 0;
  padding: 12px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed[props.selected ? 'footerDDSelectedBackground' : 'footerButtonBackground']};
`;

const SItemTitle = styled(Text)`
  text-align: center;
  font-weight: 600;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
    font-weight: 500;
  }
`;

const SItemSubTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.footerDDItemColor};
  text-align: center;
  font-weight: 600;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
    font-weight: 500;
  }
`;

const SMobileListContainer = styled.div<ISListHolder>`
  width: 100%;
  bottom: ${(props) => (props.focused ? 0 : '-100vh')};
  height: 100%;
  display: flex;
  position: relative;
  transition: bottom ease 0.5s;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;
`;

const SMobileList = styled.div<ISListHolder>`
  height: ${(props) => props.height}px;
  display: flex;
  overflow: auto;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};
`;

const SCancelItemHolder = styled.div`
  cursor: pointer;
  margin: 4px 0 0;
  padding: 16px 32px;
  border-radius: 16px;
  background-color: ${(props) => props.theme.colorsThemed.footerButtonBackground};
`;

const SCancelItemTitleHolder = styled.div`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  line-height: 24px;
`;
