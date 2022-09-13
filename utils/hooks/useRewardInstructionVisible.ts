import { useCallback, useEffect, useState } from 'react';

const REWARD_INSTRUCTION_HIDDEN_KEY = 'rewardInstructionHidden';
export const useRewardInstructionVisible = (
  defaultVisibility?: boolean
): [boolean, (isVisible: boolean) => void] => {
  const [visible, setVisible] = useState<boolean>(defaultVisibility || false);

  useEffect(() => {
    setVisible(localStorage.getItem(REWARD_INSTRUCTION_HIDDEN_KEY) !== 'true');
  }, []);

  const setVisibility = useCallback((isVisible: boolean) => {
    setVisible(isVisible);
    localStorage.setItem(
      REWARD_INSTRUCTION_HIDDEN_KEY,
      isVisible ? '' : 'true'
    );
  }, []);

  return [visible, setVisibility];
};
export default useRewardInstructionVisible;
