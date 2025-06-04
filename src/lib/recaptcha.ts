export const RECAPTCHA_SITE_KEY = '6LeKsVQrAAAAAP-Ia2UKiz79auBIm8h7NxOMtllK';

export const verifyRecaptcha = async (token: string) => {
  try {
    const response = await fetch(`/api/verify-recaptcha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return false;
  }
};
