import React, { useState } from 'react';
import validator from 'validator';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import UsernameInput from '../components/atoms/profile/UsernameInput';

export default {
  title: 'Components/Inputs',
  component: UsernameInput,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes

} as ComponentMeta<typeof UsernameInput>;

const Template: ComponentStory<typeof UsernameInput> = (args) => {
  const [value, setValue] = useState('');

  return (
  <UsernameInput
    value={value}
    placeholder="@username"
    isValid={validator.isAlphanumeric(value)}
    errorCaption="Input is incorrect"
    popupCaption={<div style={{ width: '100px', height: '50px' }}/>}
    frequencyCaption="Can be changed only two times"
    onChange={(e) => setValue(e.target.value)}
  />
  );
};

export const Username = Template.bind({});
Username.args = {
};
