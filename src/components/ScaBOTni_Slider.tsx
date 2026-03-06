'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Keyboard, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SliderProps<T> {
  items: T[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  renderCard: (item: T, isActive: boolean) => React.ReactNode;
  originRect?: DOMRect | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────

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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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

  // ── Animación fly-in desde la card origen ─────────────────────────────────
  const flyOrigin = originRect
    ? {
        x: originRect.left + originRect.width / 2 - window.innerWidth / 2,
        y: originRect.top + originRect.height / 2 - window.innerHeight / 2,
        scaleX: originRect.width / window.innerWidth,
        scaleY: originRect.height / window.innerHeight,
        opacity: 0,
      }
    : { scale: 0.88, opacity: 0 };

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
    : { scale: 0.88, opacity: 0 };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="slider-backdrop"
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

          {/* Contenedor principal */}
          <motion.div
            key="slider-container"
            initial={flyOrigin}
            animate={flyTarget}
            exit={flyExit}
            transition={{ type: 'spring', stiffness: 340, damping: 30, mass: 0.8 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              // ← Alineación desde arriba con padding-top,
              //   así cards de distinta altura no generan desnivel al swipear
              justifyContent: 'flex-start',
              paddingTop: 56, // espacio para el counter y botón X
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

            {/* Counter */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: swiperReady ? 1 : 0, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
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
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                onSlideChange={handleSlideChange}
                grabCursor
                resistance
                resistanceRatio={0.65}
                speed={380}
                cssMode={false}
                style={{ width: '100%', padding: '4px 0 8px' }}
              >
                {items.map((item, index) => (
                  <SwiperSlide key={index} virtualIndex={index}>
                    {({ isActive }: { isActive: boolean }) => (
                      <SlideWrapper isActive={isActive}>
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
                transition={{ delay: 0.25 }}
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
  );
}

// ─── SlideWrapper ─────────────────────────────────────────────────────────────

function SlideWrapper({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.93,
        opacity: isActive ? 1 : 0.4,
        filter: isActive ? 'blur(0px)' : 'blur(2px)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.7 }}
      style={{
        // ← Alinear desde arriba dentro del slide, no centrar
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── NavDots ──────────────────────────────────────────────────────────────────

function NavDots({
  total, active, onDotClick,
}: {
  total: number; active: number; onDotClick: (i: number) => void;
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
