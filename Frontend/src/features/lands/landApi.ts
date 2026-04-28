import { baseApi } from "../../services/baseApi";

/* ============================================================
   TYPES
============================================================ */
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
  priceInKsh?: string;
  ipfsDocHash?: string;
  ipfsLink?: string; // ✅ NEW (comes from backend response)
  blockchainTxHash?: string;
  blockNumber?: number;
  onChainId?: number;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
  owner?: LandOwner;
}

/* ============================================================
   API RESPONSES
============================================================ */
interface LandsResponse {
  success: boolean;
  count: number;
  data: Land[];
}

interface SingleLandResponse {
  success: boolean;
  data: Land;
}

interface MutationResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  ipfsLink?: string; // ✅ important for register response
}

/* ============================================================
   PAYLOADS
============================================================ */
export interface RegisterLandPayload {
  lrNumber: string;
  county: string;
  constituency: string;
  sizeInAcres: number;
  landType: LandType;
  document: File;
  priceInKsh?: number;
}

export interface ListForSalePayload {
  id: number;
  priceInKsh: number;
}

/* ============================================================
   HELPERS
============================================================ */
const normalizeLand = (land: Partial<Land>): Land => ({
  ...land,
  id: Number(land.id),
  ownerId: Number(land.ownerId),
  lrNumber: land.lrNumber || "",
  county: land.county || "",
  constituency: land.constituency || "",
  sizeInAcres: Number(land.sizeInAcres),
  landType: land.landType as LandType,
  verificationStatus: land.verificationStatus as VerificationStatus,
  isForSale: Boolean(land.isForSale),
  priceInKsh: land.priceInKsh ? String(land.priceInKsh) : undefined,
  ipfsDocHash: land.ipfsDocHash,
  ipfsLink: land.ipfsLink,
  blockchainTxHash: land.blockchainTxHash,
  blockNumber: land.blockNumber ? Number(land.blockNumber) : undefined,
  onChainId: land.onChainId ? Number(land.onChainId) : undefined,
  verifiedBy: land.verifiedBy,
  verifiedAt: land.verifiedAt,
  createdAt: land.createdAt || new Date().toISOString(),
  updatedAt: land.updatedAt,
  owner: land.owner,
});

/* ============================================================
   API SLICE
============================================================ */
export const landApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* --- GET ALL LANDS --- */
    getLands: builder.query<Land[], void>({
      query: () => "/lands",
      transformResponse: (res: LandsResponse) =>
        res.data.map(normalizeLand),
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({ type: "Land" as const, id: l.id })),
              { type: "Land", id: "LIST" }
            ]
          : [{ type: "Land", id: "LIST" }],
    }),

    /* --- GET MARKETPLACE LANDS --- */
    getMarketplaceLands: builder.query<Land[], void>({
      query: () => "/lands/marketplace",
      transformResponse: (res: LandsResponse) =>
        res.data.map(normalizeLand),
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({ type: "Land" as const, id: l.id })),
              { type: "Land", id: "MARKETPLACE" }
            ]
          : [{ type: "Land", id: "MARKETPLACE" }],
    }),

    /* --- GET MY LANDS --- */
    getMyLands: builder.query<Land[], void>({
      query: () => "/lands/my-lands",
      transformResponse: (res: LandsResponse) =>
        res.data.map(normalizeLand),
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({ type: "Land" as const, id: l.id })),
              { type: "Land", id: "MY_LIST" }
            ]
          : [{ type: "Land", id: "MY_LIST" }],
    }),

    /* --- GET LAND BY LR --- */
    getLandByLR: builder.query<Land, string>({
      query: (lrNumber) => `/lands/lr/${lrNumber}`,
      transformResponse: (res: SingleLandResponse) =>
        normalizeLand(res.data),
      providesTags: (_r, _e, lr) => [{ type: "Land", id: lr }],
    }),

    /* --- REGISTER LAND --- */
    registerLand: builder.mutation<
      MutationResponse<Land>,
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

        if (data.priceInKsh) {
          formData.append("priceInKsh", String(data.priceInKsh));
        }

        return {
          url: "/lands/register",
          method: "POST",
          body: formData,
        };
      },

      transformResponse: (res: MutationResponse<Land>) => {
        return {
          ...res,
          data: normalizeLand(res.data),
        };
      },

      invalidatesTags: [
        { type: "Land", id: "LIST" },
        { type: "Land", id: "MY_LIST" }
      ],
    }),

    /* --- VERIFY LAND --- */
    verifyLand: builder.mutation<MutationResponse<Land>, number>({
      query: (id) => ({
        url: `/lands/verify/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Land", id },
        { type: "Land", id: "LIST" },
        { type: "Land", id: "MY_LIST" },
        { type: "Land", id: "MARKETPLACE" }
      ],
    }),

    /* --- LIST LAND FOR SALE --- */
    listLandForSale: builder.mutation<
      MutationResponse<Land>,
      ListForSalePayload
    >({
      query: ({ id, priceInKsh }) => ({
        url: `/lands/${id}/list-for-sale`,
        method: "PATCH",
        body: { priceInKsh },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Land", id },
        { type: "Land", id: "LIST" },
        { type: "Land", id: "MY_LIST" },
        { type: "Land", id: "MARKETPLACE" }
      ],
    }),

    /* --- REMOVE FROM SALE --- */
    removeFromSale: builder.mutation<MutationResponse<Land>, number>({
      query: (id) => ({
        url: `/lands/${id}/remove-from-sale`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Land", id },
        { type: "Land", id: "LIST" },
        { type: "Land", id: "MY_LIST" },
        { type: "Land", id: "MARKETPLACE" }
      ],
    }),

  }),
});

/* ============================================================
   HOOKS
============================================================ */
export const {
  useGetLandsQuery,
  useGetMarketplaceLandsQuery,
  useGetMyLandsQuery,
  useGetLandByLRQuery,
  useRegisterLandMutation,
  useVerifyLandMutation,
  useListLandForSaleMutation,
  useRemoveFromSaleMutation
} = landApi;