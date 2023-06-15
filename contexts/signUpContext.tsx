import React, { createContext, useContext, useMemo, useState } from 'react';

export const SignUpContext = createContext<{
  signupEmailInput: string;
  signupTimerValue: number;
  setSignupEmailInput: (value: string) => void;
  setSignupTimerValue: (value: number) => void;
}>({
  signupEmailInput: '',
  signupTimerValue: 0,
  setSignupEmailInput: () => {},
  setSignupTimerValue: () => {},
});

interface ISignUpContextProvider {
  children: React.ReactNode;
}

export const SignUpContextProvider: React.FC<ISignUpContextProvider> = ({
  children,
}) => {
  const [signupEmailInput, setSignupEmailInput] = useState('');
  const [signupTimerValue, setSignupTimerValue] = useState(0);

  const contextValue = useMemo(
    () => ({
      signupEmailInput,
      signupTimerValue,
      setSignupEmailInput,
      setSignupTimerValue,
    }),
    [
      signupEmailInput,
      signupTimerValue,
      setSignupEmailInput,
      setSignupTimerValue,
    ]
  );

  return (
    <SignUpContext.Provider value={contextValue}>
      {children}
    </SignUpContext.Provider>
  );
};

export function useSignup() {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignup must be used inside a `SignUpContextProvider`');
  }

  return context;
}
