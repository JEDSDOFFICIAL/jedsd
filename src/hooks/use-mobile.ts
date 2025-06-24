import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}









const SM_BREAKPOINT = 1064

export function useIsTab() {
  const [isTab, setIsTab] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SM_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsTab(window.innerWidth < SM_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsTab(window.innerWidth < SM_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTab
}





