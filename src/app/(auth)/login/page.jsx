"use client";
import { useState, useRef, useEffect } from "react";
import { PhoneIcon } from "@heroicons/react/24/outline";
import ReCAPTCHA from "react-google-recaptcha";
import Cookie from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../../assets/logo.jpg";
import { API_BASE_URL, AUTH_ENDPOINTS } from "../../../utils/apiConfig";

const Login = () => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const recaptchaRef = useRef(null);
  const inputRefs = useRef([]);

  const onRecaptchaError = () => {
    setErrorMessage("reCAPTCHA failed to load. Please refresh the page.");
  };

  useEffect(() => {
    if (step === 2) {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const getValidToken = async () => {
    try {
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("reCAPTCHA timeout")), 10000);
      });
      
      if (!recaptchaRef.current) {
        throw new Error("reCAPTCHA not initialized");
      }
      
      const tokenPromise = recaptchaRef.current.executeAsync();
      const token = await Promise.race([tokenPromise, timeoutPromise]);
      
      if (!token) {
        throw new Error("reCAPTCHA failed - no token received.");
      }
      
      setCaptchaToken(token);
      return token;
    } catch (error) {
      setErrorMessage("Captcha verification failed or timed out. Please try again.");
      setLoading(false);
      return null;
    }
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Reset reCAPTCHA before execution
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      
      // Small delay to ensure reCAPTCHA is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = await getValidToken();

      if (token) {
        await proceedToOTP(token);
      } else {
        setErrorMessage("Captcha verification failed. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToOTP = async (token) => {
    try {
      const phone_number = mobile;
      
      const requestBody = {
        phone_number,
        recaptcha_token: token,
      };
      
      const response = await fetch(AUTH_ENDPOINTS.sendOtp, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        setStep(2);
      } else {
        const errorData = await response.json();
        
        // Handle specific error messages from your backend
        if (errorData.recaptcha_token && Array.isArray(errorData.recaptcha_token)) {
          setErrorMessage(errorData.recaptcha_token[0]);
        } else if (errorData.phone_number && Array.isArray(errorData.phone_number)) {
          setErrorMessage(errorData.phone_number[0]);
        } else if (errorData.detail) {
          setErrorMessage(errorData.detail);
        } else if (errorData.message) {
          setErrorMessage(errorData.message);
        } else {
          setErrorMessage("Failed to send OTP. Please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Failed to connect to backend. Please check if backend is running on " + API_BASE_URL);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const OTPSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      recaptchaRef.current.reset();
      const token = await getValidToken();

      if (token) {
        await handleOtpSubmit(token);
      } else {
        setErrorMessage("Captcha verification failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (token) => {
    try {
      const phone_number = mobile;
      const otpString = otp.join("");

      if (otpString.length !== 4) {
        setErrorMessage("Please enter a valid 4-digit OTP.");
        setLoading(false);
        return;
      }
      
      const response = await fetch(AUTH_ENDPOINTS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number,
          otp: otpString,
          recaptcha_token: token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response formats from your backend
        if (data.access || data.access_token || data.token) {
          const accessToken = data.access || data.access_token || data.token;
          const refreshToken = data.refresh || data.refresh_token;
          
          Cookie.set("accessToken", accessToken, { expires: 1 / 24 });
          if (refreshToken) {
            Cookie.set("refreshToken", refreshToken, { expires: 7 });
          }
          
          // Store phone number for future use
          localStorage.setItem('userPhone', phone_number);
          
          // Dispatch custom event to notify header about auth change
          window.dispatchEvent(new Event('authChanged'));
        }
        
        // Check for redirect after login
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectPath;
        } else {
          window.location.href = "/";
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || errorData.message || errorData.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Failed to connect to backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const preventWheelChange = (e) => {
    e.target.blur();
  };

  return (
    <div className="min-h-screen w-full bg-orange-500/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.RECAPTCHA_SITE_KEY || "6Ldv-zMqAAAAAHvipf7LMgO92j_KK3mUm6xfvRdE"}
          size="invisible"
          onChange={setCaptchaToken}
          onError={onRecaptchaError}
        />

        {step === 1 ? (
          <div className="p-4 sm:p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-4">
                <Image
                  src={Logo}
                  alt="Logo"
                  className="mx-auto w-auto h-12 sm:h-16 rounded-lg"
                />
              </Link>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Welcome to Aniga&apos;s Attire
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Login with your phone number
              </p>
            </div>

            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setMobile(value);
                    }}
                    className="block w-full pl-10 pr-3 py-3.5 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Enter your mobile number"
                    required
                    pattern="\d*"
                    maxLength="10"
                    onWheel={preventWheelChange}
                  />
                </div>
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full bg-orange-500 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Get OTP"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 sm:p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block mb-8">
                <Image
                  src={Logo}
                  alt="Logo"
                  className="mx-auto w-auto h-12 sm:h-16 rounded-lg"
                />
              </Link>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Verify OTP
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Enter the code sent to {mobile}
              </p>
            </div>

            <form onSubmit={OTPSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onWheel={preventWheelChange}
                    className="w-14 h-14 text-center text-xl font-semibold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  />
                ))}
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600 text-center">
                  {errorMessage}
                </p>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.join("").length !== 4}
                  className="w-full bg-orange-500 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", ""]);
                    setErrorMessage("");
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3.5 px-4 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors text-sm"
                >
                  Go Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
