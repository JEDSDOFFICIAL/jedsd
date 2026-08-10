
import { data } from '../../../../(withNav)/guides/data';


const PeerReviewProcess = () => {
  const processData = data.find(
    (item) => item.title === 'peer-review-process'
  );

  return <>{processData?.content}</>;
};

export default PeerReviewProcess;