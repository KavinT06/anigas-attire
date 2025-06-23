"use client";
import Image from 'next/image';
import React, { useEffect } from 'react';
import { initFlowbite } from 'flowbite';
import img1 from "../../../public/assets/1.jpg";
import img2 from "../../../public/assets/2.jpg";
import img3 from "../../../public/assets/3.jpg";
import img4 from "../../../public/assets/4.jpg";
import img5 from "../../../public/assets/5.jpg";
import img6 from "../../../public/assets/6.jpg";
export default function Carousel() {
    useEffect(() => {
        initFlowbite(); // Initialize Flowbite for carousel functionality
    }, []);

    return (
        <div id="default-carousel" className="relative w-full" data-carousel="slide">
            {/* Carousel wrapper */}
            <div className="relative h-56 overflow-hidden rounded-lg md:h-96">
                {/* Item 1 (Active) */}
                <div className="duration-700 ease-in-out" data-carousel-item="active">
                    <Image
                        src={img1}
                        alt="First carousel image"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className="absolute block w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                </div>
                {/* Item 2 */}
                <div className="hidden duration-700 ease-in-out" data-carousel-item>
                    <Image
                        src={img2}
                        alt="Second carousel image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className="absolute block w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                </div>
                {/* Item 3 */}
                <div className="hidden duration-700 ease-in-out" data-carousel-item>
                    <Image
                        src={img3}
                        alt="Third carousel image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className="absolute block w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                </div>
                {/* Item 4 */}
                <div className="hidden duration-700 ease-in-out" data-carousel-item>
                    <Image
                        src={img4}
                        alt="Fourth carousel image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className="absolute block w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                </div>
                {/* Item 5 */}
                <div className="hidden duration-700 ease-in-out" data-carousel-item>
                    <Image
                        src={img5}
                        alt="Fifth carousel image"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className="absolute block w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                </div>
            </div>

            {/* Slider indicators */}
            <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
                {[...Array(5)].map((_, i) => (
                    <button key={i} type="button" className="w-3 h-3 rounded-full bg-white/30" aria-label={`Slide ${i + 1}`} data-carousel-slide-to={i}></button>
                ))}
            </div>

            {/* Slider controls */}
            <button type="button" className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-prev>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                    <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4" />
                    </svg>
                    <span className="sr-only">Previous</span>
                </span>
            </button>
            <button type="button" className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                    <svg className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                    </svg>
                    <span className="sr-only">Next</span>
                </span>
            </button>
        </div>
    );
}
