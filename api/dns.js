export default async function handler(req, res) {
  const upstream = "https://t1h4yt0a9c.cloudflare-gateway.com/dns-query"; // THAY LINK CỦA BẠN
  const ecsSubnet = "14.161.0.0"; // IP VNPT HCM

  try {
    // Tự dựng URL đầy đủ để tránh lỗi Invalid URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
    const dnsParam = fullUrl.searchParams.get('dns');

    // Trang chủ để kiểm tra
    if (req.method === 'GET' && !dnsParam) {
      return new Response("Vercel DNS Proxy is active!", { status: 200 });
    }

    const fetchUrl = dnsParam ? `${upstream}?dns=${dnsParam}` : upstream;
    
    const response = await fetch(fetchUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/dns-message',
        'X-Forwarded-For': ecsSubnet,
        ...(req.method === 'POST' && { 'Content-Type': 'application/dns-message' })
      },
      body: req.method === 'POST' ? await req.arrayBuffer() : null
    });

    const data = await response.arrayBuffer();
    return new Response(data, {
      headers: { 'Content-Type': 'application/dns-message' }
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}

export const config = {
  runtime: 'edge', // Bắt buộc dùng Edge Runtime để chạy nhanh nhất
};
