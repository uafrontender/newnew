import React, { useCallback, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';

// import Headline from '../../../atoms/Headline';
// import { useAppSelector } from '../../../../redux-store/store';
// import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';

export const BundlesEarnings: React.FC = React.memo(() => {
  const { t } = useTranslation('page-Creator');
  // const { resizeMode } = useAppSelector((state) => state.ui);

  const [hasEarnings, setHasEarnings] = useState<boolean>(false);
  const toggleHasEarnings = useCallback(() => {
    setHasEarnings((prevState) => !prevState);
  }, []);

  return (
    <SBlock>
      <SHeaderLine>
        {/* <STextHolder>
          <STitle variant={6}>{t('myBundles.bundlesSet.title')}</STitle>
          <SText variant={3}>{t('myBundles.bundlesSet.subTitle')}</SText>
        </STextHolder> */}
        <SButton onClick={toggleHasEarnings} enabled={hasEarnings}>
          {hasEarnings
            ? t('myBundles.buttonTurnOff')
            : t('myBundles.buttonTurnOn')}
        </SButton>
      </SHeaderLine>
    </SBlock>
  );
});

export default BundlesEarnings;

interface ISBlock {
  noMargin?: boolean;
}

const SBlock = styled.section<ISBlock>`
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  padding: 24px;
  border-radius: ${(props) => props.theme.borderRadius.large};
  ${(props) =>
    !props.noMargin &&
    css`
      margin-bottom: 24px;
    `}
  ${(props) => props.theme.media.tablet} {
    max-width: 100%;
  }
  ${(props) => props.theme.media.laptopL} {
    max-width: calc(100% - 435px);
  }
`;

const SHeaderLine = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 24px;

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 14px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-bottom: 18px;
  }
`;

// const STextHolder = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

interface ISButton {
  enabled?: boolean;
}
const SButton = styled(Button)<ISButton>`
  width: 100%;
  padding: 16px 20px;
  background: ${(props) =>
    !props.enabled
      ? props.theme.colorsThemed.accent.yellow
      : props.theme.colorsThemed.background.tertiary};
  color: ${(props) =>
    !props.enabled ? props.theme.colors.darkGray : props.theme.colors.white};

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
  }
  &:focus,
  &:active,
  &:hover {
    background: ${(props) =>
      !props.enabled
        ? props.theme.colorsThemed.accent.yellow
        : props.theme.colorsThemed.background.tertiary} !important;
    color: ${(props) =>
      !props.enabled
        ? props.theme.colors.darkGray
        : props.theme.colors.white} !important;
  }
`;
