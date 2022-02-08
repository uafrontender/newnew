/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';

import LoadingModal from '../LoadingModal';
import GoBackButton from '../GoBackButton';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';

interface IOnboardingSectionAbout {
  availableTags: newnewapi.ICreatorTag[];
  currentTags: newnewapi.ICreatorTag[];
}

const OnboardingSectionAbout: React.FunctionComponent<IOnboardingSectionAbout> = ({
  availableTags,
  currentTags,
}) => {
  const router = useRouter();
  const { t } = useTranslation('creator-onboarding');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [isAPIValidateLoading, setIsAPIValidateLoading] = useState(false);

  // Bio
  const [bioInEdit, setBioInEdit] = useState(user.userData?.bio ?? '');

  // Tags
  const [selectedTags, setSelectedTags] = useState(currentTags);


  return (
    <>
      <SContainer>
        <SHeading
          variant={5}
        >
          {t('AboutSection.heading')}
        </SHeading>
      <SControlsDiv>
        {!isMobile && (
          <GoBackButton
            longArrow
            onClick={() => router.back()}
          >
            { t('AboutSection.backButton') }
          </GoBackButton>
        )}
        <Button
          view="primaryGrad"
          style={{
            width: isMobile ? '100%' : 'initial',
            ...(isAPIValidateLoading ? { cursor: 'wait' } : {}),
          }}
          onClick={() => {}}
        >
          {isMobile ? (
            t('AboutSection.submitMobile')
          ) : t('AboutSection.submitDesktop') }
        </Button>
      </SControlsDiv>
      </SContainer>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </>
  );
};

export default OnboardingSectionAbout;

const SContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  padding-bottom: 88px;

  z-index: 2;

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 0;

    padding-left: 152px;
    padding-right: 152px;

    margin-bottom: 44px;
  }

  ${({ theme }) => theme.media.laptop} {
    height: fit-content;

    padding-left: 0;
    padding-right: 104px;

    margin-bottom: 190px;
  }
`;

const SHeading = styled(Headline)`
  padding-right: 32px;

  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 40px;
  }
`;


const SSeparator = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
  margin-bottom: 16px;
`;

const SControlsDiv = styled.div`
  /* position: fixed; */
  margin-left: 16px;
  width: calc(100% - 32px);

  display: flex;
  justify-content: space-between;


  button {
    width: 100%;
    height: 56px;
  }

  ${({ theme }) => theme.media.tablet} {
    position: static;

    padding-left: 152px;
    padding-right: 152px;

    width: 100%;

    button {
      width: 170px;
      height: 48px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    padding-left: 0;
    padding-right: 104px;
  }
`;
