'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { Play, Info } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import type { Anime } from '@/lib/types'

interface HeroSliderProps {
  slides: Anime[]
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  const plugin = Autoplay({ delay: 5000, stopOnInteraction: false })

  const handleDotClick = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index)
    }
  }, [api])

  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-900 flex items-center justify-center text-white text-2xl">
        Загрузка слайдов...
      </div>
    )
  }

  return (
    <section className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[plugin]}
        className="w-full h-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="relative h-full">
              <div className="relative w-full h-full">
                <Image
                  src={slide.poster || '/placeholder.jpg'}
                  alt={slide.title.ru || slide.title.en || 'Anime poster'}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
                />
                {/* Gradient overlay for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent md:hidden" />
                {/* Gradient overlay for desktop */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/20 to-transparent hidden md:block" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 lg:p-12 text-white z-10">
                <div className="max-w-3xl">
                  <h2 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                    {slide.title.ru || slide.title.en}
                  </h2>
                  <p className="text-base md:text-lg mb-4 line-clamp-3 drop-shadow-md">
                    {slide.description}
                  </p>
                  <div className="flex space-x-4">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link href={`/anime/${slide.id}/watch`}>
                        <Play className="mr-2 h-5 w-5" /> Смотреть
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                      <Link href={`/anime/${slide.id}`}>
                        <Info className="mr-2 h-5 w-5" /> Подробнее
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex" />

        {/* Dots for navigation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                current === index + 1 ? 'bg-white' : 'bg-gray-400 hover:bg-gray-200'
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
