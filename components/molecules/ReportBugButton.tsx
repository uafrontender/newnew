import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../redux-store/store';
import BugIcon from '../../public/images/svg/icons/outlined/Bug.svg';
import InlineSvg from '../atoms/InlineSVG';
import { useAppState } from '../../contexts/appStateContext';

interface ReportBugButtonI {
  bottom: number;
  right: number;
  zIndex?: number;
}

const ReportBugButton: React.FC<ReportBugButtonI> = React.memo(
  ({ bottom, right, zIndex }) => {
    const { t } = useTranslation('common');
    const { user } = useAppSelector((state) => state);
    const { userIsCreator } = useAppState();
    // Check if need to be positioned higher

    const handleClick = () => {
      const userSnapApi = (window as any).Usersnap;
      if (userSnapApi) {
        userSnapApi.on('open', (event: any) => {
          event.api.setValue('visitor', user.userData?.email);
          event.api.setValue('custom', { username: user.userData?.username });
        });
        userSnapApi.logEvent('show_bug_report');
      }
    };

    // Show report button only to creators
    if (!userIsCreator) {
      return null;
    }

    return (
      <Container bottom={bottom} right={right} zIndex={zIndex}>
        <IconContainer onClick={handleClick}>
          <InlineSvg svg={BugIcon} fill='none' width='20px' height='20px' />
          <Tail />
        </IconContainer>
        <TextContainer onClick={handleClick}>
          <ReportText>{t('reportBug')}</ReportText>
        </TextContainer>
      </Container>
    );
  }
);

ReportBugButton.defaultProps = {
  zIndex: undefined,
};

export default ReportBugButton;

const Container = styled.div<{
  bottom: number;
  right: number;
  zIndex?: number;
}>`
  position: fixed;
  bottom: ${({ bottom }) => `${bottom}px`};
  right: ${({ right }) => `${right}px`};
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: ${({ zIndex }) => zIndex || '2147483647'};
  transition: bottom ease 0.5s;
`;

const IconContainer = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  background: linear-gradient(
      315deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    #1d6aff;
  color: #ffffff;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: all;
`;

const Tail = styled.div`
  position: absolute;
  background: #1d9dff;
  height: 35px;
  width: 35px;
  bottom: 0;
  right: 0;
  z-index: -1;
  clip-path: polygon(80% 0, 0 80%, 100% 100%);
  border-radius: 3px;
  background: linear-gradient(
      315deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    #1d6aff;
`;

const TextContainer = styled.div`
  padding-top: 2px;
  cursor: pointer;
  pointer-events: all;
`;

const ReportText = styled.div`
  padding: 4px;
  font-size: 12px;
  line-height: 12px;
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  background-color: ${({ theme }) =>
    theme.name === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  border-radius: 4px;
`;
