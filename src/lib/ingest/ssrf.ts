import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { UnsafeUrlError } from "./errors";

/**
 * SSRF დაცვა: სკრაპერს არ უნდა შეეძლოს localhost-ის, შიდა ქსელის
 * ან cloud metadata endpoint-ების (169.254.169.254) გამოძახება.
 *
 * შენიშვნა: DNS-ს აქ და fetch-ის დროს ცალ-ცალკე ვხსნით, ამიტომ თეორიულად
 * შესაძლებელია DNS rebinding. პროდაქშენში გაუშვი სკრაპერი ქსელურად იზოლირებულ
 * გარემოში (egress ფილტრი) ან გამოიყენე გარე სერვისი (Firecrawl და მისთ.).
 */

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // CGNAT
    (a === 169 && b === 254) || // link-local / cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast / reserved
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (v.startsWith("::ffff:")) return true; // სხვა IPv4-mapped ფორმები: კონსერვატიულად ვბლოკავთ
  return /^f[cd]/.test(v) || /^fe[89ab]/.test(v) || v.startsWith("ff");
}

function isPrivateAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // უცნობი ფორმატი — დაბლოკე
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("არასწორი URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeUrlError("დაშვებულია მხოლოდ http/https");
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("URL-ში მომხმარებლის/პაროლის მითითება დაუშვებელია");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new UnsafeUrlError("დაშვებულია მხოლოდ სტანდარტული პორტები (80/443)");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new UnsafeUrlError("შიდა მისამართები დაუშვებელია");
  }

  let addresses: { address: string }[];
  if (isIP(host)) {
    addresses = [{ address: host }];
  } else {
    try {
      addresses = await lookup(host, { all: true, verbatim: true });
    } catch {
      throw new UnsafeUrlError("დომენის მისამართი ვერ მოიძებნა");
    }
  }

  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new UnsafeUrlError("შიდა ქსელის მისამართები დაუშვებელია");
  }

  return url;
}