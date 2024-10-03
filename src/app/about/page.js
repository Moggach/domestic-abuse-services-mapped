import '../styles/globals.css';

const About = () => {
  return (
    <main className="p-4"><h1 className='font-headings text-3xl mb-4'>About</h1>
    <div className="flex flex-col gap-4 text-xl">
    <p>Domestic abuse services mapped is a project built and maintained by <a className="underline" href="https://github.com/Moggach">Moggach</a></p>
    <p>If your service isn't listed please submit the details using this <a className="underline" href="https://airtable.com/appksbQlVr07Kxadu/pagEkSrTVCs0yk2OS/form">form</a> </p>
    <p>Have a question or a comment about the site? Please email <a className="underline" href="mailto:hello@domesticabuseservices.uk">hello@domesticabuseservices.uk</a></p>
    <p>Please note that addresses of services may be approximate. Please contact any service before visiting them</p>
    <p>Refuges are not listed for safety reasons. To access a refuge space please contact the 24/7 freephone <a className="underline" href="https://www.nationaldahelpline.org.uk/">National Domestic Abuse Helpline</a> on 0808 2000 247</p>
    </div>

  
    </main>
  );
};

export default About;
