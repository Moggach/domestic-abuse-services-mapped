'use client';

import '../styles/globals.css';
import QuickExit from '../components/QuickExit';
import NavBar from '../components/NavBar';

const Privacy: React.FC = () => {
  return (
    <>
    <NavBar/>
      <main className="p-4 max-w-[974px] lg:mx-auto lg:mt-10">
        <h1 className="font-headings text-3xl mb-4">Privacy Policy</h1>
        <div className="flex flex-col gap-4 text-xl">
          <p>
            <em>Last Updated: 4th October 2024</em>
          </p>
          <p>
            This policy explains how this site uses{' '}
            <a className="underline" href="https://withcabin.com/">
              Cabin
            </a>
            , a privacy-first, cookieless web analytics solution, to collect and
            process visitor data.
          </p>
          <p>
            Cabin is a lightweight, privacy-focused analytics tool that collects
            minimal data without using cookies or tracking technologies. Cabin
            does not store any personally identifying information.
          </p>
          <p>
            Cabin complies with privacy laws, including GDPR. It does not sell,
            share, or pass on any data to third parties. Visitor data remains
            confidential and is never used for advertising purposes.
          </p>
          <p>
            If you have questions about this policy, please contact{' '}
            <a
              className="underline"
              href="mailto:hello@domesticabuseservices.uk"
            >
              hello@domesticabuseservices.uk
            </a>
          </p>
        </div>
      </main>
      <QuickExit />
    </>
  );
};

export default Privacy;
