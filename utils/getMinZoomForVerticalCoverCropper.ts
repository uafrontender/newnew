function getMinZoomForVerticalCoverCropper(
  width: number,
  height: number,
  minWidth: number,
  minHeight: number
) {
  const cropAreaAspectRatio = minWidth / minHeight;
  if (height * cropAreaAspectRatio > width) {
    if (width < minWidth) {
      return minWidth / width;
    }

    return (height * cropAreaAspectRatio) / width;
  }

  // objectFit='vertical-cover' will do the job
  return 1;
}

export default getMinZoomForVerticalCoverCropper;
