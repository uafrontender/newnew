import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

interface IToggleVideoWidget {
  currentTab: 'announcement' | 'response';
  responseUploaded: boolean;
  handleChangeTab: (tab: 'announcement' | 'response') => void;
};

const ToggleVideoWidget:React.FunctionComponent<IToggleVideoWidget> = ({
  currentTab,
  responseUploaded,
  handleChangeTab,
}) => {
  const { t } = useTranslation('decision');

  return (
    <SToggleVideoWidget>
      {currentTab === 'response' && responseUploaded ? (
        <SBackToOriginalBtn
          onClick={() => handleChangeTab('announcement')}
        >
          { t('PostVideo.tabs.back_to_original') }
        </SBackToOriginalBtn>
      ) : (
        <SWrapper>
          <STabBtn
            active={currentTab === 'announcement'}
            onClick={() => handleChangeTab('announcement')}
          >
            { t('PostVideo.tabs.announcement') }
          </STabBtn>
          <STabBtn
            active={currentTab === 'response'}
            onClick={() => handleChangeTab('response')}
          >
            { t('PostVideo.tabs.response') }
          </STabBtn>
        </SWrapper>
      )}
    </SToggleVideoWidget>
  );
};

export default ToggleVideoWidget;

const SToggleVideoWidget = styled.div`
  position: absolute;
  bottom: 16px;
  left: calc(50% - 90px);

  width: 180px;

  overflow: hidden;
  border-radius: 16px;
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

  &:focus, &:hover {
    outline: none;
  }
`;

const SBackToOriginalBtn = styled.button`


`;
