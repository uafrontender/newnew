import React from 'react';
import styled from 'styled-components';

const ReCaptchaBadgeModal = () => <SContainer id='recaptchaBadge' />;

export default ReCaptchaBadgeModal;

const SContainer = styled.div`
  position: absolute;

  visibility: hidden;

  .grecaptcha-badge {
    visibility: hidden;
    left: -10000px !important;
  }
`;
