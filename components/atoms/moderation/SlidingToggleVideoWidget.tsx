import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import { Mixpanel } from '../../../utils/mixpanel';
import { usePostModerationResponsesContext } from '../../../contexts/postModerationResponsesContext';
import { usePostModalInnerState } from '../../../contexts/postModalInnerContext';

interface ISlidingToggleVideoWidget {
  disabled?: boolean;
  wrapperCSS?: React.CSSProperties;
}

const SlidingToggleVideoWidget: React.FunctionComponent<
  ISlidingToggleVideoWidget
> = ({ disabled, wrapperCSS }) => {
  const { t } = useTranslation('page-Post');

  const { postParsed } = usePostModalInnerState();
  const { openedTab, handleChangeTab } = usePostModerationResponsesContext();

  return (
    <SToggleVideoWidget style={{ ...(wrapperCSS || {}) }}>
      <SChangeTabBtn
        disabled={disabled}
        shouldView={openedTab === 'announcement'}
        onClickCapture={() => {
          Mixpanel.track('Set Opened Tab Announcement', {
            _stage: 'Post',
            _postUuid: postParsed?.postUuid,
            _component: 'PostVideoSuccess',
          });
        }}
        onClick={() => handleChangeTab('announcement')}
      >
        {t('postVideoSuccess.tabs.announcement')}
      </SChangeTabBtn>
      <SChangeTabBtn
        disabled={disabled}
        shouldView={openedTab === 'response'}
        onClickCapture={() => {
          Mixpanel.track('Set Opened Tab Response', {
            _stage: 'Post',
            _postUuid: postParsed?.postUuid,
            _component: 'PostVideoSuccess',
          });
        }}
        onClick={() => handleChangeTab('response')}
      >
        {t('postVideoSuccess.tabs.response')}
      </SChangeTabBtn>
    </SToggleVideoWidget>
  );
};

SlidingToggleVideoWidget.defaultProps = {
  disabled: false,
  wrapperCSS: {},
};

export default SlidingToggleVideoWidget;

const SToggleVideoWidget = styled.div`
  position: absolute;
  bottom: 16px;
  left: calc(50% - 120px);

  display: flex;

  width: 240px;

  padding: 6px;
  border-radius: 16px;
  background-color: rgba(11, 10, 19, 0.2);

  overflow: hidden;
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    transform: translateY(-40px);
  }

  ${({ theme }) => theme.media.laptop} {
    transform: none;
  }
`;

const SChangeTabBtn = styled.button<{
  shouldView?: boolean;
}>`
  background: ${({ shouldView }) => (shouldView ? '#FFFFFF' : 'transparent')};
  border: transparent;
  border-radius: 12px;

  padding: 10px 16px;

  width: 50%;

  text-align: center;
  color: ${({ shouldView, theme }) =>
    shouldView ? theme.colors.dark : '#FFFFFF'};
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;
