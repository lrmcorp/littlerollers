import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for PackagesApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getPackagesApi();

  group(PackagesApi, () {
    // Permission-gated atomic decision. Activation is the approval date in branch timezone; expiry is exclusive at the start of activationDate + durationDays.
    //
    //Future<ApprovalResult> approvePurchase(String id, String idempotencyKey, ApprovePurchaseRequest approvePurchaseRequest) async
    test('test approvePurchase', () async {
      // TODO
    });

    // Attaches a CLEAN finalized private upload and transitions the same order to PENDING.
    //
    //Future<Order> attachOrderPaymentProof(String id, AttachOrderProofCommand attachOrderProofCommand) async
    test('test attachOrderPaymentProof', () async {
      // TODO
    });

    // Issues a short-lived one-time authorization for the authenticated customer to view the CLEAN proof currently attached to their own order.
    //
    //Future<PaymentProofViewAuthorization> authorizeOwnOrderPaymentProofView(String id) async
    test('test authorizeOwnOrderPaymentProofView', () async {
      // TODO
    });

    //Future<PaymentProofViewAuthorization> authorizePaymentProofDownload(String id) async
    test('test authorizePaymentProofDownload', () async {
      // TODO
    });

    // Creates AWAITING_PAYMENT before transfer with commercial and destination-account snapshots.
    //
    //Future<Order> createOrder(String idempotencyKey, CreateOrderCommand createOrderCommand) async
    test('test createOrder', () async {
      // TODO
    });

    //Future<Package> createPackage(String idempotencyKey, PackageCommand packageCommand) async
    test('test createPackage', () async {
      // TODO
    });

    //Future<PackagePromotion> createPackagePromotion(String id, String idempotencyKey, PackagePromotionCommand packagePromotionCommand) async
    test('test createPackagePromotion', () async {
      // TODO
    });

    //Future<Package> createPackageRevision(String id, String idempotencyKey, PackageRevisionCommand packageRevisionCommand) async
    test('test createPackageRevision', () async {
      // TODO
    });

    // Issues an opaque private upload reference after metadata, order ownership and expiry validation.
    //
    //Future<PaymentProofUploadInstruction> createPaymentProofUpload(CreatePaymentProofUploadRequest createPaymentProofUploadRequest) async
    test('test createPaymentProofUpload', () async {
      // TODO
    });

    //Future<Voucher> createVoucher(String idempotencyKey, VoucherCommand voucherCommand) async
    test('test createVoucher', () async {
      // TODO
    });

    //Future<PaymentProof> finalizePaymentProofUpload(String id, String idempotencyKey, FinalizeUploadCommand finalizeUploadCommand) async
    test('test finalizePaymentProofUpload', () async {
      // TODO
    });

    // Approved customer checkout snapshot with the full account number for the selected active package only.
    //
    //Future<CheckoutOptions> getCheckoutOptions(String packageId, { String branchId }) async
    test('test getCheckoutOptions', () async {
      // TODO
    });

    //Future<InternalPackageDetail> getInternalPackageDetail(String id) async
    test('test getInternalPackageDetail', () async {
      // TODO
    });

    //Future<Order> getOrder(String id) async
    test('test getOrder', () async {
      // TODO
    });

    //Future<PaymentProof> getPaymentProofStatus(String id) async
    test('test getPaymentProofStatus', () async {
      // TODO
    });

    // Capability and branch-scoped reviewer detail with masked customer, private-proof metadata, authoritative balance, usage history, timeline, and persisted activation result.
    //
    //Future<PaymentReviewDetail> getPaymentReviewDetail(String id, { String usageCursor }) async
    test('test getPaymentReviewDetail', () async {
      // TODO
    });

    //Future<PublicPackageDetail> getPublicPackageDetail(String id) async
    test('test getPublicPackageDetail', () async {
      // TODO
    });

    //Future<Voucher> getVoucher(String id) async
    test('test getVoucher', () async {
      // TODO
    });

    //Future<OrderPage> listOrders({ String status, String cursor, String q, Date from, Date until, int limit }) async
    test('test listOrders', () async {
      // TODO
    });

    //Future<PackagePromotionOrderPage> listPackagePromotionOrders(String id, { String cursor }) async
    test('test listPackagePromotionOrders', () async {
      // TODO
    });

    //Future<PackagePromotionPage> listPackagePromotions(String id, { String cursor, int limit }) async
    test('test listPackagePromotions', () async {
      // TODO
    });

    // Customers receive only active/effective packages. Authorized staff can filter the complete effective history.
    //
    //Future<PackagePage> listPackages({ String branchId, String classTypeId, String q, String status, String effectiveState, Date from, Date until, String cursor }) async
    test('test listPackages', () async {
      // TODO
    });

    //Future<PublicPackageCatalog> listPublicPackages({ String branchId }) async
    test('test listPublicPackages', () async {
      // TODO
    });

    // Capability-scoped payment review queue. Omitted branchId means every authorized branch, including global scope for Super Owner and Finance.
    //
    //Future<PaymentReviewPage> listPurchases({ String branchId, String cursor, String status, int limit, String q, DateTime from, DateTime until, String purchaseId }) async
    test('test listPurchases', () async {
      // TODO
    });

    //Future<VoucherRedemptionPage> listVoucherRedemptions(String id, { String cursor }) async
    test('test listVoucherRedemptions', () async {
      // TODO
    });

    //Future<VoucherPage> listVouchers({ String q, String status, Date from, Date until, String branchId, String cursor }) async
    test('test listVouchers', () async {
      // TODO
    });

    //Future<VoucherPreview> previewCheckoutVoucher(VoucherPreviewCommand voucherPreviewCommand) async
    test('test previewCheckoutVoucher', () async {
      // TODO
    });

    // Permission-gated rejection. Creates no customer package or ledger entry.
    //
    //Future<Purchase> rejectPurchase(String id, String idempotencyKey, ApprovePurchaseRequest approvePurchaseRequest) async
    test('test rejectPurchase', () async {
      // TODO
    });

    // Replaces explicit Studio/Cabang and global class-type scopes without cloning the package identity.
    //
    //Future<Package> replacePackageScopes(String id, String idempotencyKey, PackageScopeCommand packageScopeCommand) async
    test('test replacePackageScopes', () async {
      // TODO
    });

    //Future<Resource> replacePurchasePaymentProof(String id, String idempotencyKey, ReplacePaymentProofCommand replacePaymentProofCommand) async
    test('test replacePurchasePaymentProof', () async {
      // TODO
    });

    //Future<Purchase> submitPurchase(String idempotencyKey, SubmitPurchaseRequest submitPurchaseRequest) async
    test('test submitPurchase', () async {
      // TODO
    });

    //Future<Package> transitionPackage(String id, String action, String idempotencyKey, ReasonedVersionCommand body) async
    test('test transitionPackage', () async {
      // TODO
    });

    //Future<PackagePromotion> transitionPackagePromotion(String id, String action, String idempotencyKey, ReasonedVersionCommand reasonedVersionCommand) async
    test('test transitionPackagePromotion', () async {
      // TODO
    });

    //Future<Voucher> transitionVoucher(String id, String action, String idempotencyKey, ReasonedVersionCommand reasonedVersionCommand) async
    test('test transitionVoucher', () async {
      // TODO
    });

    //Future<Package> updatePackage(String id, String idempotencyKey, PackageUpdateCommand packageUpdateCommand) async
    test('test updatePackage', () async {
      // TODO
    });

    //Future<PackagePromotion> updatePackagePromotion(String id, String idempotencyKey, PackagePromotionUpdateCommand packagePromotionUpdateCommand) async
    test('test updatePackagePromotion', () async {
      // TODO
    });

    //Future<Voucher> updateVoucher(String id, String idempotencyKey, VoucherUpdateCommand voucherUpdateCommand) async
    test('test updateVoucher', () async {
      // TODO
    });

    // Moves actual bytes into private storage after ownership, size, checksum, extension and MIME-signature validation.
    //
    //Future<PaymentProof> uploadPaymentProofContent(String id, MultipartFile body) async
    test('test uploadPaymentProofContent', () async {
      // TODO
    });

    // Consumes a one-time viewer-bound payment proof authorization issued for Finance review or customer self-view.
    //
    //Future<Uint8List> viewAuthorizedPaymentProofContent(String id) async
    test('test viewAuthorizedPaymentProofContent', () async {
      // TODO
    });

  });
}
