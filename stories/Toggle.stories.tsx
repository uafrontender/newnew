import React, { useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Toggle from '../components/atoms/Toggle';

export default {
  title: 'Components/Selection',
  component: Toggle,
} as ComponentMeta<typeof Toggle>;

const Template: ComponentStory<typeof Toggle> = (args) => {
  const [ckd, setCkd] = useState(false);

  return (
    <div
      style={{
        width: '326px',
        marginTop: '150px',
        marginLeft: '50px',
      }}
    >
      <Toggle
        title={args.title}
        checked={ckd}
        disabled={args.disabled}
        onChange={() => setCkd((curr) => !curr)}
      />
    </div>
  );
};

export const ToggleSelection = Template.bind({});
ToggleSelection.args = {
  title: 'Test',
  disabled: false,
};
