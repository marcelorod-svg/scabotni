'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useIsMobile } from '@/hooks/useMobilePerf';

import 'swiper/css';

// ─── CSS global (inyectado una sola vez) ──────────────────────────────────────
const SLIDER_CSS = `
  body.is-swiping .scabotni-backdrop {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  body.is-swiping .scabotni-slide-wrapper {
    transition: none !important;
  }
  @media (max-width: 768px) {
    .scabotni-backdrop {
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
    }
  }
  @media (min-width: 769px) {
    .scabotni-backdrop {
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
  }
`;

function SliderStyles() {
  return <style>{SLIDER_CSS}</style>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SliderProps<T> {
  items: T[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  renderCard: (item: T, isActive: boolean) => React.ReactNode;
  originRect?: DOMRect | null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ScaBOTni_Slider<T>({
  items,
  initialIndex,
  isOpen,
  onClose,
  renderCard,
  originRect,
}: SliderProps<T>) {
  const isMobile = useIsMobile();
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [swiperReady, setSwiperReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialIndex);
      setSwiperReady(false);
      const t = setTimeout(() => {
        swiperRef.current?.slideTo(initialIndex, 0);
        setSwiperReady(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback(() => {
    document.body.classList.add('is-swiping');
  }, []);

  const handleTouchEnd = useCallback(() => {
    document.body.classList.remove('is-swiping');
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  }, []);

  // ── Animación fly-in ──────────────────────────────────────────────────────
  const flyOrigin = originRect
    ? {
        x: originRect.left + originRect.width / 2 - window.innerWidth / 2,
        y: originRect.top + originRect.height / 2 - window.innerHeight / 2,
        scaleX: originRect.width / window.innerWidth,
        scaleY: originRect.height / window.innerHeight,
        opacity: 0,
      }
    : { scale: 0.92, opacity: 0 };

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
    : { scale: 0.92, opacity: 0 };

  // PATCH: spring del fly-in diferenciado por dispositivo.
  //
  // El problema en mobile: stiffness=340 + mass=0.8 genera una animación de
  // ~480ms con overshoot. Se siente "pesada" porque la card tarda en asentarse.
  //
  // En mobile usamos:
  //   - stiffness alta (500) → arranca rápido
  //   - damping alto (42)    → frena sin rebotar
  //   - mass baja (0.6)      → responde casi inmediatamente al input
  // Resultado: la card aparece en ~220ms, sin overshoot perceptible.
  //
  // Si no hay originRect (no hay fly-in, solo fade+scale), en mobile
  // usamos tween directo: más predecible y aún más rápido.
  const flyTransition = originRect
    ? (isMobile
        ? { type: 'spring' as const, stiffness: 500, damping: 42, mass: 0.6 }
        : { type: 'spring' as const, stiffness: 340, damping: 30, mass: 0.8 })
    : (isMobile
        ? { type: 'tween' as const, duration: 0.18, ease: 'easeOut' }
        : { type: 'spring' as const, stiffness: 340, damping: 30, mass: 0.8 });

  return (
    <>
      <SliderStyles />
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="slider-backdrop"
              className="scabotni-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={onClose}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(7, 10, 18, 0.88)',
              }}
            />

            {/* Contenedor principal */}
            <motion.div
              key="slider-container"
              initial={flyOrigin}
              animate={flyTarget}
              exit={flyExit}
              transition={flyTransition}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 56,
                paddingBottom: 48,
                overflowY: 'auto',
                pointerEvents: 'none',
              }}
            >
              {/* Botón cerrar */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  position: 'fixed',
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1px solid rgba(245,185,66,0.35)',
                  background: 'rgba(13,17,23,0.75)',
                  ...(isMobile ? {} : {
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }),
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

              {/* Counter */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: swiperReady ? 1 : 0, y: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                style={{
                  position: 'fixed',
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
                  zIndex: 10,
                }}
              >
                {activeIndex + 1} / {items.length}
              </motion.div>

              {/* Swiper */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 520, pointerEvents: 'all' }}
              >
                <Swiper
                  modules={[Virtual, Keyboard, A11y]}
                  virtual={{ enabled: true, addSlidesAfter: 1, addSlidesBefore: 1 }}
                  keyboard={{ enabled: true }}
                  spaceBetween={24}
                  slidesPerView={1}
                  centeredSlides
                  initialSlide={initialIndex}
                  onSwiper={(swiper) => { swiperRef.current = swiper; }}
                  onSlideChange={handleSlideChange}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTransitionEnd={handleTouchEnd}
                  grabCursor
                  resistance
                  resistanceRatio={0.65}
                  speed={300}
                  touchRatio={1}
                  threshold={isMobile ? 8 : 4}
                  style={{ width: '100%', padding: '4px 0 8px' }}
                >
                  {items.map((item, index) => (
                    <SwiperSlide key={index} virtualIndex={index}>
                      {({ isActive }: { isActive: boolean }) => (
                        <SlideWrapper isActive={isActive} isMobile={isMobile}>
                          {renderCard(item, isActive)}
                        </SlideWrapper>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Nav dots */}
              {items.length <= 20 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: swiperReady ? 1 : 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ pointerEvents: 'all', marginTop: 12 }}
                >
                  <NavDots
                    total={items.length}
                    active={activeIndex}
                    onDotClick={(i) => swiperRef.current?.slideTo(i)}
                  />
                </motion.div>
              )}

              <SwipeHint />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── SlideWrapper ─────────────────────────────────────────────────────────────

function SlideWrapper({
  isActive,
  isMobile,
  children,
}: {
  isActive: boolean;
  isMobile: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="scabotni-slide-wrapper"
      animate={
        isMobile
          ? { scale: isActive ? 1 : 0.96, opacity: isActive ? 1 : 0.35 }
          : { scale: isActive ? 1 : 0.93, opacity: isActive ? 1 : 0.4, filter: isActive ? 'blur(0px)' : 'blur(2px)' }
      }
      transition={
        isMobile
          ? { type: 'tween', duration: 0.15, ease: 'easeOut' }
          : { type: 'spring', stiffness: 300, damping: 28, mass: 0.7 }
      }
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        willChange: isMobile ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── NavDots ──────────────────────────────────────────────────────────────────

function NavDots({
  total,
  active,
  onDotClick,
}: {
  total: number;
  active: number;
  onDotClick: (i: number) => void;
}) {
  const maxDots = 9;
  let start = Math.max(0, active - Math.floor(maxDots / 2));
  const end = Math.min(total, start + maxDots);
  if (end - start < maxDots) start = Math.max(0, end - maxDots);
  const visible = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {visible.map((i) => (
        <motion.button
          key={i}
          onClick={() => onDotClick(i)}
          animate={{
            width: i === active ? 20 : 6,
            background: i === active ? '#f5b942' : 'rgba(245,185,66,0.28)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0, outline: 'none' }}
          aria-label={`Ir al item ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── SwipeHint ────────────────────────────────────────────────────────────────

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
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(245,185,66,0.6)',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: 12,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <motion.span animate={{ x: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>←</motion.span>
          Deslizá para navegar
          <motion.span animate={{ x: [4, -4, 4] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>→</motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
