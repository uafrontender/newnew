/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Button from '../../../atoms/Button';

interface IPlaceBidForm {
  bidTitle: string;
  amountRounded: string;
  handlePlaceBid: () => void;
}

const PlaceBidForm: React.FunctionComponent<IPlaceBidForm> = ({
  bidTitle,
  amountRounded,
  handlePlaceBid,
}) => {
  const { t } = useTranslation('decision');

  return (
    <SWrapper>
      <Button
        onClick={() => handlePlaceBid()}
      >
        Support
      </Button>
    </SWrapper>
  );
};

export default PlaceBidForm;

const SWrapper = styled.div`

`;
