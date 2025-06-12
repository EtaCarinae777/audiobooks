"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Przykładowe dane audiobooków
const audiobooks = [
  {
    id: 1,
    title: "Sherlock Holmes: Pies Baskerville'ów",
    author: "Arthur Conan Doyle",
    cover: "/sherlock1.jpg", // Zastąp rzeczywistymi ścieżkami do obrazów
    duration: "7h 42min",
    rating: 4.7,
    category: "Kryminał",
  },
  {
    id: 2,
    title: "Mistrz i Małgorzata",
    author: "Michaił Bułhakow",
    cover: "/mistrz.jpg",
    duration: "9h 15min",
    rating: 4.9,
    category: "Klasyka",
  },
  {
    id: 3,
    title: "Kroniki marsjańskie",
    author: "Ray Bradbury",
    cover: "/kroniki.jpg",
    duration: "6h 30min",
    rating: 4.5,
    category: "Sci-Fi",
  },
  {
    id: 4,
    title: "Wiedźmin: Ostatnie życzenie",
    author: "Andrzej Sapkowski",
    cover: "/wiedzmin.jpg",
    duration: "10h 18min",
    rating: 4.8,
    category: "Fantasy",
  },
  {
    id: 5,
    title: "Stulecie chirurgów",
    author: "Jürgen Thorwald",
    cover: "/chirurg.jpg",
    duration: "12h 05min",
    rating: 4.6,
    category: "Literatura faktu",
  },
  {
    id: 6,
    title: "Duma i uprzedzenie",
    author: "Jane Austen",
    cover: "/duma.jpg",
    duration: "11h 35min",
    rating: 4.7,
    category: "Romans",
  },
];

export function AudiobookCarouselSection() {
  // Plugin do automatycznego przewijania
  const plugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true,
    })
  );

  // Funkcja generująca gwiazdki oceny
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-yellow-400 text-sm ${
              i < fullStars
                ? "font-bold"
                : i === fullStars && hasHalfStar
                ? "opacity-60"
                : "opacity-30"
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="py-16 sm:py-24 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Popularne audiobooki
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Odkryj bestsellerowe tytuły, których słuchają tysiące użytkowników.
            Każdego dnia dodajemy nowe pozycje.
          </p>
        </div>

        {/* Karuzela z audiobookami */}
        <Carousel
          plugins={[plugin.current]}
          className="w-full mx-auto"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {audiobooks.map((book) => (
              <CarouselItem
                key={book.id}
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="h-full">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 p-0">
                    <div className="relative aspect-[2/3] w-full">
                      <Image
                        src={book.cover}
                        alt={`Okładka audiobooka: ${book.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {book.duration}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-10 pb-4 px-4">
                        <div className="text-white">
                          <div className="text-xs font-medium uppercase tracking-wider mb-1">
                            {book.category}
                          </div>
                          <h3 className="text-base font-bold leading-tight">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-300 mt-1">
                            {book.author}
                          </p>
                          <div className="mt-2">
                            {renderRating(book.rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4 flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-0 hover:bg-transparent hover:text-blue-600"
                      >
                        Szczegóły
                      </Button>
                      <Button size="sm" className="rounded-full">
                        <span className="sr-only">Odtwórz</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="mx-2" />
            <CarouselNext className="mx-2" />
          </div>
        </Carousel>

        <div className="mt-12 text-center">
          <Button size="lg">Zobacz wszystkie audiobooki</Button>
        </div>
      </div>
    </div>
  );
}
