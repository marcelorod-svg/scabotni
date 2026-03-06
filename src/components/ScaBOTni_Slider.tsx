'use client';

/**
 * ScaBOTni_Slider
 * ---------------
 * Modal/overlay que recibe un array de datos (playerData o worldCupData)
 * y el componente-carta ya existente, y provee navegación por swipe.
 *
 * DEPENDENCIAS (agregar al proyecto si no están):
 *   npm install swiper
 *   (framer-motion ya está en el proyecto)
 *
 * USO EN Vestuario.tsx:
 *   import { ScaBOTni_Slider } from '@/components/ScaBOTni_Slider';
 *   <ScaBOTni_Slider
 *     items={playerData}
 *     initialIndex={clickedIndex}
 *     isOpen={sliderOpen}
 *     onClose={() => setSliderOpen(false)}
 *     renderCard={(item, isActive) => <PlayerDetailCard player={item} />}
 *     originRect={originRect}   // ← getBoundingClientRect() de la card clickeada
 *   />
 *
 * USO EN CentralDeDatos.tsx:
 *   <ScaBOTni_Slider
 *     items={worldCupTeams}
 *     initialIndex={clickedIndex}
 *     isOpen={sliderOpen}
 *     onClose={() => setSliderOpen(false)}
 *     renderCard={(item, isActive) => <TeamDetailCard team={item} />}
 *     originRect={originRect}
 *   />
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// ─── Swiper core styles (importar una sola vez en el proyecto) ───────────────
// Si ya están en globals.css, eliminá estas dos líneas:
import 'swiper/css';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SliderProps<T> {
  /** Array completo de items (playerData / worldCupTeams) */
  items: T[];
  /** Índice del item que se clickeó para abrir el slider */
  initialIndex: number;
  /** Controla visibilidad del modal */
  isOpen: boolean;
  /** Callback para cerrar – el padre restaura el scroll */
  onClose: () => void;
  /**
   * Render prop: recibe el item y si es el slide activo.
   * Renderizá aquí el componente de carta ya existente SIN modificarlo.
   */
  renderCard: (item: T, isActive: boolean) => React.ReactNode;
  /**
   * DOMRect de la card clickeada (para la animación de "volar" hacia el centro).
   * Obtener con: ref.current.getBoundingClientRect()
   */
  originRect?: DOMRect | null;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function ScaBOTni_Slider<T>({
  items,
  initialIndex,
  isOpen,
  onClose,
  renderCard,
  originRect,
}: SliderProps<T>) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [swiperReady, setSwiperReady] = useState(false);

  // Sincronizar índice cuando se abre desde distintas cards
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setSwiperReady(false);
      // Pequeño delay para que el overlay monte antes de saltar al slide
      const t = setTimeout(() => {
        swiperRef.current?.slideTo(initialIndex, 0);
        setSwiperReady(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialIndex]);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  }, []);

  // ── Calcular origen para la animación "fly-in" ────────────────────────────
  // Si tenemos el DOMRect de la card origen, arrancamos desde ahí.
  // Si no, simplemente escaleamos desde el centro.
  const flyOrigin = originRect
    ? {
        x: originRect.left + originRect.width / 2 - window.innerWidth / 2,
        y: originRect.top + originRect.height / 2 - window.innerHeight / 2,
        scaleX: originRect.width / window.innerWidth,
        scaleY: originRect.height / window.innerHeight,
        opacity: 0,
      }
    : { scale: 0.85, opacity: 0 };

  const flyTarget = originRect
    ? { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }
    : { scale: 1, opacity: 1 };

  const flyExit = originRect
    ? {
        x: originRect.left + originRect.width / 2 - window.innerWidth / 2,
        y: originRect.top + originRect.height / 2 - window.innerHeight / 2,
        scaleX: originRect.width / window.innerWidth,
        scaleY: originRect.height / window.innerHeight,
        opacity: 0,
      }
    : { scale: 0.85, opacity: 0 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            key="slider-backdrop"
            className="scabotni-slider-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1000,
              background: 'rgba(7, 10, 18, 0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          />

          {/* ── Contenedor del slider ─────────────────────────────────────── */}
          <motion.div
            key="slider-container"
            className="scabotni-slider-container"
            initial={flyOrigin}
            animate={flyTarget}
            exit={flyExit}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 30,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none', // el backdrop maneja el click-fuera
            }}
          >
            {/* ── Botón cerrar ─────────────────────────────────────────── */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 10,
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '1px solid rgba(245,185,66,0.35)',
                background: 'rgba(13,17,23,0.75)',
                backdropFilter: 'blur(8px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f5b942',
                fontSize: 18,
                fontFamily: 'Barlow Condensed, sans-serif',
                pointerEvents: 'all',
                outline: 'none',
              }}
              aria-label="Cerrar"
            >
              ✕
            </motion.button>

            {/* ── Counter ──────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: swiperReady ? 1 : 0, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 22,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(245,185,66,0.65)',
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {activeIndex + 1} / {items.length}
            </motion.div>

            {/* ── Swiper ───────────────────────────────────────────────── */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 520,
                pointerEvents: 'all',
              }}
            >
              <Swiper
                modules={[Virtual, Keyboard, A11y]}
                virtual={{ enabled: true, addSlidesAfter: 1, addSlidesBefore: 1 }}
                keyboard={{ enabled: true }}
                spaceBetween={24}
                slidesPerView={1}
                centeredSlides
                initialSlide={initialIndex}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={handleSlideChange}
                grabCursor
                resistance
                resistanceRatio={0.65}
                speed={380}
                cssMode={false}
                style={{
                  width: '100%',
                  padding: '8px 0 24px',
                }}
              >
                {items.map((item, index) => (
                  <SwiperSlide key={index} virtualIndex={index}>
                    {({ isActive }: { isActive: boolean }) => (
                      <SlideWrapper isActive={isActive} swiperReady={swiperReady}>
                        {renderCard(item, isActive)}
                      </SlideWrapper>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* ── Dots de navegación ───────────────────────────────────── */}
            {items.length <= 20 && (
              <NavDots
                total={items.length}
                active={activeIndex}
                onDotClick={(i) => swiperRef.current?.slideTo(i)}
              />
            )}

            {/* ── Hint de swipe (desaparece al primer swipe) ──────────── */}
            <SwipeHint />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── SlideWrapper: anima la carta activa vs. las adyacentes ─────────────────

function SlideWrapper({
  isActive,
  swiperReady,
  children,
}: {
  isActive: boolean;
  swiperReady: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.92,
        opacity: isActive ? 1 : 0.45,
        y: isActive ? 0 : 12,
        filter: isActive ? 'blur(0px)' : 'blur(2px)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 28,
        mass: 0.7,
      }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── NavDots ─────────────────────────────────────────────────────────────────

function NavDots({
  total,
  active,
  onDotClick,
}: {
  total: number;
  active: number;
  onDotClick: (i: number) => void;
}) {
  // Mostrar máximo 9 dots, con el activo siempre visible
  const maxDots = 9;
  let start = Math.max(0, active - Math.floor(maxDots / 2));
  const end = Math.min(total, start + maxDots);
  if (end - start < maxDots) start = Math.max(0, end - maxDots);
  const visible = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        marginTop: 4,
        alignItems: 'center',
        pointerEvents: 'all',
      }}
    >
      {visible.map((i) => (
        <motion.button
          key={i}
          onClick={() => onDotClick(i)}
          animate={{
            width: i === active ? 20 : 6,
            background: i === active ? '#f5b942' : 'rgba(245,185,66,0.28)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            height: 6,
            borderRadius: 3,
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
          }}
          aria-label={`Ir al item ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── SwipeHint ───────────────────────────────────────────────────────────────

function SwipeHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            bottom: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(245,185,66,0.6)',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          <motion.span
            animate={{ x: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          >
            ←
          </motion.span>
          Deslizá para navegar
          <motion.span
            animate={{ x: [4, -4, 4] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
