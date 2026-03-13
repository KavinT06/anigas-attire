const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_URL}"]`);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

export const openRazorpayCheckout = async ({ onSuccess, onDismiss, ...config }) => {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Failed to load Razorpay checkout. Please try again.');
  }

  var options = {
    ...config,
    handler: (response) => {
      if (typeof onSuccess === 'function') {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: () => {
        if (typeof onDismiss === 'function') {
          onDismiss();
        }
      }
    }
  };

  options['image'] = "http://localhost:3000/_next/static/media/logo.ededee5d.jpg"
  options['name'] = "Aniga's Attire"
  options['theme'] = {
    color: "#FF6900"
  }
  options['callback_url'] = window.location.origin + "/api/verify-payment"

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};
