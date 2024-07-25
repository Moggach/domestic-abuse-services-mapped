import React, { useEffect } from 'react';

const Banner = () => {
  useEffect(() => {
    document.getElementById('my_modal_3').showModal();
  }, []);

  return (
    <>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <p>If you are in an emergency, please call 999</p>
          <p>If you’re worried someone might be monitoring your devices, exit this website and visit from a device only you have access to. </p>
          <p>Learn more about <a className="underline" href="https://refugetechsafety.org/">safe browsing, and keeping your technology safe.</a></p>
        </div>
      </dialog>
    </>
  );
};

export default Banner;
