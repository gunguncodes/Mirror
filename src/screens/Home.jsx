import { useState } from "react";
import Header from "../components/Header";
import HeroContent from "../components/HeroContent";
import HeroVisual from "../components/HeroVisual";
import Input from "./Input";
import TheRead from "./TheRead";
import MirrorTest from "./MirrorTest";

export default function Home() {
  const [screen, setScreen] = useState("home");

  const [application, setApplication] = useState({
    text: "",
    applicationType: "Resume",
    role: "",
    focusAreas: [],
  });

  function handleApplicationSubmit(data) {
    setApplication(data);
    setScreen("read");
  }

  function handleOpenMirrorTest() {
    setScreen("mirror-test");
  }

  function handleBackToRead() {
    setScreen("read");
  }

  if (screen === "input") {
    return <Input onContinue={handleApplicationSubmit} />;
  }

  if (screen === "read") {
    return (
      <TheRead
        applicationText={application.text}
        applicationType={application.applicationType}
        role={application.role}
        focusAreas={application.focusAreas}
        onOpenMirrorTest={handleOpenMirrorTest}
      />
    );
  }

  if (screen === "mirror-test") {
    return (
      <MirrorTest
        originalText={application.text}
        applicationType={application.applicationType}
        role={application.role}
        onBack={handleBackToRead}
      />
    );
  }

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <Header />

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-16 px-6 py-16 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
        <HeroContent onStart={() => setScreen("input")} />
        <HeroVisual />
      </main>
    </div>
  );
}