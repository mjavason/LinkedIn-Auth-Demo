interface LinkedInProfile {
  provider: string; // "linkedin"
  id: string; // e.g., "-U_sdfsRtuD"
  email: string; // e.g., "orjimichael2240@gmail.com"
  givenName: string; // e.g., "Michael"
  familyName: string; // e.g., "Orji"
  displayName: string; // e.g., "Michael Orji"
  picture: string; // URL to profile picture
  _raw: string; // Raw JSON string containing user data
  _json: {
    sub: string; // e.g., "-U_n9sdfsdD"
    email_verified: boolean; // Whether the email is verified
    name: string; // Full name
    locale: {
      country: string; // e.g., "US"
      language: string; // e.g., "en"
    };
    given_name: string; // e.g., "Michael"
    family_name: string; // e.g., "Orji"
    email: string; // e.g., "orjimichael2240@gmail.com"
    picture: string; // URL to profile picture
  };
}
