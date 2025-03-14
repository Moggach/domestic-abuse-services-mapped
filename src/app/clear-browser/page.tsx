'use client';

import '../styles/globals.css';
import QuickExit from '../components/QuickExit';

const ClearBrowser: React.FC = () => {
  return (
    <>
      <main className="p-4 max-w-[974px] lg:mx-auto">
        <h1 className="font-headings text-3xl mb-4">
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
        <div className="flex flex-col gap-4">
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Google Chrome
            </div>
            <div className="collapse-content">
              <h3 className="mb-1 text-lg">Desktop (Windows, macOS, Linux):</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Chrome.</li>
                <li>
                  Press <code>Ctrl + H</code> (Windows/Linux) or{' '}
                  <code>Cmd + Y</code> (macOS) to open history.
                </li>
                <li>
                  In the search bar at the top, type the website you want to
                  delete (e.g., &quot;example.com&quot;).
                </li>
                <li>
                  Select the checkbox or hover over entries and click the three
                  dots &gt; &quot;Remove from history.&quot;
                </li>
                <li>Confirm the deletion.</li>
              </ol>
              <h3 className="mb-1 text-lg">Mobile (Android, iOS):</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Chrome app.</li>
                <li>Tap the three-dot menu &gt; &quot;History.&quot;</li>
                <li>Use the search bar to find the website.</li>
                <li>
                  Tap the three-dot menu next to each result and select
                  &quot;Delete.&quot;
                </li>
              </ol>
            </div>
          </div>
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Mozilla Firefox
            </div>
            <div className="collapse-content">
              <h3 className="mb-1 text-lg">Desktop:</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Firefox.</li>
                <li>
                  Press <code>Ctrl + Shift + H</code> (Windows/Linux) or{' '}
                  <code>Cmd + Shift + H</code> (macOS) to open the library.
                </li>
                <li>Use the search bar to find the website.</li>
                <li>
                  Right-click the site &gt; &quot;Delete Page&quot; or
                  &quot;Forget About This Site.&quot;
                </li>
              </ol>
              <h3 className="mb-1 text-lg">Mobile:</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Firefox app.</li>
                <li>Tap the three-line menu &gt; &quot;History.&quot;</li>
                <li>Search for the website.</li>
                <li>Tap and hold the entry &gt; &quot;Remove.&quot;</li>
              </ol>
            </div>
          </div>
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              Microsoft Edge
            </div>
            <div className="collapse-content">
              <h3 className="mb-1 text-lg">Desktop:</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Edge.</li>
                <li>
                  Press <code>Ctrl + H</code> to open history.
                </li>
                <li>Search for the site using the search bar at the top.</li>
                <li>
                  Hover over entries and click the &quot;X&quot; to delete them.
                </li>
              </ol>
              <h3 className="mb-1 text-lg">Mobile:</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Edge app.</li>
                <li>Tap the three-dot menu &gt; &quot;History.&quot;</li>
                <li>Search for the website.</li>
                <li>Swipe left or tap the &quot;X&quot; to remove entries.</li>
              </ol>
            </div>
          </div>
          <div className="collapse bg-base-200">
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">Safari</div>
            <div className="collapse-content">
              <h3 className="mb-1 text-lg">macOS:</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open Safari.</li>
                <li>
                  Click &quot;History&quot; in the menu bar &gt; &quot;Show All
                  History.&quot;
                </li>
                <li>Search for the website.</li>
                <li>Right-click the entry &gt; &quot;Delete.&quot;</li>
              </ol>
              <h3 className="mb-1 text-lg">iOS:</h3>
              <ol className="list-decimal ml-6 mb-3 text-base">
                <li>Open the Safari app.</li>
                <li>
                  Tap the book icon (bottom toolbar) &gt; &quot;History&quot;
                  (clock icon).
                </li>
                <li>Swipe left on the entry &gt; &quot;Delete.&quot;</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
      <QuickExit />
    </>
  );
};

export default ClearBrowser;
