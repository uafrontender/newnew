import React, { useMemo, useCallback } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../../molecules/UserAvatar';

import { clearCreation } from '../../../../redux-store/slices/creationStateSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';

import copyIcon from '../../../../public/images/svg/icons/outlined/Link.svg';
import tiktokIcon from '../../../../public/images/svg/icons/socials/TikTok.svg';
import twitterIcon from '../../../../public/images/svg/icons/socials/Twitter.svg';
import facebookIcon from '../../../../public/images/svg/icons/socials/Facebook.svg';
import instagramIcon from '../../../../public/images/svg/icons/socials/Instagram.svg';

const SOCIAL_ICONS: any = {
  copy: copyIcon,
  tiktok: tiktokIcon,
  twitter: twitterIcon,
  facebook: facebookIcon,
  instagram: instagramIcon,
};

const BitmovinPlayer = dynamic(() => import('../../../atoms/BitmovinPlayer'), {
  ssr: false,
  loading: () => <p>Loading player...</p>,
});

interface IPublishedContent {
}

export const PublishedContent: React.FC<IPublishedContent> = () => {
  const { t } = useTranslation('creation');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const {
    post,
    videoProcessing,
  } = useAppSelector((state) => state.creation);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const handleSubmit = useCallback(async () => {
    router.push('/');
    dispatch(clearCreation({}));
  }, [dispatch, router]);
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
    <>
      <SContent>
        <SPlayerWrapper>
          <BitmovinPlayer
            id="published"
            muted={false}
            resources={videoProcessing?.targetUrls}
            thumbnails={post.thumbnailParameters}
          />
        </SPlayerWrapper>
        <SUserBlock>
          <SUserAvatar
            avatarUrl={user.userData?.avatarUrl}
          />
          <SUserTitle variant={3} weight={600}>
            {post?.title}
          </SUserTitle>
        </SUserBlock>
        <STitle variant={6}>
          {t('published.texts.title')}
        </STitle>
        <SSubTitle variant={2} weight={500}>
          {t(`published.texts.subTitle-${post.startsAt.type === 'right-away' ? 'published' : 'scheduled'}`, {
            value: formatStartsAt()
              .format('DD MMM [at] hh:mm A'),
          })}
        </SSubTitle>
        <SSocials>
          {socialButtons.map(renderItem)}
        </SSocials>
      </SContent>
      {isMobile && (
        <SButtonWrapper>
          <SButtonContent>
            <SButton
              view="secondary"
              onClick={handleSubmit}
            >
              {t('published.button.submit')}
            </SButton>
          </SButtonContent>
        </SButtonWrapper>
      )}
    </>
  );
};

export default PublishedContent;

const SContent = styled.div`
  display: flex;
  margin-top: 16px;
  flex-direction: column;
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
`;

const SButtonWrapper = styled.div`
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 5;
  display: flex;
  padding: 24px 16px;
  position: fixed;
  background: ${(props) => props.theme.gradients.creationSubmit};
`;

const SButtonContent = styled.div`
  width: 100%;
`;

const SPlayerWrapper = styled.div`
  width: 224px;
  height: 320px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  border-radius: 16px;
`;

const STitle = styled(Headline)`
  margin-top: 22px;
  text-align: center;
`;

const SUserBlock = styled.div`
  width: 224px;
  margin: 16px auto 0 auto;
  display: flex;
  flex-direction: row;
`;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
`;

const SUserTitle = styled(Text)`
  width: 188px;
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  padding-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SSubTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  margin-top: 4px;
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
  width: 100%;
  padding: 25% 0;
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
