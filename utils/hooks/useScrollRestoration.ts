
import { useRouter } from "next/router"
import { useEffect, useRef } from "react"

 const useScrollRestoration = () => {
  const router = useRouter()

  const scrollPositions = useRef<{ [url: string]: number }>({})
  const isBack = useRef(false)

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

    const onRouteChangeComplete = (url: any) => {
      if (isBack.current && scrollPositions.current[url]) {
        // console.log(`Should scroll to: ${scrollPositions.current[url]}`);
        setTimeout(() => {
          window.scroll({
            top: scrollPositions.current[url],
            behavior: "smooth",
          })
        }, 1000)
      }

      isBack.current = false
    }

    router.events.on("routeChangeStart", onRouteChangeStart)
    router.events.on("routeChangeComplete", onRouteChangeComplete)

    return () => {
      router.events.off("routeChangeStart", onRouteChangeStart)
      router.events.off("routeChangeComplete", onRouteChangeComplete)
    }
  }, [router])
}

export default useScrollRestoration;
