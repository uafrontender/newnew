import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from '../components/atoms/Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof Button>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  view: 'primary',
  children: 'Primary',
};

export const PrimaryGradiented = Template.bind({});
PrimaryGradiented.args = {
  view: 'primaryGrad',
  children: 'Primary Gradiented',
};

export const Secondary = Template.bind({});
Secondary.args = {
  view: 'secondary',
  children: 'Secondary',
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  view: 'tertiary',
  children: 'Tertiary',
};

export const Quaternary = Template.bind({});
Quaternary.args = {
  view: 'quaternary',
  children: 'Quaternary',
};

export const Transparent = Template.bind({});
Transparent.args = {
  view: 'transparent',
  children: 'Transparent',
};
