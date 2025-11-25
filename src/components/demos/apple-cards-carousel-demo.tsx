"use client";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";

export function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Health as a Lifestyle.
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                Your health is personal.
              </span>{" "}
              We believe in providing discreet, professional care that fits your lifestyle. 
              Whether it's for daily wellness or specific needs, our kits are curated 
              by experts to ensure you get exactly what you need, when you need it.
            </p>
            <div className="relative h-64 w-full mt-10">
               <Image
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
                alt="Medical kit"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

const data = [
  {
    category: "Sexual Health",
    title: "The Weekend Kit.",
    src: "https://images.unsplash.com/photo-1606166325683-e6deb697d301?q=80&w=2085&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Daily Wellness",
    title: "Confidence, bottled.",
    src: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Emergency",
    title: "Prepared for anything.",
    src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop",
    content: <DummyContent />,
  },
  {
    category: "Consultation",
    title: "Expert advice, privately.",
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
    content: <DummyContent />,
  },
];
