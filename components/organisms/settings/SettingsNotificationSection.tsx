/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable arrow-body-style */
/* eslint-disable padded-blocks */
import React from 'react';
import styled from 'styled-components';
import Text from '../../atoms/Text';

import Toggle from '../../atoms/Toggle';

export type NotificationConfigSubsection = {
  title: string;
  parameter: string;
  configs: NotificationConfigItem[];
};

export type NotificationConfigItem = {
  title: string;
  parameter: string;
  value: boolean;
};

type TSettingsNotificationsSection = {
  configs: NotificationConfigSubsection[];
  handleUpdateItem: (category: string, itemName: string) => void;
  // Allows handling visuals for active/inactive state
  handleSetActive: () => void;
};
const SettingsNotificationsSection: React.FunctionComponent<TSettingsNotificationsSection> =
  ({ configs, handleUpdateItem, handleSetActive }) => {
    return (
      <SWrapper onMouseEnter={() => handleSetActive()}>
        {configs &&
          configs.map((subsection, idx) => (
            <SSubsection key={subsection.title}>
              <Text variant={2} weight={600}>
                {subsection.title}
              </Text>
              <SItemsContainer>
                {subsection.configs &&
                  subsection.configs.map((config, i, arr) => (
                    <SItem
                      key={config.parameter}
                      isLast={i === arr.length - 1}
                      isLastAll={idx === configs.length - 1}
                    >
                      <Text variant={3} weight={500}>
                        {config.title}
                      </Text>
                      <Toggle
                        title={config.title}
                        checked={config.value}
                        onChange={() =>
                          handleUpdateItem(
                            subsection.parameter,
                            config.parameter
                          )
                        }
                      />
                    </SItem>
                  ))}
              </SItemsContainer>
            </SSubsection>
          ))}
      </SWrapper>
    );
  };

SettingsNotificationsSection.defaultProps = {};

export default SettingsNotificationsSection;

const SWrapper = styled.div``;

const SSubsection = styled.div`
  display: flex;
  flex-direction: column;

  margin-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  ${({ theme }) => theme.media.tablet} {
    position: relative;
    top: 10px;
  }
`;

const SItem = styled.div<{
  isLast: boolean;
  isLastAll: boolean;
}>`
  display: flex;
  justify-content: space-between;

  border-bottom: ${({ isLast, isLastAll, theme }) =>
    isLast && !isLastAll
      ? `1px solid ${theme.colorsThemed.background.outlines1}`
      : 'unset'};
  padding-bottom: ${({ isLast }) => (isLast ? '32px' : '0px')};

  ${({ theme }) => theme.media.tablet} {
    width: 404px;
  }
`;
