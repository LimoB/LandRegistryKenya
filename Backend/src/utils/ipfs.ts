import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;

/**
 * Uploads a file buffer (e.g., from Multer) to IPFS via Pinata
 * @param fileBuffer The buffer of the file to upload
 * @param fileName The name to identify the file in Pinata
 * @returns The IPFS Hash (CID)
 */
export const uploadToIPFS = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials are missing in .env");
  }

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append("file", fileBuffer, { filename: fileName });

  // Optional: Add metadata to find it easily in Pinata Dashboard
  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      project: "KenyaLandRegistry",
      uploadedAt: new Date().toISOString(),
    },
  });
  data.append("pinataMetadata", metadata);

  try {
    const response = await axios.post(url, data, {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    // Returns the IPFS Hash (CID)
    return response.data.IpfsHash;
  } catch (error: any) {
    console.error("IPFS Upload Error:", error.response?.data || error.message);
    throw new Error("Failed to upload document to IPFS");
  }
};