/**
 * DNS-over-HTTPS (DoH) Client Resolver
 */
export class DohClient {
  /**
   * @param {string} [providerUrl='https://cloudflare-dns.com/dns-query'] - DoH Provider HTTPS endpoint
   */
  constructor(providerUrl = 'https://cloudflare-dns.com/dns-query') {
    this.providerUrl = providerUrl;
  }

  /**
   * Resolve a domain name
   *
   * @param {string} name - Domain name (e.g. 'example.com')
   * @param {string} [type='A'] - DNS Record Type (A, AAAA, MX, TXT, CNAME)
   * @returns {Promise<Array<Object>>} Resolves to list of answer objects: { name, type, TTL, data }
   */
  async resolve(name, type = 'A') {
    const url = `${this.providerUrl}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/dns-json'
      }
    });

    if (!response.ok) {
      throw new Error(`DoH query failed with HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (data.Status !== 0) {
      throw new Error(`DNS server returned error status code: ${data.Status}`);
    }

    return data.Answer || [];
  }
}
