import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Text from './Text';
import Modal from '../organisms/Modal';
import Button from './Button';

import { useOnClickEsc } from '../../utils/hooks/useOnClickEsc';
import { useAppSelector } from '../../redux-store/store';
import { useOnClickOutside } from '../../utils/hooks/useOnClickOutside';

import { SUPPORTED_LANGUAGES } from '../../constants/general';

interface IChangeLanguage {}

export const ChangeLanguage: React.FC<IChangeLanguage> = () => {
  const { t } = useTranslation();
  const ref: any = useRef();
  const { push, locale, pathname } = useRouter();
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppSelector((state) => state.ui);

  const options = SUPPORTED_LANGUAGES;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const ddHeight =
    (options.length > 6 ? 372 : options.length * (isTablet ? 50 : 52)) + 24;

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
      <SButton
        key={`change-language-${item}`}
        view={item === locale ? 'modalSecondarySelected' : 'modalSecondary'}
        onClick={handleItemClick}
        selected={item === locale}
      >
        <SItemTitle variant={3} weight={600}>
          {t(`dd-language-title-${item}`)}
        </SItemTitle>
      </SButton>
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
      <Button view='changeLanguage' onClick={handleChangeLanguageClick}>
        {t(`selected-language-title-${locale}`)}
      </Button>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused}>
            <SMobileList>{options.map(renderItem)}</SMobileList>
            <SCancelButton view='modalSecondary' onClick={handleCloseClick}>
              {t('buttonCancel')}
            </SCancelButton>
          </SMobileListContainer>
        </Modal>
      ) : (
        <SListHolder height={ddHeight} focused={focused}>
          {options.map(renderItem)}
        </SListHolder>
      )}
    </SContainer>
  );
};

export default ChangeLanguage;

const SContainer = styled.div`
  position: relative;

  /* TEMP */
  display: none;
`;

interface ISListHolder {
  height: number;
  focused: boolean;
}

const SListHolder = styled.div<ISListHolder>`
  left: 0;
  height: ${(props) => (props.focused ? `${props.height}px` : '0px')};
  bottom: 52px;
  padding: ${(props) => (props.focused ? '12px' : '0 12px')};
  z-index: 1;
  overflow: hidden;
  position: absolute;
  transition: all ease 0.5s;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  padding-bottom: ${(props) => (props.focused ? '12px' : '0px')};
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};

  ${(props) => props.theme.media.tablet} {
    left: unset;
    right: 0;
  }
`;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  text-align: center;
  white-space: nowrap;

  ${(props) => props.theme.media.tablet} {
    text-align: start;
  }
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
  display: flex;
  padding: 12px;
  box-shadow: ${(props) => props.theme.shadows.mediumGrey};
  border-radius: 16px;
  flex-direction: column;
  background-color: ${(props) =>
    props.theme.colorsThemed.background.backgroundDD};
`;

interface ISButton {
  selected: boolean;
}

const SButton = styled(Button)<ISButton>`
  cursor: ${(props) => (props.selected ? 'not-allowed' : 'pointer')};
  padding: 16px;

  ${(props) => props.theme.media.tablet} {
    min-width: 136px;
    justify-content: flex-start;
  }
`;

const SCancelButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 4px;
`;
