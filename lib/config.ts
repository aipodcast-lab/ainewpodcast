export const config = {
  google: {
    clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL || 'aipodcast@splendid-sled-353619.iam.gserviceaccount.com',
    privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCRrgOtTyCBx4jj\n6QVS5/Tu2KJcFtmTuu7hzTIzsVV+IhLFS49VRM7gxNx3nXUw5c/1S8tML57/aEZI\n/BdOyGFFjZvHNSz04t5ZrI/nWDCQtXmqVAiVxwczWYeTiag3dOiZypCldlGflTpD\nLf1ss9Mk4PmM+ZQVdX4Wu0yPNI5y3yAjUFJtZZGNfNNsdNv59Ehwyfb0ozMcSfsb\noSrQOHXYKqjY9ujdyxeAB0wdlqAaoNsxr/2O56GrsBTr1/ZN10S4yfXR8gckNWfg\ntXtizpFnHIahCDa3xIP4B1tqq5MoqRxQX1JcK9T1LCkiWvNG8ClyZEeCsrVdG+Fe\nEzB+wC7jAgMBAAECggEABH3dtdLsvlOipYmiamNQf/9vR3Dvlch7uRE/QlduEAze\nO0sQc6FC0ldU3N3z+7qk5iacxrqT0m1/9/FzM9tQdHk18QxzWGbuUswpRl7Huzkn\n3oKSHobGcrozSJnun9cbnNz2shirJ5p4SL367wZptNy4P7UqRbHGXiO5lpNuQ526\n+xWY68tBKV1JO9GmwX0uzCKaQd1JXIJqFw44U3iZjudcuLLFyyAY+K6DKCpcmUGE\num9m2vYjftqt5Q3P3ByfAkwHlLcpPi7rj0L6LH/DAFdMpglyH/3H2UXDD/+XQx6M\ngjMzFg/Y4Ij3oqSEoDwB25E+KTWJcq5R82XsmtfM4QKBgQDIpYKk8+xoyUKOuzGb\nlN43TJEGQsttnoetKPCSYb6/AGs9V+GEtTcEBgD5w5dLwkEpjcbEV4uixujTkQa3\nmaz+E2NNGx5auLTY43wr20aVFcgvvfaYEgtm2D3paLEYZaYtwhbIXvwDaPcgtwK1\nm4yy/vzIc5a9c108L3w4qqjcOwKBgQC53oWhz8UNfeZSved0XNEcYG8y2kXWUyKD\neowv0vNgP8VhMT95ijqJHbCy+Rj+Pm34QVQ9j+rCt2afOWh7hmk53FZ1RIrKEG7a\nui26BB5jg/e6zbA3VsOxDNUklnY5Nv/wPA5EZxEKV1rD4wGCElmnUqm/cfdl8AYw\nEiRwbOnVeQKBgFiB0eBLjPQoG0j0wAw+HcvM5YgafLvNG1JB5eTcYxTD7YowstUk\nTrFiqJmEMsADX1UiKhS//WN/VILGzWy9yDaHfN0tYjVolrW5mzOJVVg8NIMCy70G\n8KqcJqtIOB5n8Gbs37nhVE94xNJUiEht5iGrIvyVKGBHfFApLiWc+kGzAoGAJRFZ\nuTGEbPJk0q+Iz04LbgtVYeDh+KJPycTQ3GDHpLRTGtUFgamtjtba/HZtI5czu0Tc\nFgLzoK2Oy8ZZLflaVu24WF65Bx9L3Fcw814K6XHSH/ERaZfmIxMaFtfi7/omBLUV\na1LatSNCuLo2/MfIFXSI4eNKoYvC0CduGPW/lJECgYEAmYGRZwuNNyXIEzq90zYY\ntRWWC61fg7WyF0E+ZyYmMWzk0Z0aosTeLrg6kf8gi0yg7JMMHxWSLOdymHag39nw\nLvYwIIUMnwiARzywi0pW3TtnG3ylcfQFrL31cKtLIWupfXDixv7paROwKa9ePdSb\nkLzx+W0GoE7HdxUqk2g4+e0=\n-----END PRIVATE KEY-----\n',
    projectId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID || 'splendid-sled-353619',
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY || 'AIzaSyD0CGqZBmm8uURfg42YdYP-9uYHI3S14LM'
  },
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyB_pgwWQkZ4OJT3S8RdXFg-zT7hGFGUbVY'
  }
} as const;

export function validateGoogleCredentials() {
  const { clientEmail, privateKey, projectId } = config.google;
  
  if (!clientEmail?.trim()) {
    throw new Error('Google Cloud client email not found');
  }
  
  if (!privateKey?.trim()) {
    throw new Error('Google Cloud private key not found');
  }

  if (!projectId?.trim()) {
    throw new Error('Google Cloud project ID not found');
  }
  
  // Format the private key as expected by Google Cloud
  const formattedPrivateKey = privateKey.includes('PRIVATE KEY')
    ? privateKey
    : `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
  
  return {
    clientEmail,
    privateKey: formattedPrivateKey,
    projectId
  };
}