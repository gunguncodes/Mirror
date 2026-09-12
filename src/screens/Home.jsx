import { useState } from "react";
import Header from "../components/Header";
import HeroContent from "../components/HeroContent";
import HeroVisual from "../components/HeroVisual";
import Input from "./Input";
import TheRead from "./TheRead";

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [applicationText, setApplicationText] = useState("");

  if (screen === "input") {
    return (
      <Input
        onContinue={(text) => {
          setApplicationText(text);
          setScreen("read");
        }}
      />
    );
  }

  if (screen === "read") {
    return <TheRead applicationText={applicationText} />;
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