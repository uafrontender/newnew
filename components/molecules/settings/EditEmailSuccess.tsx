import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import InlineSvg from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import Button from '../../atoms/Button';

import Logo from '../../../public/images/svg/MobileLogo.svg';

interface IEditEmailSuccessModal {
  onComplete: () => void;
}

const EditEmailSuccessModal = ({ onComplete }: IEditEmailSuccessModal) => {
  const theme = useTheme();
  const { t } = useTranslation('page-VerifyEmail');

  return (
    <>
      <SLogo
        svg={Logo}
        fill={theme.colorsThemed.accent.blue}
        width='60px'
        height='40px'
      />
      <SHeadline variant={4}>{t('updated')}</SHeadline>
      <Button onClick={onComplete}>{t('backToProfile')}</Button>
    </>
  );
};

export default EditEmailSuccessModal;

const SHeadline = styled(Headline)`
  text-align: center;
  margin-bottom: 24px;
  max-width: 350px;
`;

const SLogo = styled(InlineSvg)`
  margin-bottom: 35px;
`;
