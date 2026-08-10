import { data } from '../../../../(withNav)/guides/data';


const Templates = () => {
  const templatesData = data.find(
    (item) => item.title === 'templates'
  );

  return <>{templatesData?.content}</>;
};

export default Templates;