import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for PackagesApi
void main() {
  final instance = Openapi().getPackagesApi();

  group(PackagesApi, () {
    //Future<ApprovalResult> approvePurchase(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test approvePurchase', () async {
      // TODO
    });

    //Future<DownloadAuthorization> authorizePaymentProofDownload(String id) async
    test('test authorizePaymentProofDownload', () async {
      // TODO
    });

    //Future<Resource> createPackage(PackageCommand packageCommand) async
    test('test createPackage', () async {
      // TODO
    });

    //Future<Resource> createPaymentProofUpload(CreatePaymentProofUploadRequest createPaymentProofUploadRequest) async
    test('test createPaymentProofUpload', () async {
      // TODO
    });

    //Future<PaymentProof> finalizePaymentProofUpload(String id, String idempotencyKey, FinalizeUploadCommand finalizeUploadCommand) async
    test('test finalizePaymentProofUpload', () async {
      // TODO
    });

    //Future<PaymentProof> getPaymentProofStatus(String id) async
    test('test getPaymentProofStatus', () async {
      // TODO
    });

    //Future<Page> listPackages({ String branchId, String cursor }) async
    test('test listPackages', () async {
      // TODO
    });

    //Future<Page> listPurchases({ String branchId, String cursor, String status }) async
    test('test listPurchases', () async {
      // TODO
    });

    //Future<Purchase> rejectPurchase(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
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

  });
}
