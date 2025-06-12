"use client";

import Image from "next/image";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AudiobookCarouselSection } from "./components/AudiobookCarouselSection";

const images = ["/car1.jpg", "/car2.jpg", "/car3.jpg"];
export default function Home() {
  // Inicjalizacja pluginu Autoplay
  const plugin = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: false,
    })
  );

  return (
    <div>
      <div className="mx-auto max-w-8xl px-6 lg:px-6">
        <div className="py-12 sm:py-20 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:py-32">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Przemień każdą chwilę w fascynującą podróż
            </h1>
            <p className="mt-6 text-lg leading-8 text-justify text-gray-600">
              Twój czas jest cenny - wypełnij go porywającymi historiami. Daj
              się ponieść kosmicznej przygodzie. Rozwiąż intrygującą zagadkę.
              Zakochaj się w niesamowitych bohaterach. Możliwości są
              nieograniczone - biblioteka ponad 600 tysięcy audiobooków i
              e-booków czeka na odkrycie. Rozpocznij swoją literacką przygodę
              już teraz!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="sm:w-auto w-full">
                Wypróbuj za darmo!
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="sm:w-auto w-full"
                asChild
              ></Button>
            </div>
            <div className="mt-10 border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-500">
                Zaufało nam ponad 10,000+ użytkowników
              </p>
              <div className="mt-4 flex items-center gap-x-6"></div>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 flex items-center justify-center relative h-[500px] w-full">
            <Carousel
              plugins={[plugin.current]}
              className="w-full max-w-lg mx-auto"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent className="flex items-center justify-center">
                {images.map((imageSrc, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center"
                  >
                    <div className="relative w-full h-full aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={imageSrc}
                        alt={`Slajd ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 500px"
                        style={{ objectFit: "cover" }}
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
        <div className="py-16 sm:py-24 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Odkryj popularne kategorie
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Wybierz spośród tysięcy tytułów z różnych gatunków literackich.
              Znajdź idealną historię dla siebie.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 pt-0">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 text-white z-20">
                  <h3 className="text-xl font-bold">Kryminały i Thrillery</h3>
                  <p className="text-sm text-gray-200">430+ tytułów</p>
                </div>
                <Image
                  src="/kryminal.jpg"
                  alt="Kryminały i Thrillery"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ objectFit: "cover" }}
                />
                <div className="h-full w-full bg-gray-300"></div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm">
                  Wciągające zagadki, nieoczekiwane zwroty akcji i mistrzowskie
                  intrygi.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start p-0 hover:bg-transparent"
                >
                  Przeglądaj kategorię →
                </Button>
              </CardContent>
            </Card>

            {/* Karta kategorii 2 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 pt-0">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 text-white z-20">
                  <h3 className="text-xl font-bold">Fantasy i Sci-Fi</h3>
                  <p className="text-sm text-gray-200">520+ tytułów</p>
                </div>
                <Image
                  src="/fantasy.jpg"
                  alt="Fantasy i Sci-Fi"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ objectFit: "cover" }}
                />
                <div className="h-full w-full bg-gray-300"></div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm">
                  Magiczne światy, epickie przygody i niesamowite wizje
                  przyszłości.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start p-0 hover:bg-transparent"
                >
                  Przeglądaj kategorię →
                </Button>
              </CardContent>
            </Card>

            {/* Karta kategorii 3 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 pt-0">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 text-white z-20">
                  <h3 className="text-xl font-bold">Romans</h3>
                  <p className="text-sm text-gray-200">380+ tytułów</p>
                </div>
                <Image
                  src="/romans.jpg"
                  alt="Romans"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ objectFit: "cover" }}
                />
                <div className="h-full w-full bg-gray-300"></div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm">
                  Poruszające historie miłosne, namiętne romanse i niezapomniane
                  uczucia.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start p-0 hover:bg-transparent"
                >
                  Przeglądaj kategorię →
                </Button>
              </CardContent>
            </Card>

            {/* Karta kategorii 4 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 pt-0">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <div className="absolute bottom-4 left-4 text-white z-20">
                  <h3 className="text-xl font-bold">Literatura faktu</h3>
                  <p className="text-sm text-gray-200">290+ tytułów</p>
                </div>
                <div className="h-full w-full bg-gray-300"></div>
                <Image
                  src="/reportaze.jpg"
                  alt="Reportaze"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm">
                  Fascynujące biografie, dokumenty historyczne i reportaże.
                </p>
                <Button
                  variant="ghost"
                  className="mt-2 w-full justify-start p-0 hover:bg-transparent"
                >
                  Przeglądaj kategorię →
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg">Zobacz wszystkie kategorie</Button>
          </div>
        </div>
        <AudiobookCarouselSection />
      </div>
    </div>
  );
}
