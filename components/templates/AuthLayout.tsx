import React from 'react';
import styled from 'styled-components';

export interface IAuthLayout {

}

const SAuthLayout = styled.div`
  position: relative;

  height: 100vh;
  width: 100vw;

  /* Temporary */
  /* background-color: darkgray; */
`;

const AuthLayout: React.FunctionComponent<IAuthLayout> = ({ children }) => (
  <SAuthLayout>
    { children }
  </SAuthLayout>
);

export default AuthLayout;
