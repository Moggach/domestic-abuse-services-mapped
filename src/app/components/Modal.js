import React, { useEffect } from 'react';

const Modal = () => {
  useEffect(() => {
    const shouldShowModal = localStorage.getItem('showModal') !== 'false';
    if (shouldShowModal) {
      document.getElementById('my_modal_3').showModal();
    }
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem('showModal', 'false');
    document.getElementById('my_modal_3').close();
  };

  return (
    <>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="flex flex-col gap-2">
            <p>If you are in an emergency, please call 999</p>
            <p>
              If you need a refuge space please contact the{' '}
              <a
                className="underline"
                href="https://www.nationaldahelpline.org.uk/"
              >
                National Domestic Abuse Helpline
              </a>{' '}
              on 0808 2000 247
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
          <button
            className="btn bg-green-600 mt-4 text-white"
            onClick={handleDontShowAgain}
          >
            Don&apos;t show again
          </button>
        </div>
      </dialog>
    </>
  );
};

export default Modal;
