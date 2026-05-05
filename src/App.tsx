import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import DegustacionForm from './components/DegustacionForm';

function App() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline for the entry animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(bannerRef.current, {
        y: -100,
        opacity: 0,
        duration: 1.2,
      })
      .from(headerRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
      }, '-=0.6')
      .from(formRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, '-=0.4');
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-stone-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-600/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Subtle top border accent */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Full Width Hero Banner */}
        <div ref={bannerRef} className="w-full relative h-[30vh] sm:h-[45vh] min-h-[250px] max-h-[600px] overflow-hidden shadow-2xl shadow-black/50 border-b border-white/5">
          <img 
            src={`${import.meta.env.BASE_URL}Encabezado.jpg`} 
            alt="Experiencia Mi Gusto" 
            className="w-full h-full object-cover brightness-75"
          />
          {/* Overlay gradient to blend with the background */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950"></div>
        </div>

        {/* Content Container */}
        <div className="w-full max-w-2xl px-4 py-10 sm:py-14 flex flex-col items-center -mt-6 sm:-mt-10 relative z-20">
          {/* Header */}
          <header ref={headerRef} className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-stone-950/80 backdrop-blur-md mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400/90 text-xs font-medium tracking-widest uppercase">
                Cupos limitados
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-light text-stone-100 tracking-tight leading-[1.1]">
              Experiencia de Degustación
              <span className="block mt-2 text-amber-400 font-normal">
                a Puertas Abiertas
              </span>
            </h1>
            <p className="mt-6 text-stone-400 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto">
              Sumate a una experiencia exclusiva. Completá el formulario y reservá tu lugar en el horario que prefieras.
            </p>
          </header>

          {/* Form Card */}
          <div ref={formRef} className="w-full flex justify-center">
            <DegustacionForm />
          </div>

          {/* Footer */}
          <footer className="mt-16 pb-12 text-center text-stone-600 text-xs tracking-wide">
            <p>Tu información es confidencial y será utilizada únicamente para esta experiencia.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
