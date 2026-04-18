import { baseApi } from "../../services/baseApi";

/* ================================
   TYPES (MATCH BACKEND STRICTLY)
================================ */
export type LandType =
  | "agricultural"
  | "residential"
  | "commercial"
  | "industrial";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface LandOwner {
  fullName: string;
  email: string;
  idNumber?: string;
  walletAddress: string;
}

export interface Land {
  id: number;
  ownerId: number;

  lrNumber: string;
  county: string;
  constituency: string;

  sizeInAcres: number;
  landType: LandType;

  verificationStatus: VerificationStatus;

  isForSale: boolean;
  priceInKsh?: number;

  ipfsDocHash?: string;
  blockchainTxHash?: string;
  blockNumber?: number;

  onChainId?: number;

  verifiedBy?: number;
  verifiedAt?: string;

  createdAt: string;
  updatedAt?: string;

  owner?: LandOwner;
}

/* ================================
   API RESPONSES
================================ */
interface LandsResponse {
  success: boolean;
  count: number;
  data: Land[];
}

interface SingleLandResponse {
  success: boolean;
  data: Land;
}

/* ================================
   REGISTER PAYLOAD
================================ */
export interface RegisterLandPayload {
  lrNumber: string;
  county: string;
  constituency: string;
  sizeInAcres: number;
  landType: LandType;
  document: File;
}

/* ================================
   API
================================ */
export const landApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ======================
       GET ALL LANDS
    ====================== */
    getLands: builder.query<Land[], void>({
      query: () => "/lands",

      transformResponse: (response: LandsResponse): Land[] =>
        response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Land" as const, id })),
              { type: "Land", id: "LIST" },
            ]
          : [{ type: "Land", id: "LIST" }],
    }),

    /* ======================
       GET BY LR NUMBER
    ====================== */
    getLandByLR: builder.query<Land, string>({
      query: (lrNumber) => `/lands/lr/${lrNumber}`,

      transformResponse: (response: SingleLandResponse): Land =>
        response.data,

      providesTags: (_result, _error, lrNumber) => [
        { type: "Land", id: lrNumber },
      ],
    }),

    /* ======================
       REGISTER LAND
    ====================== */
    registerLand: builder.mutation<
      { success: boolean; message: string; data: Land },
      RegisterLandPayload
    >({
      query: (data) => {
        const formData = new FormData();

        formData.append("lrNumber", data.lrNumber);
        formData.append("county", data.county);
        formData.append("constituency", data.constituency);
        formData.append("sizeInAcres", String(data.sizeInAcres));
        formData.append("landType", data.landType);
        formData.append("document", data.document);

        return {
          url: "/lands/register",
          method: "POST",
          body: formData,
        };
      },

      invalidatesTags: [{ type: "Land", id: "LIST" }],
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

      invalidatesTags: (_result, _error, id) => [
        { type: "Land", id },
        { type: "Land", id: "LIST" },
      ],
    }),
  }),
});

/* ================================
   HOOKS
================================ */
export const {
  useGetLandsQuery,
  useGetLandByLRQuery,
  useRegisterLandMutation,
  useVerifyLandMutation,
} = landApi;