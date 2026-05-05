import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

const DRAG_OFFSET_RATIO = 0.2;
const DRAG_VELOCITY_THRESHOLD = 500;
const WHEEL_END_DELAY_MS = 140;
const RUBBER_BAND = 0.2;
const SPRING = { type: 'spring', stiffness: 350, damping: 35 };

// Conteneur générique à deux panneaux côte-à-côte avec navigation horizontale
// "in-place" (drag, swipe trackpad, animation au ressort).
//
// Props
// - open               : bool (contrôlé)  — false = primary visible, true = secondary visible.
// - onOpenChange       : (open: bool) => void  — appelé quand l'utilisateur navigue.
// - canOpen            : bool                  — désactive l'ouverture (swipe / wheel) si false.
// - secondaryKey       : any                   — un changement remet à 0 le scroll du secondaire.
// - primary, secondary : ReactNode             — contenu des deux panneaux.
// - className          : string                — classes du viewport (hauteur, etc.).
export default function SlidePanel({
  open,
  onOpenChange,
  canOpen = true,
  secondaryKey = null,
  primary,
  secondary,
  className = '',
}) {
  const viewportRef = useRef(null);
  const secondaryScrollRef = useRef(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const animationRef = useRef(null);

  // Sync via refs : les handlers natifs (wheel, keydown) lisent l'état le plus récent
  // sans avoir à se ré-attacher à chaque rendu.
  const openRef = useRef(open);
  const widthRef = useRef(width);
  const canOpenRef = useRef(canOpen);
  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { widthRef.current = width; }, [width]);
  useEffect(() => { canOpenRef.current = canOpen; }, [canOpen]);

  const targetXFor = (isOpen, w) => (isOpen ? -w : 0);

  const springTo = (isOpen) => {
    const w = widthRef.current;
    if (!w) return;
    animationRef.current?.stop();
    animationRef.current = animate(x, targetXFor(isOpen, w), SPRING);
  };

  // Reset du scroll secondaire quand la "clé" change (ouverture d'une nouvelle entité).
  useEffect(() => {
    if (secondaryScrollRef.current) {
      secondaryScrollRef.current.scrollTop = 0;
    }
  }, [secondaryKey]);

  // Mesure responsive de la largeur.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => setWidth(node.offsetWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Animation au ressort à chaque changement de panneau ou de largeur.
  useEffect(() => {
    if (!width) return;
    animationRef.current?.stop();
    animationRef.current = animate(x, targetXFor(open, width), SPRING);
  }, [open, width, x]);

  // Trackpad : balayage horizontal à deux doigts.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    let active = false;
    let endTimer = null;

    const handleEnd = () => {
      active = false;
      const w = widthRef.current;
      if (!w) return;
      const current = x.get();
      const wantOpen = current < -w / 2;

      if (wantOpen && !canOpenRef.current) {
        springTo(false);
        return;
      }
      if (wantOpen === openRef.current) {
        springTo(wantOpen);
      } else {
        onOpenChange(wantOpen);
      }
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      // Sur le primary sans secondaire dispo, ou avec rien à montrer : on laisse passer.
      if (!canOpenRef.current && !openRef.current) return;

      event.preventDefault();
      const w = widthRef.current;
      if (!w) return;

      if (!active) {
        animationRef.current?.stop();
        active = true;
      }

      // Trackpad macOS : swipe gauche → deltaX > 0 → rail recule (x diminue).
      let next = x.get() - event.deltaX;
      const min = -w;
      const max = 0;
      if (next < min) next = min + (next - min) * RUBBER_BAND;
      else if (next > max) next = max + (next - max) * RUBBER_BAND;
      x.set(next);

      clearTimeout(endTimer);
      endTimer = setTimeout(handleEnd, WHEEL_END_DELAY_MS);
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', onWheel);
      clearTimeout(endTimer);
    };
  }, [x, onOpenChange]);

  // Échap pour fermer le secondaire.
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = width * DRAG_OFFSET_RATIO;
    const swiped =
      Math.abs(offset) > threshold || Math.abs(velocity) > DRAG_VELOCITY_THRESHOLD;
    if (!swiped) return;

    if (!open && offset < 0 && canOpen) onOpenChange(true);
    else if (open && offset > 0) onOpenChange(false);
  };

  const dragEnabled = canOpen || open;

  return (
    <div ref={viewportRef} className={`overflow-hidden touch-pan-y ${className}`}>
      <motion.div
        className="flex h-full"
        style={{ width: '200%', x }}
        drag={dragEnabled ? 'x' : false}
        dragConstraints={{ left: -width, right: 0 }}
        dragElastic={0.15}
        dragMomentum={false}
        onDragStart={() => animationRef.current?.stop()}
        onDragEnd={handleDragEnd}
      >
        <div className="w-1/2 shrink-0 h-full overflow-y-auto">{primary}</div>
        <div ref={secondaryScrollRef} className="w-1/2 shrink-0 h-full overflow-y-auto">
          {secondary}
        </div>
      </motion.div>
    </div>
  );
}
