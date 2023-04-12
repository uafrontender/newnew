import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCookies } from 'react-cookie';

import Text from './Text';
import Modal from '../organisms/Modal';
import Button from './Button';

import { useOnClickEsc } from '../../utils/hooks/useOnClickEsc';
import { useOnClickOutside } from '../../utils/hooks/useOnClickOutside';

import { SUPPORTED_LANGUAGES } from '../../constants/general';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';

interface IChangeLanguage {}

export const ChangeLanguage: React.FC<IChangeLanguage> = (props) => {
  const { t } = useTranslation('common');
  const ref: any = useRef();
  const { locale } = useRouter();
  const [focused, setFocused] = useState(false);
  const { resizeMode } = useAppState();

  const [, setCookie] = useCookies();

  const options = SUPPORTED_LANGUAGES;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);

  const ddHeight =
    (options.length > 6 ? 372 : options.length * (isTablet ? 54 : 56)) + 20;

  const handleChangeLanguageClick = () => {
    setFocused(!focused);
  };

  const handleCloseClick = () => {
    setFocused(false);
  };

  const renderItem = (item: string) => {
    const handleItemClick = () => {
      Mixpanel.track('Language Changed', {
        _component: 'ChangeLanguage',
        _language: item,
      });

      setCookie('preferredLocale', item, {
        // Expire in 10 years
        maxAge: 10 * 365 * 24 * 60 * 60,
        path: '/',
      });
      handleCloseClick();
    };

    return (
      <SButton
        key={`change-language-${item}`}
        view={item === locale ? 'modalSecondarySelected' : 'modalSecondary'}
        onClick={handleItemClick}
        selected={item === locale}
      >
        <SItemTitle variant={3} weight={600}>
          {t(`language.ddLanguageTitle.${item as 'en-US' | 'zh' | 'es'}`)}
        </SItemTitle>
      </SButton>
    );
  };

  useOnClickEsc(ref, handleCloseClick);
  const handleClickOutside = useCallback(() => {
    if (!isMobile) {
      handleCloseClick();
    }
  }, [isMobile]);
  useOnClickOutside(ref, handleClickOutside);

  if (options.length < 2) {
    return null;
  }

  return (
    <SContainer ref={ref} {...props}>
      <Button view='changeLanguage' onClick={handleChangeLanguageClick}>
        {t(`language.selectedLanguageTitle.${locale as 'en-US' | 'zh' | 'es'}`)}
      </Button>
      {isMobile ? (
        <Modal show={focused} onClose={handleCloseClick}>
          <SMobileListContainer focused={focused}>
            <SMobileList>{options.map(renderItem)}</SMobileList>
            <SCancelButton view='modalSecondary' onClick={handleCloseClick}>
              {t('button.cancel')}
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
  // Enabled for vlad/apply-translations branch
  // display: none;
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
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  ${(props) => props.theme.media.tablet} {
    min-width: 136px;
    justify-content: flex-start;
  }
`;

const SCancelButton = styled(Button)`
  padding: 16px 32px;
  margin-top: 4px;
`;
