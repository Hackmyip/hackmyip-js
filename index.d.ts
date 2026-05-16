declare module 'hackmyip' {
  interface Location {
    city: string;
    region: string;
    country: string;
    continent: string;
    latitude: string | number | null;
    longitude: string | number | null;
    timezone: string;
    postal_code: string;
  }

  interface Network {
    asn: number;
    isp: string;
    org?: string;
    connection_type?: string;
    tls_version?: string;
  }

  interface Privacy {
    type: 'residential' | 'vpn' | 'datacenter';
    score: number;
    grade: string;
    label?: string;
    flags?: string[];
    is_vpn: boolean;
    is_datacenter: boolean;
    is_residential: boolean;
    hosting?: boolean;
    proxy?: boolean;
    mobile?: boolean;
  }

  interface IPData {
    ip: string;
    location: Location;
    network: Network;
    privacy: Privacy;
    is_eu: boolean;
    ipv6: boolean;
  }

  interface LookupData {
    ip: string;
    location: Location;
    network: Network;
    privacy?: {
      hosting?: boolean;
      proxy?: boolean;
      mobile?: boolean;
    };
  }

  interface RiskInfo {
    score: number;
    level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  }

  interface PasswordExposure {
    plain_text: number;
    weak_hash: number;
    strong_hash: number;
    unknown: number;
    total: number;
  }

  interface BreachData {
    email: string;
    breaches: number;
    services: string[];
    risk: RiskInfo;
    passwords: PasswordExposure | null;
  }

  interface ScoreData {
    ip: string;
    location: { city: string; country: string; timezone: string };
    network: { isp: string; asn: number; org?: string; tls_version?: string };
    privacy: Privacy;
    ipv6: boolean;
  }

  export function getMyIP(): Promise<IPData>;
  export function lookup(ip: string): Promise<LookupData>;
  export function checkBreach(email: string): Promise<BreachData>;
  export function getPrivacyScore(): Promise<ScoreData>;

  const hackmyip: {
    getMyIP: typeof getMyIP;
    lookup: typeof lookup;
    checkBreach: typeof checkBreach;
    getPrivacyScore: typeof getPrivacyScore;
  };
  export default hackmyip;
}
