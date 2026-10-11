import React, { createContext, useContext, useMemo, useState } from "react";

// Shared state between the page (which section is on screen) and the 3D scene / navbar.
const SceneContext = createContext({ section: null, step: 0, setSection() {}, setStep() {} });

export function SceneProvider({ children }) {
  const [section, setSection] = useState(null);
  const [step, setStep] = useState(0);
  const value = useMemo(() => ({ section, step, setSection, setStep }), [section, step]);
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}
export const useScene = () => useContext(SceneContext);
