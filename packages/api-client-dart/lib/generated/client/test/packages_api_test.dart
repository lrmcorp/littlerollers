import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for PackagesApi
void main() {
  final instance = Openapi().getPackagesApi();

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

    //Future<DownloadAuthorization> authorizePaymentProofDownload(String id) async
    test('test authorizePaymentProofDownload', () async {
      // TODO
    });

    // Creates AWAITING_PAYMENT before transfer with commercial and destination-account snapshots.
    //
    //Future<Order> createOrder(String idempotencyKey, CreateOrderCommand createOrderCommand) async
    test('test createOrder', () async {
      // TODO
    });

    //Future<Resource> createPackage(PackageCommand packageCommand) async
    test('test createPackage', () async {
      // TODO
    });

    // Issues an opaque private upload reference after metadata, order ownership and expiry validation.
    //
    //Future<PaymentProofUploadInstruction> createPaymentProofUpload(CreatePaymentProofUploadRequest createPaymentProofUploadRequest) async
    test('test createPaymentProofUpload', () async {
      // TODO
    });

    //Future<PaymentProof> finalizePaymentProofUpload(String id, String idempotencyKey, FinalizeUploadCommand finalizeUploadCommand) async
    test('test finalizePaymentProofUpload', () async {
      // TODO
    });

    // Approved customer checkout snapshot with the full account number for the selected active package only.
    //
    //Future<CheckoutOptions> getCheckoutOptions(String packageId) async
    test('test getCheckoutOptions', () async {
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

    //Future<OrderPage> listOrders({ String status, String cursor }) async
    test('test listOrders', () async {
      // TODO
    });

    // Returns ACTIVE packages effective for the requested scoped branch. Commercial periods are half-open [effectiveFrom,effectiveUntil).
    //
    //Future<PackagePage> listPackages({ String branchId, String cursor }) async
    test('test listPackages', () async {
      // TODO
    });

    //Future<PurchasePage> listPurchases({ String branchId, String cursor, String status }) async
    test('test listPurchases', () async {
      // TODO
    });

    // Permission-gated rejection. Creates no customer package or ledger entry.
    //
    //Future<Purchase> rejectPurchase(String id, String idempotencyKey, ApprovePurchaseRequest approvePurchaseRequest) async
    test('test rejectPurchase', () async {
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

    // Moves actual bytes into private storage after ownership, size, checksum, extension and MIME-signature validation.
    //
    //Future<PaymentProof> uploadPaymentProofContent(String id, MultipartFile body) async
    test('test uploadPaymentProofContent', () async {
      // TODO
    });

  });
}
