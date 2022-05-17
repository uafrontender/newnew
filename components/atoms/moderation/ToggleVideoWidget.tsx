/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

interface IToggleVideoWidget {
  currentTab: 'announcement' | 'response';
  responseUploaded: boolean;
  disabled?: boolean;
  handleChangeTab: (tab: 'announcement' | 'response') => void;
}

const ToggleVideoWidget: React.FunctionComponent<IToggleVideoWidget> = ({
  currentTab,
  responseUploaded,
  disabled,
  handleChangeTab,
}) => {
  const { t } = useTranslation('decision');

  return (
    <SToggleVideoWidget>
      {!responseUploaded ? (
        <SWrapper>
          <STabBtn
            disabled={disabled}
            active={currentTab === 'announcement'}
            onClick={() => handleChangeTab('announcement')}
          >
            {t('PostVideo.tabs.announcement')}
          </STabBtn>
          <STabBtn
            disabled={disabled}
            active={currentTab === 'response'}
            onClick={() => handleChangeTab('response')}
          >
            {t('PostVideo.tabs.response')}
          </STabBtn>
        </SWrapper>
      ) : currentTab === 'response' ? (
        <SBackToOriginalBtn onClick={() => handleChangeTab('announcement')}>
          {t('PostVideo.tabs.back_to_original')}
        </SBackToOriginalBtn>
      ) : (
        <SBackToOriginalBtn onClick={() => handleChangeTab('response')}>
          {t('PostVideo.tabs.back_to_response')}
        </SBackToOriginalBtn>
      )}
    </SToggleVideoWidget>
  );
};

ToggleVideoWidget.defaultProps = {
  disabled: false,
};

export default ToggleVideoWidget;

const SToggleVideoWidget = styled.div`
  position: absolute;
  bottom: 16px;
  left: calc(50% - 90px);

  width: 180px;

  overflow: hidden;
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    bottom: 24px;
  }
`;

const SWrapper = styled.div`
  display: flex;
  flex-direction: row;

  padding: 6px;

  background: rgba(11, 10, 19, 0.6);
`;

const STabBtn = styled.button<{
  active: boolean;
}>`
  border: transparent;
  border-radius: 12px;

  background-color: ${({ active }) => (active ? '#FFFFFF' : 'transparent')};

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ active }) => (active ? '#2C2C33' : '#9BA2B1')};

  padding: 8px 16px;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus,
  &:hover {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const SBackToOriginalBtn = styled.button`
  background: rgba(11, 10, 19, 0.2);
  border: transparent;
  border-radius: 16px;

  padding: 12px 24px;

  width: 100%;

  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;
