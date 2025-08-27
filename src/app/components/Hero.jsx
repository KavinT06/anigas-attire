import React from 'react';
import Image from 'next/image';
import logo  from "../../assets/logo.jpg"
import heroimg from "../../assets/hero-img.jpg";

export default function Hero() {
    return (
        <>
            <div className="bg-gradient-to-b from-green-50 to-green-100">
                <section className="py-10 sm:py-16 xl:py-24">
                    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                            <div className='md:ml-2'>
                                <h1 className="text-4xl font-bold text-black sm:text-6xl lg:text-7xl">
                                    Elevate your wardrobe, with
                                    <div className="relative inline-flex">
                                        <span className="absolute inset-x-0 bottom-0 border-b-[30px] border-[#4ADE80]"></span>
                                        <h1 className="relative text-4xl font-bold text-[#f54a00] sm:text-6xl lg:text-7xl">Aniga's Attire.</h1>
                                    </div>
                                </h1>

                                <p className="mt-8 text-base text-black sm:text-xl">Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat.</p>

                                <div className="mt-10 sm:flex sm:items-center sm:space-x-8">
                                    <a href="/products" title="" className="ml-10 xl:ml-0 inline-flex items-center justify-center px-10 py-4 text-base font-semibold text-white transition-all duration-200 bg-orange-500 hover:bg-orange-600 focus:bg-orange-600" role="button"> Shop now </a>

                                    {/* <a href="#" title="" className="inline-flex items-center mt-6 text-base font-semibold transition-all duration-200 sm:mt-0 hover:opacity-80">
                                        <svg className="w-10 h-10 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path fill="#F97316" stroke="#F97316" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Watch video
                                    </a> */}
                                </div>
                            </div>

                            <div>
                                <Image className="w-3/4 md:w-3/4 xl:w-4/6 ml-5 mt-5 xl:mt-0 xl:ml-24" src={heroimg} alt="" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

        </>
    );
};