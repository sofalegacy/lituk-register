// DNS Configuration

var reg_none = NewRegistrar("none");
var provider = DnsProvider(NewDnsProvider("cloudflare"));
var proxy = {
  "on": { "cloudflare_proxy": "on" },
  "off": { "cloudflare_proxy": "off" }
}
var base = "lives-in-the.uk.";

// -- Functions -- //

function getDomains(filepath) {
	var files = glob.apply(null, [filepath, true, ".json"]);
	var domains = [];

	for (var i = 0; i < files.length; i++) {
        domains.push(require(files[i]));
	}
	return domains;
}

// -- -- //

var domains = getDomains("./domains");
var list = {};

for (var domain in domains) {
	var info = domains[domain];
    if (!list[base]) {
        list[base] = [];
    }

	// Proxy
	var proxied = proxy.on;
	if (info.proxied === false) {
		proxied = proxy.off;
	}

	// A Records
	if (info.record.A) {
		for (var i in info.record.A) {
			list[base].push(A(info.subdomain, IP(info.record.A[i]), proxied));
		}
	}

	// AAA Records
	if (info.record.AAA) {
		for (var i in info.record.AAA) {
			list[base].push(AAA(info.subdomain, info.record.AAA[i], proxied));
		}
	}

	// CNAME Records
	if (info.record.CNAME) {
		list[base].push(CNAME(info.subdomain, info.record.CNAME, proxied));
	}

	// MX Records
	if (info.record.MX) {
		for (var i in info.record.MX) {
			list[base].push(MX(info.subdomain, 10, info.record.MX[i]));
		}
	}

	// NS Records
	if (info.record.NS) {
		for (var i in info.record.NS) {
			list[base].push(NS(info.subdomain, info.record.NS[i]));
		}
	}

	// A Records
	if (info.record.TXT) {
		for (var i in info.record.TXT) {
            list[base].push(TXT(info.record.TXT[i][0] + ((info.subdomain == "@") ? '' : info.subdomain), info.record.TXT[i][1]));
		}
    }
}

for (var domain in list) {
	D(domain, reg_none, provider, list[domain]);
}
