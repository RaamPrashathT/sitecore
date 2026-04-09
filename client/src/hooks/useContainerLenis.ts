import { useEffect, type RefObject } from "react";
import Lenis from "lenis";

interface UseContainerLenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    enabled?: boolean;
}

export function useContainerLenis(
    ref: RefObject<HTMLElement | null>,
    options: UseContainerLenisOptions = {},
) {
    const {
        duration = 0.6,
        easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        enabled = true,
    } = options;

    useEffect(() => {
        if (!enabled || !ref.current) return;

        const lenis = new Lenis({
            wrapper: ref.current,
            content: ref.current.firstElementChild as HTMLElement,
            duration,
            easing,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, [enabled]);
}
