import { useTranslation } from 'next-i18next';
import React from 'react';
import styled from 'styled-components';
import InlineSvg from './InlineSVG';
import closeCircleIcon from '../../public/images/svg/icons/filled/CloseCircle.svg';
import Button from './Button';

interface ISortOption {
  className?: string;
  sorts: Record<string, string>;
  category: string;
  disabled?: boolean;
  onClick: () => void;
}

const SortOption: React.FC<ISortOption> = React.memo(
  ({ className, sorts, category, disabled, onClick }) => {
    const { t } = useTranslation('common');

    return (
      <SSortSelectedWrapper className={className}>
        {Object.entries(sorts).map(([key, option]) => (
          <SButton
            key={`${option}-${key}`}
            view='primary'
            disabled={disabled}
            onClick={onClick}
          >
            <>
              {t(`sortingOption.${key}` as any)} (
              {t(
                `sortingOption.${key}-${option}${
                  option === 'num_bids' && ['ac', 'mc', 'cf'].includes(category)
                    ? `-${category}`
                    : ''
                }` as any
              )}
              )
            </>
            <InlineSvg svg={closeCircleIcon} width='16px' height='16px' />
          </SButton>
        ))}
      </SSortSelectedWrapper>
    );
  }
);

SortOption.defaultProps = {
  className: undefined,
  disabled: false,
};

export default SortOption;

const SSortSelectedWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  flex-direction: row;
`;

const SButton = styled(Button)`
  padding: 8px 8px 8px 16px;
  margin-right: 8px;
  border-radius: 24px;

  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    min-width: 16px;
    min-height: 16px;
    margin-left: 4px;
  }
`;
