import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';
import Button from '../../../atoms/Button';
import Text from '../../../atoms/Text';
import infoIcon from '../../../../public/images/svg/icons/filled/Info.svg';
import InlineSVG from '../../../atoms/InlineSVG';
import { Mixpanel } from '../../../../utils/mixpanel';

export const StripeIssueBanner = () => {
  const { t } = useTranslation('page-Creator');
  const theme = useTheme();

  return (
    <SContainer>
      <STopBlock>
        <SImageWrapper>
          <InlineSVG
            svg={infoIcon}
            fill={theme.colors.white}
            width='16px'
            height='16px'
          />
        </SImageWrapper>
        <SDescription variant={5} weight={600}>
          {t('dashboard.earnings.toDosIssue.stripeIssue')}
        </SDescription>
      </STopBlock>
      <Link href='/creator/get-paid'>
        <a>
          <SButton
            view='common'
            onClick={() => {
              Mixpanel.track('Navigation Item Clicked', {
                _button: 'Add',
                _stage: 'Dashboard',
                _target: '/creator/get-paid',
              });
            }}
          >
            {t('dashboard.earnings.toDosIssue.stripeIssueButton')}
          </SButton>
        </a>
      </Link>
    </SContainer>
  );
};

export default StripeIssueBanner;

const SContainer = styled.div`
  padding: 24px 16px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.accent.pink};
  border-radius: 16px;
  flex-direction: column;

  ${(props) => props.theme.media.tablet} {
    align-items: center;
  }
`;

const SImageWrapper = styled.div`
  margin-right: 8px;
`;

const STopBlock = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const SDescription = styled(Text)`
  color: ${({ theme }) => theme.colors.white};

  ${(props) => props.theme.media.tablet} {
    line-height: 24px;
  }

  ${(props) => props.theme.media.laptop} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const SButton = styled(Button)`
  width: 100%;

  ${(props) => props.theme.media.tablet} {
    width: auto;
    padding: 12px 24px;
  }

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colorsThemed.button.color.common};
    box-shadow: ${({ theme }) => theme.shadows.lightBlue};
  }
`;
