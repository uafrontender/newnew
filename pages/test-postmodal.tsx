/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import type { NextPage, NextPageContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { BASE_URL, fetchProtobuf } from '../api/apiConfigs';

import General from '../components/templates/General';
import PostModal from '../components/organisms/decision/PostModal';

const TestPostModal: NextPage = () => {
  const [posts, setPosts] = useState<newnewapi.IPost[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<newnewapi.IPost | undefined>();

  const handleOpenPost = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDisplayedPost(undefined);
  };

  useEffect(() => {
    async function fetchAll() {
      try {
        const getAllRequest = new newnewapi.PagingRequest({});

        const res = await fetchProtobuf<
          newnewapi.PagingRequest, newnewapi.PagedPostsResponse>(
            newnewapi.PagingRequest,
            newnewapi.PagedPostsResponse,
            `${BASE_URL}/post/get_curated_posts`,
            'post',
            getAllRequest,
          );

        if (!res.data?.posts || !Array.isArray(res.data?.posts)) throw new Error('No posts');
        console.log(res.data?.posts);

        setPosts(() => [...(res.data?.posts || [])!!]);
      } catch (err) {
        console.error(err);
      }
    }

    fetchAll();
  }, []);

  return (
    <General>
      <div>
        <main>
          <h1>
            I am a test page for posts
          </h1>
          <div>
            {posts && posts.map((postType, i) => {
              if (postType.auction) {
                const post = postType.auction;
                return (
                  <div
                    key={post.postUuid}
                    onClick={() => handleOpenPost(postType)}
                  >
                    <div>{ i + 1 }) Auction</div>
                    <h2>{post.title }</h2>
                  </div>
                );
              }
              if (postType.crowdfunding) {
                const post = postType.crowdfunding;
                return (
                  <div
                    key={post.postUuid}
                    onClick={() => handleOpenPost(postType)}
                  >
                    <div>{ i + 1 }) Crowdfunding</div>
                    <h2>{post.title }</h2>
                  </div>
                );
              }
              const post = postType.multipleChoice;
              return (
                <div
                  key={post!!.postUuid}
                  onClick={() => handleOpenPost(postType)}
                >
                  <div>{ i + 1 }) Multiple choice</div>
                  <h2>{post!!.title }</h2>
                </div>
              );
            })}
          </div>
        </main>
      </div>
      {displayedPost && (
        <PostModal
          isOpen={modalOpen}
          post={displayedPost}
          handleClose={() => handleCloseModal()}
        />
      )}
    </General>
  );
};

export async function getStaticProps(context: NextPageContext): Promise<any> {
  const translationContext = await serverSideTranslations(
    context.locale as string,
    ['common', 'home', 'decision'],
  );

  return {
    props: {
      ...translationContext,
    },
  };
}

export default TestPostModal;
