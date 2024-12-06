'use client';

import '../styles/globals.css';
import QuickExit from '../components/QuickExit';

const About: React.FC = () => {
  return (
    <>
      <main className="p-4">
        <h1 className="font-headings text-3xl mb-4">About</h1>
        <div className="flex flex-col gap-4 text-xl pb-[55px]">
          <p>
            Domestic abuse services mapped is a project built and maintained by{' '}
            <a className="underline" href="https://github.com/Moggach">
              Moggach
            </a>
          </p>
          <p>
            If your service isn&apos;t listed please submit the details using
            this{' '}
            <a
              className="underline"
              href="https://airtable.com/appksbQlVr07Kxadu/pagEkSrTVCs0yk2OS/form"
            >
              form
            </a>{' '}
          </p>
          <p>
            Have a question or a comment about the site? Please email{' '}
            <a
              className="underline"
              href="mailto:hello@domesticabuseservices.uk"
            >
              hello@domesticabuseservices.uk
            </a>
          </p>
          <p>
            Please note that addresses of services may be approximate. Please
            contact any service before visiting them.
          </p>
          <p>
            The information on this site is for reference only. If there are no
            services listed in your location go to your local authority website
            and search for domestic abuse. To find your local authority go to{' '}
            <a
              className="underline"
              href="https://www.gov.uk/find-local-council"
            >
              gov.uk/find-local-council
            </a>
          </p>
          <p>
            Refuges are not listed for safety reasons. To access a refuge space
            please contact the 24/7 freephone{' '}
            <a
              className="underline"
              href="https://www.nationaldahelpline.org.uk/"
            >
              National Domestic Abuse Helpline
            </a>{' '}
            on 0808 2000 247
          </p>
          <p>
            The services listed are based in the UK only. For information about
            international services visit{' '}
            <a className="underline" href="https://www.hotpeachpages.net">
              HotPeachPages
            </a>
          </p>
        </div>
      </main>
      <QuickExit />
    </>
  );
};

export default About;