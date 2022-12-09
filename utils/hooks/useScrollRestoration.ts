
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"

 const useScrollRestoration = () => {
  const router = useRouter();
  const scrollPositions = useRef<{ [url: string]: number }>({});
  const isBack = useRef(false);
  const scrollRestorationAttemptsAmount = useRef<number>(0)

  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  useEffect(() => {
    if (window && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    router.beforePopState(() => {
      isBack.current = true
      return true
    })

    const onRouteChangeStart = () => {
      const url = router.pathname
      scrollPositions.current[url] = window.scrollY
      // console.log(scrollPositions.current[url])
    }

    const onRouteChangeComplete = (url: any, recursion?: boolean) => {
      if ((isBack.current && scrollPositions.current[url]) || recursion) {
        // console.log(`Should scroll to: ${scrollPositions.current[url]}`);
        setTimeout(() => {
          window.scroll({
            top: scrollPositions.current[url],
            behavior: "auto",
          })
          console.log(`Aiming at: ${scrollPositions.current[url]}`)
          console.log(`Current: ${window.scrollY}`)
          const target = scrollPositions.current[url];
          const current = window.scrollY;
          if (target > current && scrollRestorationAttemptsAmount.current < 8) {
            console.log('hey')
            scrollRestorationAttemptsAmount.current += 1;
            setIsRestoringScroll(true);
            onRouteChangeComplete(url, true)
          } else {
            scrollRestorationAttemptsAmount.current = 0;
            setIsRestoringScroll(false);
          }
        }, 300);

      }

      isBack.current = false
    }

    router.events.on("routeChangeStart", onRouteChangeStart)
    router.events.on("routeChangeComplete", onRouteChangeComplete)

    return () => {
      router.events.off("routeChangeStart", onRouteChangeStart)
      router.events.off("routeChangeComplete", onRouteChangeComplete)
    }
  }, [router]);

  return {
    isRestoringScroll,
  }
}

export default useScrollRestoration;
