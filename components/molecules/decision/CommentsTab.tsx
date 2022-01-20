/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { motion } from 'framer-motion';

interface ICommentsTab {
  comments: newnewapi.Auction.Option[],
}

const CommentsTab: React.FunctionComponent<ICommentsTab> = ({
  comments,
}) => {
  return (
    <>
      <STabContainer
        key="comments"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {comments.map((comment) => (
          <div>
            {comment.title}
          </div>
        ))}
        <SActionSection>
          Comments placeholder
        </SActionSection>
      </STabContainer>
    </>
  );
};

export default CommentsTab;

const STabContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: calc(100% - 112px);
  background-color: gray;
`;

const SActionSection = styled.div`
  position: absolute;
  bottom: 0;
`;
