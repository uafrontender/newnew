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
    <div
      style={{
        width: '326px',
        marginTop: '150px',
        marginLeft: '50px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SignInTextInput
        value={value}
        placeholder='Email'
        isValid={validator.isEmail(value)}
        errorCaption='Input is incorrect'
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export const Email = Template.bind({});
Email.args = {};
