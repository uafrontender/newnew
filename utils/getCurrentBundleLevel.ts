import { useGetAppConstants } from '../contexts/appConstantsContext';

const AVAILABLE_BUNDLE_LEVELS = [0, 1, 2, 3];
type BundleLevel = typeof AVAILABLE_BUNDLE_LEVELS[number];

function getBundleOfferLevel(numberOfVotes: number): BundleLevel {
  const { appConstants } = useGetAppConstants();
  const bundleLevel = appConstants.bundleOffers.findIndex(
    (offer) => offer.votesAmount && numberOfVotes === offer.votesAmount
  );

  if (bundleLevel < 0) {
    console.error('Unknown bundle offer');
    return 0;
  }

  return bundleLevel;
}

export default getBundleOfferLevel;
