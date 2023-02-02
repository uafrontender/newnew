import { useGetAppConstants } from '../contexts/appConstantsContext';

const AVAILABLE_BUNDLE_LEVELS = [0, 1, 2, 3];
type BundleLevel = typeof AVAILABLE_BUNDLE_LEVELS[number];

function getCurrentBundleLevel(numberOfVotes: number): BundleLevel {
  const { appConstants } = useGetAppConstants();
  const bundleLevelAbove = appConstants.bundleOffers.findIndex(
    (offer) => offer.votesAmount && numberOfVotes <= offer.votesAmount
  );

  const currentBundleLevel =
    bundleLevelAbove < 0
      ? appConstants.bundleOffers.length - 1
      : bundleLevelAbove;

  return currentBundleLevel;
}

export default getCurrentBundleLevel;
