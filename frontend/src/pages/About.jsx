import { Button, Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'WorldLink'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={
        <>
          <Button
            type="primary"
            onClick={() => {
              window.open(`https://worldlink-us.com/#contact`);
            }}
          >
            {translate('Contact us')}
          </Button>
        </>
      }
    />
  );
};

export default About;
