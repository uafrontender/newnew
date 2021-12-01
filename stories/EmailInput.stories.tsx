import React, { useState } from 'react';
import validator from 'validator';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SignInTextInput from '../components/atoms/SignInTextInput';

export default {
  title: 'Components/Inputs',
  component: SignInTextInput,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes

} as ComponentMeta<typeof SignInTextInput>;

const Template: ComponentStory<typeof SignInTextInput> = (args) => {
  const [value, setValue] = useState('');

  return (
  <SignInTextInput
    value={value}
    placeholder="Email"
    isValid={validator.isEmail(value)}
    errorCaption="Input is incorrect"
    onChange={(e) => setValue(e.target.value)}
  />
  );
};

export const Email = Template.bind({});
Email.args = {
};
