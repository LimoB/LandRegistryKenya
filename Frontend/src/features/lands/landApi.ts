import { baseApi } from "../../app/api/baseApi";

/* ================================
   TYPES
================================ */
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
  ipfsDocHash?: string; // This is the IPFS hash from the backend
  documentUrl?: string; // Add this so VerifyLands.tsx doesn't throw an error
  onChainId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterLandPayload {
  lrNumber: string;
  county: string;
  constituency: string;
  sizeInAcres: number;
  landType: "agricultural" | "residential" | "commercial" | "industrial";
  document: File; 
}

// FIX 1: Update this interface to accept 'status'
export interface VerifyLandPayload {
  onChainId?: number; // Optional since rejection might not have an ID yet
  status: "verified" | "rejected"; // Added this field
}

/* ================================
   LAND API
================================ */
export const landApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL LANDS
    getLands: builder.query<Land[], void>({
      query: () => "/lands",
      providesTags: ["Land"],
    }),

    // REGISTER LAND
    registerLand: builder.mutation<
      { message: string; land: Land; blockchainTx: string; ipfsLink: string },
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

    // VERIFY LAND
    verifyLand: builder.mutation<
      { message: string; updatedLand: Land },
      { id: number; payload: VerifyLandPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/lands/verify/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Land"],
    }),
  }),
});

export const {
  useGetLandsQuery,
  useRegisterLandMutation,
  useVerifyLandMutation,
} = landApi;