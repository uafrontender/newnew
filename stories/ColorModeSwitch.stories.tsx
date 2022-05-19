import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SettingsColorModeSwitch from '../components/molecules/profile/SettingsColorModeSwitch';
import { useTheme } from 'styled-components';
import { TColorMode } from '../redux-store/slices/uiStateSlice';

export default {
  title: 'Components/Selection',
  component: SettingsColorModeSwitch,
} as ComponentMeta<typeof SettingsColorModeSwitch>;

const Template: ComponentStory<typeof SettingsColorModeSwitch> = (args) => {
  const [colorMode, setColorMode] = useState<TColorMode>('auto');
  const theme = useTheme();

  return (
    <SettingsColorModeSwitch
      theme={theme}
      currentlySelectedMode={colorMode}
      variant={args.variant}
      isMobile={args.isMobile}
      buttonsCaptions={{
        light: 'Light',
        dark: 'Dark',
        auto: 'Auto',
      }}
      handleSetColorMode={(mode) => setColorMode(mode)}
    />
  );
};

export const ChangeTheme = Template.bind({});
ChangeTheme.args = {
  variant: 'vertical',
  isMobile: false,
};
