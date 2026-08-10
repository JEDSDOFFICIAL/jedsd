import { data } from '../../../../(withNav)/guides/data';

const Ethical = () => {
  const ethicalData = data.find(
    (item) => item.title === 'ethical-guidelines'
  );

  return <>{ethicalData?.content}</>;
};

export default Ethical;