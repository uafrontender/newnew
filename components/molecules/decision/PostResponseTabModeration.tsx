import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

interface IPostResponseTabModeration {}

const PostResponseTabModeration: React.FunctionComponent<IPostResponseTabModeration> =
  () => {
    const { t } = useTranslation('modal-Post');
    return <SContainer>{t('hey')}</SContainer>;
  };

export default PostResponseTabModeration;

const SContainer = styled.div``;
