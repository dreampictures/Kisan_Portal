import QRCode from "qrcode";

export async function generateQRCode(cardNumber: string, baseUrl: string): Promise<string> {
  const verifyUrl = `${baseUrl}/verify/${cardNumber}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 0,
    color: { dark: "#1a5c1a", light: "#ffffff" },
  });
  return qrDataUrl;
}

export async function generateQRCodeBuffer(cardNumber: string, baseUrl: string): Promise<Buffer> {
  const verifyUrl = `${baseUrl}/verify/${cardNumber}`;
  const buf = await QRCode.toBuffer(verifyUrl, {
    width: 300,
    margin: 0,
    color: { dark: "#1a5c1a", light: "#ffffff" },
  });
  return buf;
}
