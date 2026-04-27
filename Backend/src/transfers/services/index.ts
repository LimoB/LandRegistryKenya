// Backend/src/transfers/services/index.ts

// 1. Export everything from write and manage
export * from "./transfer.write.service";
export * from "./transfer.manage.service";

// 2. Explicitly export from query service to resolve the 'getPendingTransfersService' conflict
export { 
  getPendingTransfersService, 
  getTransferByIdService, 
  getSellerTransfersService 
} from "./transfer.query.service";