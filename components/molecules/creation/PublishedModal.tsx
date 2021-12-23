import React, { useCallback, useMemo } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Modal from '../../organisms/Modal';
import Text from '../../atoms/Text';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import InlineSVG from '../../atoms/InlineSVG';

import { useAppSelector } from '../../../redux-store/store';

import copyIcon from '../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../public/images/svg/icons/socials/Instagram.svg';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

interface IPublishedModal {
  open: boolean;
  handleClose: () => void;
}

export const PublishedModal: React.FC<IPublishedModal> = (props) => {
  const {
    open,
    handleClose,
  } = props;
  const { t } = useTranslation('creation');
  const { post } = useAppSelector((state) => state.creation);

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const formatStartsAt = useCallback(() => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);

    return moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());
  }, [post.startsAt]);
  const socialButtons = useMemo(() => [
    {
      key: 'twitter',
    },
    {
      key: 'facebook',
    },
    {
      key: 'instagram',
    },
    {
      key: 'tiktok',
    },
    {
      key: 'copy',
    },
  ], []);
  const renderItem = (item: any) => (
    <SItem key={item.key}>
      <SItemButton type={item.key}>
        <InlineSVG
          svg={SOCIAL_ICONS[item.key] as string}
          width="50%"
          height="50%"
        />
      </SItemButton>
      <SItemTitle variant={3} weight={600}>
        {t(`published.socials.${item.key}`)}
      </SItemTitle>
    </SItem>
  );

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SMobileContainer onClick={preventCLick}>
        <SContent>
          <SVideo
            autoPlay
            src={post.announcementVideoUrl}
          />
          <SSubTitle variant={2} weight={500}>
            {t(`published.texts.subTitle-${post.startsAt.type === 'right-away' ? 'published' : 'scheduled'}`, {
              value: formatStartsAt()
                .format('DD MMM [at] hh:mm A'),
            })}
          </SSubTitle>
          <STitle variant={6}>
            {t('published.texts.title')}
          </STitle>
          <SSocials>
            {socialButtons.map(renderItem)}
          </SSocials>
          <SButtonWrapper onClick={handleClose}>
            <SButtonTitle>
              {t('published.button.submit')}
            </SButtonTitle>
          </SButtonWrapper>
        </SContent>
      </SMobileContainer>
    </Modal>
  );
};

export default PublishedModal;

const SMobileContainer = styled.div`
  top: 50%;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
  overflow: hidden;
  position: relative;
  max-width: 464px;
  transform: translateY(-50%);
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  border-radius: 16px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SVideo = styled.video`
  width: auto;
  height: auto;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  max-width: 224px;
  max-height: 336px;
  border-radius: 16px;

  ${({ theme }) => theme.media.laptop} {
    margin: 8px auto 0 auto;
  }
`;

const STitle = styled(Headline)`
  margin-top: 24px;
  text-align: center;
`;

const SSubTitle = styled(Text)`
  margin-top: 16px;
  text-align: center;
`;

const SSocials = styled.div`
  gap: 24px;
  display: flex;
  margin-top: 16px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

interface ISItemButton {
  type: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'copy';
}

const SItemButton = styled.div<ISItemButton>`
  width: 48px;
  height: 48px;
  display: flex;
  overflow: hidden;
  align-items: center;
  border-radius: 16px;
  justify-content: center;
  background: ${(props) => props.theme.colorsThemed.social[props.type].main};
`;

const SItemTitle = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 6px;
`;

const SButtonWrapper = styled.div`
  cursor: pointer;
  display: flex;
  padding: 16px 0;
  margin-top: 24px;
  align-items: center;
  justify-content: center;
`;

const SButtonTitle = styled.div`
  font-size: 16px;
  line-height: 24px;
  font-weight: bold;
`;
