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
    <div
      style={{
        width: '326px',
        marginTop: '150px',
        marginLeft: '50px',
      }}
    >
      <UsernameInput
        value={value}
        placeholder='@username'
        isValid={value.length > 0 ? validator.isAlphanumeric(value) : true}
        errorCaption='Input is incorrect'
        popupCaption={
          <div style={{ width: '100px', height: '50px' }}>Caption</div>
        }
        frequencyCaption='Can be changed only two times'
        onChange={(value: string) => setValue(value)}
        {...(args as any)}
      />
    </div>
  );
};

export const Username = Template.bind({});
Username.args = {
  disabled: false,
};
