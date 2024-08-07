import React from 'react';
import styled, { useTheme } from 'styled-components';
import InlineSVG from '../InlineSVG';

import megaphone from '../../../public/images/svg/icons/filled/Megaphone.svg';

const MyAvatarAnnouncement: React.FC = React.memo(() => {
  const theme = useTheme();
  return (
    <SMyAvatarAnnouncement>
      <SInlineSVG
        svg={megaphone}
        fill={
          theme.name === 'light'
            ? theme.colorsThemed.text.secondary
            : theme.colors.white
        }
        width='26px'
        height='26px'
      />
    </SMyAvatarAnnouncement>
  );
});

export default MyAvatarAnnouncement;

const SInlineSVG = styled(InlineSVG)`
  min-width: 24px;
  min-height: 24px;
`;

const SMyAvatarAnnouncement = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.colorsThemed.background.quinary};
  display: flex;
  align-items: center;
  justify-content: center;

  ${SInlineSVG} {
    margin-right: 0;
  }
`;
