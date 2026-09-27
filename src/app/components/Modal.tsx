import React, { useEffect } from 'react';

import { exitSite } from './QuickExit';

// Stored per session only: a persistent flag would leave a trace on the
// device that someone has visited this site.
const DISMISSED_KEY = 'showModal';

const Modal: React.FC = () => {
  useEffect(() => {
    let shouldShowModal = true;
    try {
      // Remove the flag earlier versions persisted in localStorage.
      localStorage.removeItem(DISMISSED_KEY);
      shouldShowModal = sessionStorage.getItem(DISMISSED_KEY) !== 'false';
    } catch {
      // Storage can be unavailable (e.g. private browsing); show the modal.
    }
    const modal = document.getElementById('my_modal_3') as HTMLDialogElement;

    if (shouldShowModal && modal) {
      modal.showModal();
    }
  }, []);

  const handleDontShowAgain = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, 'false');
    } catch {
      // Ignore: the modal will just show again next time.
    }
    const modal = document.getElementById('my_modal_3') as HTMLDialogElement;

    if (modal) {
      modal.close();
    }
  };

  return (
    <>
      <dialog id="my_modal_3" className="modal" aria-labelledby="modal-3-title">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label="Close"
            >
              ✕
            </button>
          </form>
          <div className="flex flex-col gap-2 pr-6">
            <h2 id="modal-3-title" className="sr-only">
              Safety information
            </h2>
            <p>
              If you are in an emergency, please call{' '}
              <a className="underline font-semibold" href="tel:999">
                999
              </a>
            </p>
            <p>
              If you need a refuge space please contact the{' '}
              <a
                className="underline"
                href="https://www.nationaldahelpline.org.uk/"
              >
                National Domestic Abuse Helpline
              </a>{' '}
              on{' '}
              <a className="underline font-semibold" href="tel:08082000247">
                0808 2000 247
              </a>
            </p>
            <p>
              To leave this site quickly at any time, press the{' '}
              <strong>Safe exit</strong> button or the <kbd>Esc</kbd> key.
            </p>
            <p>
              If you&rsquo;re worried someone might be monitoring your devices,
              exit this website and visit from a device only you have access to.{' '}
            </p>
            <p>
              Learn more about{' '}
              <a className="underline" href="https://refugetechsafety.org/">
                safe browsing, and keeping your technology safe.
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              className="btn btn-accent text-white"
              onClick={handleDontShowAgain}
            >
              Don&apos;t show again this session
            </button>
            {/* The page behind a modal dialog is inert, so the fixed
                Safe exit button can't be reached while this is open. */}
            <button
              className="btn bg-red-700 hover:bg-red-800 border-0 text-white"
              onClick={exitSite}
            >
              Safe exit
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Modal;
