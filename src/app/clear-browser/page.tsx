'use client';

import '../styles/globals.css';
import NavBar from '../components/NavBar';
import QuickExit from '../components/QuickExit';
import { SITE_DOMAIN, SUBMIT_SERVICE_URL } from '../constants/links';

const ClearBrowser: React.FC = () => {
  return (
    <>
      <NavBar />
      <main className="p-4 pt-6 max-w-[974px] lg:mx-auto lg:mt-10">
        <h1 className="font-headings text-3xl mb-6">
          How to clear this site from your browser history
        </h1>
        <div role="alert" className="alert alert-warning mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>
            The safest way to completely hide your online activity from someone
            who has access to your computer, laptop, or mobile device is to use
            a different device. You may wish to use a device belonging to a
            friend or relative, or use devices at work or in a library.
          </span>
        </div>
        <section aria-labelledby="what-to-delete" className="mb-8">
          <h2 id="what-to-delete" className="font-headings text-2xl mb-3">
            What to delete
          </h2>
          <p className="mb-2">
            Search your history for each of these addresses and delete the
            entries you find:
          </p>
          <ul className="list-disc ml-6 mb-6">
            <li>
              <strong>{SITE_DOMAIN}</strong> (this website)
            </li>
            <li>
              <strong>nationaldahelpline.org.uk</strong> (National Domestic
              Abuse Helpline)
            </li>
            <li>
              <strong>refugetechsafety.org</strong> (Refuge tech safety advice)
            </li>
            <li>
              <strong>{new URL(SUBMIT_SERVICE_URL).hostname}</strong> (if you
              submitted a service)
            </li>
            <li>the websites of any services you looked at</li>
          </ul>
          <h3 className="font-headings text-xl mb-2">Other places to check</h3>
          <ul className="list-disc ml-6 flex flex-col gap-2">
            <li>
              <strong>Search engine history.</strong> If you searched for help
              while signed in to a Google, Microsoft or other account, your
              searches may be saved to that account as well as the browser. You
              can delete them in the account&apos;s activity settings (for
              Google, this is called &quot;My Activity&quot;).
            </li>
            <li>
              <strong>Address bar suggestions.</strong> After deleting your
              history, start typing one of the addresses above. If it is still
              suggested, in most browsers you can highlight the suggestion with
              the arrow keys and press <code>Shift + Delete</code> (on a Mac,{' '}
              <code>Shift + Fn + Delete</code>) to remove it.
            </li>
            <li>
              <strong>Call history.</strong> If you called a number from this
              website, it will appear in your phone&apos;s call log.
            </li>
            <li>
              <strong>Other devices.</strong> If your browser is signed in to an
              account, your history may be synced to your other devices, such as
              a shared tablet. Check any device someone else can use.
            </li>
          </ul>
        </section>
        <h2 className="font-headings text-2xl mb-3">
          How to delete history in your browser
        </h2>
        <div className="flex flex-col gap-4">
          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title">
              <h3 className="text-xl font-medium">Google Chrome</h3>
            </summary>
            <div className="collapse-content">
              <h4 className="mb-1 text-lg">Desktop (Windows, macOS, Linux):</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Chrome.</li>
                <li>
                  Press <code>Ctrl + H</code> (Windows/Linux) or{' '}
                  <code>Cmd + Y</code> (macOS) to open history.
                </li>
                <li>
                  In the search bar at the top, type each address from the list
                  above.
                </li>
                <li>
                  Select the checkbox or hover over entries and click the three
                  dots &gt; &quot;Remove from history.&quot;
                </li>
                <li>Confirm the deletion.</li>
              </ol>
              <h4 className="mb-1 text-lg">Mobile (Android, iOS):</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Chrome app.</li>
                <li>Tap the three-dot menu &gt; &quot;History.&quot;</li>
                <li>Search for each address from the list above.</li>
                <li>
                  Tap the three-dot menu next to each result and select
                  &quot;Delete.&quot;
                </li>
              </ol>
            </div>
          </details>
          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title">
              <h3 className="text-xl font-medium">Mozilla Firefox</h3>
            </summary>
            <div className="collapse-content">
              <h4 className="mb-1 text-lg">Desktop:</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Firefox.</li>
                <li>
                  Press <code>Ctrl + Shift + H</code> (Windows/Linux) or{' '}
                  <code>Cmd + Shift + H</code> (macOS) to open the library.
                </li>
                <li>Search for each address from the list above.</li>
                <li>
                  Right-click the site &gt; &quot;Delete Page&quot; or
                  &quot;Forget About This Site.&quot;
                </li>
              </ol>
              <h4 className="mb-1 text-lg">Mobile:</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Firefox app.</li>
                <li>Tap the three-line menu &gt; &quot;History.&quot;</li>
                <li>Search for each address from the list above.</li>
                <li>Tap and hold the entry &gt; &quot;Remove.&quot;</li>
              </ol>
            </div>
          </details>
          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title">
              <h3 className="text-xl font-medium">Microsoft Edge</h3>
            </summary>
            <div className="collapse-content">
              <h4 className="mb-1 text-lg">Desktop:</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Edge.</li>
                <li>
                  Press <code>Ctrl + H</code> to open history.
                </li>
                <li>Search for each address from the list above.</li>
                <li>
                  Hover over entries and click the &quot;X&quot; to delete them.
                </li>
              </ol>
              <h4 className="mb-1 text-lg">Mobile:</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Edge app.</li>
                <li>Tap the three-dot menu &gt; &quot;History.&quot;</li>
                <li>Search for each address from the list above.</li>
                <li>Swipe left or tap the &quot;X&quot; to remove entries.</li>
              </ol>
            </div>
          </details>
          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title">
              <h3 className="text-xl font-medium">Safari</h3>
            </summary>
            <div className="collapse-content">
              <h4 className="mb-1 text-lg">macOS:</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Safari.</li>
                <li>
                  Click &quot;History&quot; in the menu bar &gt; &quot;Show All
                  History.&quot;
                </li>
                <li>Search for each address from the list above.</li>
                <li>Right-click the entry &gt; &quot;Delete.&quot;</li>
              </ol>
              <h4 className="mb-1 text-lg">iOS:</h4>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Safari app.</li>
                <li>
                  Tap the book icon (bottom toolbar) &gt; &quot;History&quot;
                  (clock icon).
                </li>
                <li>Swipe left on the entry &gt; &quot;Delete.&quot;</li>
              </ol>
            </div>
          </details>
        </div>
      </main>
      <QuickExit />
    </>
  );
};

export default ClearBrowser;
