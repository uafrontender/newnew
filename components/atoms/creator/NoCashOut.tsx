import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import InlineSVG from '../InlineSVG';
import Button from '../Button';
import Text from '../Text';

import cashOutIcon from '../../../public/images/svg/icons/filled/CashOut.svg';
import { Mixpanel } from '../../../utils/mixpanel';

const NoCashOut: React.FC = () => {
  const { t } = useTranslation('page-Creator');

  return (
    <SContainer>
      <SBlockLeft>
        <SInlineSVG svg={cashOutIcon} width='48px' height='48px' />
        <SDescription variant={3} weight={600}>
          {t('dashboard.earnings.cashOut.noPayouts')}
        </SDescription>
      </SBlockLeft>

      <SBlockRight>
        <SLink
          href='https://creatorpayouts.newnew.co/'
          target='_blank'
          rel='noreferrer'
        >
          <SButton
            view='common'
            onClick={() => {
              Mixpanel.track('Navigation Item Clicked', {
                _stage: 'Dashboard',
                _button: 'Learn More',
                _target: 'https://creatorpayouts.newnew.co/',
              });
            }}
          >
            {t('dashboard.earnings.cashOut.submit')}
          </SButton>
        </SLink>
      </SBlockRight>
    </SContainer>
  );
};

export default NoCashOut;

interface ISContainer {
  hasNextCashOutAmount?: boolean;
}

const SContainer = styled.div<ISContainer>`
  display: flex;
  flex-direction: column;
  padding: 16px;

  background: ${(props) => props.theme.colorsThemed.accent.blue};
  border-radius: 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 24px;
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SBlockLeft = styled.div`
  display: flex;
  align-items: center;
`;

const SBlockRight = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;

  a {
    width: 100%;
  }
`;

const SDescription = styled(Text)`
  color: rgba(255, 255, 255, 0.7);
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  ${(props) => props.theme.media.tablet} {
    width: unset;
    padding: 12px 24px;
  }
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 48px;
  min-height: 48px;

  margin-right: 8px;

  ${(props) => props.theme.media.tablet} {
    margin-right: 12px;
  }
`;

const SLink = styled.a`
  margin-top: 16px;

  ${(props) => props.theme.media.tablet} {
    margin-top: unset;
    margin-left: 16px;
  }
`;
