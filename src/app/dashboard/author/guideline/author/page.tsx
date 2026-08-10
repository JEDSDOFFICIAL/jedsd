import { data } from '../../../../(withNav)/guides/data';

const Author = () => {
  const authorData = data.find(
    (item) => item.title === 'author-guidelines'
  );

  return <>{authorData?.content}</>;
};

export default Author;