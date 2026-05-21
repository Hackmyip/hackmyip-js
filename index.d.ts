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

  type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'NS' | 'TXT' | 'SOA' | 'SRV' | 'CAA' | 'PTR';

  interface DnsRecord {
    name: string;
    type: number;
    TTL: number;
    data: string;
  }

  interface DnsData {
    domain: string;
    type: string;
    records: DnsRecord[];
    authority: DnsRecord[];
  }

  interface WhoisData {
    domain: string;
    registrar: string;
    creation_date: string | null;
    expiration_date: string | null;
    last_updated: string | null;
    name_servers: string[];
    status: string[];
    rdap_link: string | null;
  }

  interface ReverseDnsData {
    ip: string;
    hostname: string | null;
    ptr_record?: string;
    note?: string;
    error?: string;
  }

  interface BlacklistEntry {
    name: string;
    zone: string;
    desc: string;
    listed: boolean;
    response?: string | null;
    error?: string;
  }

  interface BlacklistData {
    ip: string;
    total_checked: number;
    listed_count: number;
    clean: boolean;
    status: 'CLEAN' | 'WARNING' | 'BLACKLISTED';
    results: BlacklistEntry[];
  }

  interface SiteStatusData {
    url: string;
    is_up: boolean;
    status_code: number;
    status_text: string;
    response_time_ms: number | null;
    server: string | null;
    content_type: string | null;
    powered_by: string | null;
    error?: string;
    checked_at: string;
  }

  interface BulkLookupEntry {
    ip: string;
    country?: string;
    city?: string;
    isp?: string;
    org?: string;
    lat?: number;
    lon?: number;
    error?: string;
  }

  interface BulkLookupData {
    total: number;
    results: BulkLookupEntry[];
  }

  export function getMyIP(): Promise<IPData>;
  export function lookup(ip: string): Promise<LookupData>;
  export function checkBreach(email: string): Promise<BreachData>;
  export function getPrivacyScore(): Promise<ScoreData>;
  export function dnsLookup(domain: string, type?: DnsRecordType): Promise<DnsData>;
  export function whois(domain: string): Promise<WhoisData>;
  export function reverseDns(ip: string): Promise<ReverseDnsData>;
  export function checkBlacklist(ip: string): Promise<BlacklistData>;
  export function checkSite(url: string): Promise<SiteStatusData>;
  export function bulkLookup(ips: string[]): Promise<BulkLookupData>;

  const hackmyip: {
    getMyIP: typeof getMyIP;
    lookup: typeof lookup;
    checkBreach: typeof checkBreach;
    getPrivacyScore: typeof getPrivacyScore;
    dnsLookup: typeof dnsLookup;
    whois: typeof whois;
    reverseDns: typeof reverseDns;
    checkBlacklist: typeof checkBlacklist;
    checkSite: typeof checkSite;
    bulkLookup: typeof bulkLookup;
  };
  export default hackmyip;
}
