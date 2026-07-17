import { useState, useRef } from "react";

export function useScreenNav() {
    const [screen, setScreen] = useState<"queue" | "detail">("queue");
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToScreen = (scr: "queue" | "detail") => {
        setScreen(scr);
        if (scrollContainerRef.current) {
            const index = scr === "queue" ? 0 : 1;
            scrollContainerRef.current.scrollTo({
                left: index * window.innerWidth,
                behavior: "smooth"
            });
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const scrollLeft = target.scrollLeft;
        const width = target.clientWidth;
        if (width === 0) return;
        const index = Math.round(scrollLeft / width);
        const newScreen = index === 0 ? "queue" : "detail";
        if (newScreen !== screen) {
            setScreen(newScreen);
        }
    };

    return {
        screen,
        scrollContainerRef,
        scrollToScreen,
        handleScroll
    };
}
