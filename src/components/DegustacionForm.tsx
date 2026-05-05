import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle, AlertCircle, Loader2, Wine } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HORARIOS = [
  'Miércoles 13/05 | 16:00 a 18:00 hs.',
  'Miércoles 13/05 | 19:00 a 21:00 hs.',
  'Jueves 14/05 | 16:00 a 18:00 hs.',
  'Jueves 14/05 | 19:00 a 21:00 hs.',
];

const SUCURSALES = [
  'Ballester', 'Balvanera', 'Barrancas de Belgrano', 'Bella Vista',
  'Belgrano', 'Caballito', 'Campana', 'Canitas', 'Del Viso',
  'Don Torcuato', 'Dovoto', 'Escobar', 'Floresta', 'Florida',
  'Hurlingham', 'Ituzaingo', 'Jose C Paz', 'Machwitz', 'Martinez',
  'Mataderos', 'Merlo', 'Moreno', 'Muniz', 'Munro', 'Pacheco',
  'Palermo', 'Paternal', 'Pilar Centro', 'Pilar Derqui', 'Polvorines',
  'Puerto Madero', 'San Fernando', 'San Martin', 'San Miguel',
  'Tigre', 'Vicente Lopez', 'Villa Adelina', 'Villa Crespo',
  'Villa Urquiza',
];

const MAX_CUPOS = 7;

interface FormData {
  email: string;
  nombre_apellido: string;
  celular: string;
  horario: string;
  sucursal: string;
}

interface FormErrors {
  email?: string;
  nombre_apellido?: string;
  celular?: string;
  horario?: string;
  sucursal?: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function DegustacionForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    nombre_apellido: '',
    celular: '',
    horario: '',
    sucursal: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [cuposPorHorario, setCuposPorHorario] = useState<Record<string, number>>({});
  const [loadingCupos, setLoadingCupos] = useState(true);

  const successContainerRef = useRef<HTMLDivElement>(null);
  const successIconRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchCupos();
  }, []);

  useEffect(() => {
    if (submitState === 'success') {
      const ctx = gsap.context(() => {
        gsap.from(successContainerRef.current, {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
        });
        gsap.from(successIconRef.current, {
          scale: 0,
          rotate: -45,
          duration: 0.8,
          delay: 0.2,
          ease: 'elastic.out(1, 0.5)',
        });
      });
      return () => ctx.revert();
    }
  }, [submitState]);

  // Scroll animations for form fields
  useEffect(() => {
    if (submitState !== 'success' && !loadingCupos) {
      const ctx = gsap.context(() => {
        const fields = formRef.current?.children;
        if (fields) {
          gsap.from(Array.from(fields), {
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 85%',
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
          });
        }
      });
      return () => ctx.revert();
    }
  }, [submitState, loadingCupos]);

  // Clean Button Animations
  useEffect(() => {
    if (buttonRef.current && submitState === 'idle') {
      const button = buttonRef.current;
      
      // Subtle pulse
      const pulse = gsap.to(button, {
        boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      return () => pulse.kill();
    }
  }, [submitState]);

  const handleButtonMouseEnter = () => {
    const button = buttonRef.current;
    if (!button) return;

    gsap.to(button, {
      scale: 1.02,
      backgroundColor: '#f59e0b',
      duration: 0.3,
      ease: 'power2.out'
    });
    
    // Subtle icon move
    const icon = button.querySelector('svg');
    if (icon) {
      gsap.to(icon, {
        x: 3,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleButtonMouseLeave = () => {
    const button = buttonRef.current;
    if (!button) return;

    gsap.to(button, {
      scale: 1,
      backgroundColor: '#d97706',
      duration: 0.3,
      ease: 'power2.out'
    });

    const icon = button.querySelector('svg');
    if (icon) {
      gsap.to(icon, {
        x: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  async function fetchCupos() {
    setLoadingCupos(true);
    const { data, error } = await supabase
      .from('degustaciones')
      .select('horario');

    if (!error && data) {
      const counts: Record<string, number> = {};
      HORARIOS.forEach(h => { counts[h] = 0; });
      data.forEach(row => {
        if (counts[row.horario] !== undefined) {
          counts[row.horario]++;
        }
      });
      setCuposPorHorario(counts);
    }
    setLoadingCupos(false);
  }

  function isHorarioLleno(horario: string): boolean {
    return (cuposPorHorario[horario] ?? 0) >= MAX_CUPOS;
  }

  function cuposDisponibles(horario: string): number {
    return Math.max(0, MAX_CUPOS - (cuposPorHorario[horario] ?? 0));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};

    if (!formData.email.trim()) {
      errs.email = 'Ingresá tu correo electrónico';
    } else if (formData.email.length > 100) {
      errs.email = 'El correo es demasiado largo';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      errs.email = 'Ingresá un correo electrónico válido';
    }

    const nombreTrimmed = formData.nombre_apellido.trim();
    if (!nombreTrimmed) {
      errs.nombre_apellido = 'Ingresá tu nombre y apellido';
    } else if (nombreTrimmed.length < 3) {
      errs.nombre_apellido = 'El nombre es muy corto';
    } else if (nombreTrimmed.length > 60) {
      errs.nombre_apellido = 'El nombre es demasiado largo';
    }

    const celularTrimmed = formData.celular.trim();
    if (!celularTrimmed) {
      errs.celular = 'Ingresá tu número de celular';
    } else if (celularTrimmed.length < 8) {
      errs.celular = 'El número es muy corto';
    } else if (celularTrimmed.length > 20) {
      errs.celular = 'El número es demasiado largo';
    } else if (!/^[0-9+\-\s()]+$/.test(celularTrimmed)) {
      errs.celular = 'Ingresá un número válido';
    }

    if (!formData.horario) {
      errs.horario = 'Seleccioná un horario';
    } else if (isHorarioLleno(formData.horario)) {
      errs.horario = 'Este horario ya no tiene cupos disponibles';
    }

    if (!formData.sucursal) {
      errs.sucursal = 'Seleccioná una sucursal';
    }

    return errs;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    // Security Sanitation
    let sanitizedValue = value.replace(/[<>]/g, '');
    
    // Strict numeric-only restriction for phone field
    if (name === 'celular') {
      sanitizedValue = sanitizedValue.replace(/[^0-9+\-\s()]/g, '');
    }

    // Strict letter-only restriction for Name field
    if (name === 'nombre_apellido') {
      // Allows letters (including accents), spaces, and dots
      sanitizedValue = sanitizedValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitState('idle');

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitState('submitting');

    const { error } = await supabase
      .from('degustaciones')
      .insert({
        email: formData.email.trim().toLowerCase(),
        nombre_apellido: formData.nombre_apellido.trim(),
        celular: formData.celular.trim().replace(/\s/g, ''), // Save without spaces
        horario: formData.horario,
        sucursal: formData.sucursal,
      });

    if (error) {
      setSubmitState('error');
    } else {
      setSubmitState('success');
      setFormData({
        email: '',
        nombre_apellido: '',
        celular: '',
        horario: '',
        sucursal: '',
      });
      await fetchCupos();
    }
  }

  const allHorariosLlenos = HORARIOS.every(h => isHorarioLleno(h));

  return (
    <div className="w-full max-w-lg">
      <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-700/50 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
        {/* Card header accent */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

        <div className="px-6 sm:px-10 py-8 sm:py-10">
          {submitState === 'success' ? (
            <div ref={successContainerRef} className="py-8 sm:py-12 flex flex-col items-center text-center px-2">
              <div ref={successIconRef} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 relative z-10" />
              </div>
              <h3 className="text-stone-100 text-xl sm:text-2xl font-light tracking-tight mb-3">
                ¡Todo fue confirmado con <span className="text-emerald-400 font-normal">éxito</span>!
              </h3>
              <p className="text-stone-400 text-xs sm:text-sm max-w-xs leading-relaxed">
                Recibirás una notificación a la brevedad con todos los detalles de la experiencia.
              </p>
              <button
                onClick={() => setSubmitState('idle')}
                className="mt-10 py-3 px-6 text-stone-500 hover:text-stone-300 text-[10px] sm:text-xs font-medium transition-colors duration-200 uppercase tracking-widest border border-stone-800 rounded-full hover:border-stone-700 active:bg-stone-800/50"
              >
                Volver al formulario
              </button>
            </div>
          ) : (
            <>
              {/* Card icon */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Wine className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-stone-100 text-lg font-medium">Registrate acá</h2>
                  <p className="text-stone-500 text-xs mt-0.5">Completá tus datos para reservar tu lugar</p>
                </div>
              </div>

              {/* Error message */}
              {submitState === 'error' && (
                <div className="mb-8 flex items-center gap-4 p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/20 animate-in">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-red-300 font-medium text-sm">Hubo un problema, por favor intentá nuevamente.</p>
                </div>
              )}

              {/* All slots full message */}
              {allHorariosLlenos && !loadingCupos && (
                <div className="mb-8 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-amber-300 text-sm">Todos los horarios están completos. No quedan cupos disponibles.</p>
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-stone-300 text-sm font-medium mb-2">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={100}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={`w-full px-4 py-4 rounded-xl bg-stone-800/60 border text-stone-100 placeholder-stone-600 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 ${
                      errors.email ? 'border-red-500/50' : 'border-stone-700/50 hover:border-stone-600/50'
                    }`}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>

                {/* Nombre y Apellido */}
                <div>
                  <label htmlFor="nombre_apellido" className="block text-stone-300 text-sm font-medium mb-2">
                    Nombre y apellido
                  </label>
                  <input
                    id="nombre_apellido"
                    name="nombre_apellido"
                    type="text"
                    autoComplete="name"
                    maxLength={60}
                    value={formData.nombre_apellido}
                    onChange={handleChange}
                    placeholder="Marty McFly"
                    className={`w-full px-4 py-4 rounded-xl bg-stone-800/60 border text-stone-100 placeholder-stone-600 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 ${
                      errors.nombre_apellido ? 'border-red-500/50' : 'border-stone-700/50 hover:border-stone-600/50'
                    }`}
                  />
                  {errors.nombre_apellido && <p className="mt-1.5 text-xs text-red-400">{errors.nombre_apellido}</p>}
                </div>

                {/* Celular */}
                <div>
                  <label htmlFor="celular" className="block text-stone-300 text-sm font-medium mb-2">
                    Celular
                  </label>
                  <input
                    id="celular"
                    name="celular"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="11 1234-5678"
                    className={`w-full px-4 py-4 rounded-xl bg-stone-800/60 border text-stone-100 placeholder-stone-600 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 ${
                      errors.celular ? 'border-red-500/50' : 'border-stone-700/50 hover:border-stone-600/50'
                    }`}
                  />
                  {errors.celular && <p className="mt-1.5 text-xs text-red-400">{errors.celular}</p>}
                </div>

                {/* Horario */}
                <div>
                  <label htmlFor="horario" className="block text-stone-300 text-sm font-medium mb-2">
                    Horario
                  </label>
                  <select
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleChange}
                    disabled={loadingCupos}
                    className={`w-full px-4 py-4 rounded-xl bg-stone-800/60 border text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 appearance-none cursor-pointer ${
                      errors.horario ? 'border-red-500/50 text-red-300' : 'border-stone-700/50 hover:border-stone-600/50 text-stone-100'
                    } ${loadingCupos ? 'opacity-60 cursor-wait' : ''}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    <option value="" className="bg-stone-800 text-stone-400">
                      {loadingCupos ? 'Cargando horarios...' : 'Seleccioná un horario'}
                    </option>
                    {HORARIOS.map(horario => {
                      const lleno = isHorarioLleno(horario);
                      return (
                        <option
                          key={horario}
                          value={horario}
                          disabled={lleno}
                          className={`bg-stone-800 ${lleno ? 'text-stone-500' : 'text-stone-100'}`}
                        >
                          {horario}
                        </option>
                      );
                    })}
                  </select>
                  {errors.horario && <p className="mt-1.5 text-xs text-red-400">{errors.horario}</p>}
                </div>

                {/* Sucursal */}
                <div>
                  <label htmlFor="sucursal" className="block text-stone-300 text-sm font-medium mb-2">
                    Sucursal más frecuente
                  </label>
                  <select
                    id="sucursal"
                    name="sucursal"
                    value={formData.sucursal}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 rounded-xl bg-stone-800/60 border text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 appearance-none cursor-pointer ${
                      errors.sucursal ? 'border-red-500/50 text-red-300' : 'border-stone-700/50 hover:border-stone-600/50 text-stone-100'
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                    }}
                  >
                    <option value="" className="bg-stone-800 text-stone-400">Seleccioná una sucursal</option>
                    {SUCURSALES.map(s => (
                      <option key={s} value={s} className="bg-stone-800 text-stone-100">{s}</option>
                    ))}
                  </select>
                  {errors.sucursal && <p className="mt-1.5 text-xs text-red-400">{errors.sucursal}</p>}
                </div>

                {/* Submit button */}
                <div className="pt-3">
                  <button
                    ref={buttonRef}
                    type="submit"
                    onMouseEnter={handleButtonMouseEnter}
                    onMouseLeave={handleButtonMouseLeave}
                    disabled={submitState === 'submitting' || (allHorariosLlenos && !loadingCupos)}
                    className="w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-lg border border-amber-500/50 active:scale-95 touch-manipulation"
                  >
                    
                    {submitState === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Card bottom accent */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>
    </div>
  );
}
