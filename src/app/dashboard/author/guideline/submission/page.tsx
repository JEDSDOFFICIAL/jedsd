import { data } from '../../../../(withNav)/guides/data';

const Submission = () => {
  const submissionData = data.find(
    (item) => item.title === 'submission-guidelines'
  );

  return <>{submissionData?.content}</>;
};

export default Submission;