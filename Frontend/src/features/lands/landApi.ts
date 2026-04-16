import { baseApi } from "../../app/api/baseApi";

/* ================================
   TYPES (MATCH BACKEND)
================================ */
export interface LandOwner {
  fullName: string;
  email: string;
  walletAddress: string;
}

export interface Land {
  id: number;
  ownerId: number;

  lrNumber: string;
  county: string;
  constituency: string;

  sizeInAcres: number;
  landType: "agricultural" | "residential" | "commercial" | "industrial";

  verificationStatus: "pending" | "verified" | "rejected";

  isForSale: boolean;
  priceInKsh?: number;

  ipfsDocHash?: string;
  blockchainTxHash?: string;

  onChainId?: number;

  createdAt: string;
  updatedAt?: string;

  owner?: LandOwner;
}

/* ================================
   API RESPONSE WRAPPERS (BACKEND STYLE)
================================ */
interface LandsResponse {
  success: boolean;
  count: number;
  data: Land[];
}

interface SingleLandResponse {
  success: boolean;
  data: Land;
  error?: string;
}

interface RegisterLandResponse {
  success: boolean;
  message: string;
  data: Land;
  ipfsLink: string;
}

/* ================================
   REGISTER PAYLOAD
================================ */
export interface RegisterLandPayload {
  lrNumber: string;
  county: string;
  constituency: string;
  sizeInAcres: number;
  landType: Land["landType"];
  document: File;
}

/* ================================
   TYPE GUARDS (NO ANY)
================================ */
const isLandsResponse = (res: unknown): res is LandsResponse => {
  return (
    typeof res === "object" &&
    res !== null &&
    "data" in res &&
    Array.isArray((res as LandsResponse).data)
  );
};

const isSingleLandResponse = (res: unknown): res is SingleLandResponse => {
  return (
    typeof res === "object" &&
    res !== null &&
    "data" in res &&
    typeof (res as SingleLandResponse).data === "object"
  );
};

/* ================================
   LAND API
================================ */
export const landApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ======================
       GET ALL LANDS
    ====================== */
    getLands: builder.query<Land[], void>({
      query: () => "/lands",
      transformResponse: (response: unknown) => {
        if (isLandsResponse(response)) {
          return response.data;
        }
        return [];
      },
      providesTags: ["Land"],
    }),

    /* ======================
       GET LAND BY LR NUMBER
    ====================== */
    getLandByLR: builder.query<Land, string>({
      query: (lrNumber) => `/lands/lr/${lrNumber}`,
      transformResponse: (response: unknown) => {
        if (isSingleLandResponse(response)) {
          return response.data;
        }
        throw new Error("Invalid land response format");
      },
      providesTags: ["Land"],
    }),

    /* ======================
       REGISTER LAND
    ====================== */
    registerLand: builder.mutation<
      RegisterLandResponse,
      RegisterLandPayload
    >({
      query: (data) => {
        const formData = new FormData();

        formData.append("lrNumber", data.lrNumber);
        formData.append("county", data.county);
        formData.append("constituency", data.constituency);
        formData.append("sizeInAcres", data.sizeInAcres.toString());
        formData.append("landType", data.landType);
        formData.append("document", data.document);

        return {
          url: "/lands/register",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Land"],
    }),

    /* ======================
       VERIFY LAND (OFFICER)
    ====================== */
    verifyLand: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/lands/verify/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Land"],
    }),
  }),
});

export const {
  useGetLandsQuery,
  useGetLandByLRQuery,
  useRegisterLandMutation,
  useVerifyLandMutation,
} = landApi;