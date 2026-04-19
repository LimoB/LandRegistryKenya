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
}

/* ============================================================
   REGISTER PAYLOAD
============================================================ */
export interface RegisterLandPayload {
  lrNumber: string;
  county: string;
  constituency: string;
  sizeInAcres: number;
  landType: LandType;
  document: File;
}

/* ============================================================
   LIST FOR SALE PAYLOAD
============================================================ */
export interface ListForSalePayload {
  id: number;
  priceInKsh: number;
}

/* ============================================================
   API SLICE
============================================================ */
export const landApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /* ============================================================
       GET ALL LANDS
    ============================================================ */
    getLands: builder.query<Land[], void>({
      query: () => "/lands",
      transformResponse: (res: LandsResponse) => res.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({ type: "Land" as const, id: l.id })),
              { type: "Land", id: "LIST" }
            ]
          : [{ type: "Land", id: "LIST" }],
    }),

/* ============================================================
   GET MARKETPLACE LANDS
============================================================ */
getMarketplaceLands: builder.query<Land[], void>({
  query: () => "/lands/marketplace",

  transformResponse: (res: LandsResponse) => res.data,

  providesTags: (result) =>
    result
      ? [
          ...result.map((l) => ({ type: "Land" as const, id: l.id })),
          { type: "Land", id: "MARKETPLACE" }
        ]
      : [{ type: "Land", id: "MARKETPLACE" }],
}),

    /* ============================================================
       GET LAND BY LR
    ============================================================ */
    getLandByLR: builder.query<Land, string>({
      query: (lrNumber) => `/lands/lr/${lrNumber}`,
      transformResponse: (res: SingleLandResponse) => res.data,
      providesTags: (_r, _e, lr) => [{ type: "Land", id: lr }],
    }),

/* ============================================================
   REGISTER LAND
============================================================ */
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

    return {
      url: "/lands/register",
      method: "POST",
      body: formData,
    };
  },

  invalidatesTags: [
    { type: "Land", id: "LIST" },
    { type: "Land", id: "MARKETPLACE" }
  ],
}),

    /* ============================================================
       VERIFY LAND
    ============================================================ */
    verifyLand: builder.mutation<MutationResponse<Land>, number>({
      query: (id) => ({
        url: `/lands/verify/${id}`,
        method: "PATCH",
      }),

      invalidatesTags: (_r, _e, id) => [
        { type: "Land", id },
        { type: "Land", id: "LIST" },
        { type: "Land", id: "MARKETPLACE" }
      ],
    }),

/* ============================================================
   LIST LAND FOR SALE
============================================================ */
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
    { type: "Land", id: "MARKETPLACE" }
  ],
}),

/* ============================================================
   REMOVE FROM SALE
============================================================ */
removeFromSale: builder.mutation<MutationResponse<Land>, number>({
  query: (id) => ({
    url: `/lands/${id}/remove-from-sale`,
    method: "PATCH",
  }),

  invalidatesTags: (_r, _e, id) => [
    { type: "Land", id },
    { type: "Land", id: "LIST" },
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
  useGetLandByLRQuery,
  useRegisterLandMutation,
  useVerifyLandMutation,
  useListLandForSaleMutation,
  useRemoveFromSaleMutation
} = landApi;