import React from 'react';
import Image from 'next/image';
import logo  from "../../assets/logo.jpg"
import heroimg from "../../assets/hero-img.jpg";

export default function Hero() {
    return (
        <>
            <div className="bg-gradient-to-b from-green-50 to-green-100">
                <header className="">
                    <div className="px-4 mx-auto sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 lg:h-20">
                            <div className="flex-shrink-0 inline-flex">
                                <a href="#" title="" className="flex">
                                    <Image className="w-auto h-7 xl:h-10 xl:ml-28 rounded-lg" src={logo} alt="" />
                                </a>
                                <p className='text-xl ml-1.5 mt-0.5 font-bold text-black'>Aniga's Attire</p>
                            </div>

                            <button type="button" className="inline-flex p-1 text-black transition-all duration-200 border border-black lg:hidden focus:bg-gray-100 hover:bg-gray-100">
                                {/* Menu open: "hidden", Menu closed: "block" */}
                                <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>

                                {/* <!-- Menu open: "block", Menu closed: "hidden" --> */}
                                <svg className="hidden w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>

                            <div className="hidden ml-auto lg:flex lg:items-center lg:justify-center lg:space-x-10">
                                <a href="/" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"> Home </a>

                                <a href="/categories" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"> Categories </a>

                                <a href="/products" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"> Products </a>

                                <a href="#" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"> About Us </a>

                                <a href="#" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"> Contact Us </a>

                                <div className="w-px h-5 bg-black/20"></div>

                                <a href="/login" title="" className="text-base font-semibold text-black transition-all duration-200 hover:text-opacity-80"> Log in </a>

                                <a href="/categories" title="" className="inline-flex items-center justify-center px-5 py-2.5 text-base font-semibold text-black border-2 border-black hover:bg-black hover:text-white transition-all duration-200 focus:bg-black focus:text-white" role="button"> Browse Categories </a>
                            </div>
                        </div>
                    </div>
                </header>

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