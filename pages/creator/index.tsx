const CreatorsHome = () => false;

export default CreatorsHome;

export const getServerSideProps = () => ({
  redirect: {
    permanent: false,
    destination: '/creator/dashboard',
  },
  props: {},
});
