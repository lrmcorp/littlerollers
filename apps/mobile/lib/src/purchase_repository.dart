import 'package:dailydose_api_client/dailydose_api_client.dart';

class PackageChoice {
  const PackageChoice({
    required this.id,
    required this.name,
    required this.priceRp,
  });
  final String id;
  final String name;
  final int priceRp;
}

enum ProofState { pending, clean, unsafe, error }

abstract interface class PurchaseRepository {
  Future<List<PackageChoice>> listPackages(String branchId);
  Future<String> issueProof({
    required String branchId,
    required String packageId,
    required String fileName,
    required String mimeType,
    required int sizeBytes,
    required String sha256,
  });
  Future<ProofState> finalizeProof(String id, String sha256, int sizeBytes);
  Future<void> submit(String packageId, String proofId, String idempotencyKey);
}

class ConfigurationRequiredPurchaseRepository implements PurchaseRepository {
  const ConfigurationRequiredPurchaseRepository();
  Never _fail() => throw StateError('CONFIGURATION_REQUIRED');
  @override
  Future<List<PackageChoice>> listPackages(String branchId) async => _fail();
  @override
  Future<String> issueProof({
    required String branchId,
    required String packageId,
    required String fileName,
    required String mimeType,
    required int sizeBytes,
    required String sha256,
  }) async => _fail();
  @override
  Future<ProofState> finalizeProof(
    String id,
    String sha256,
    int sizeBytes,
  ) async => _fail();
  @override
  Future<void> submit(
    String packageId,
    String proofId,
    String idempotencyKey,
  ) async => _fail();
}

class GeneratedPurchaseRepository implements PurchaseRepository {
  GeneratedPurchaseRepository(String baseUrl)
    : _api = Openapi(basePathOverride: '$baseUrl/api/v1').getPackagesApi();
  final PackagesApi _api;
  @override
  Future<List<PackageChoice>> listPackages(String branchId) async {
    final items = (await _api.listPackages(branchId: branchId)).data!.items;
    return items
        .map((p) => PackageChoice(id: p.id, name: p.name, priceRp: p.priceRp))
        .toList();
  }

  @override
  Future<String> issueProof({
    required String branchId,
    required String packageId,
    required String fileName,
    required String mimeType,
    required int sizeBytes,
    required String sha256,
  }) async {
    final request = CreatePaymentProofUploadRequest((b) {
      b.branchId = branchId;
      b.packageId = packageId;
      b.fileName = fileName;
      b.mimeType = mimeType;
      b.sizeBytes = sizeBytes;
      b.sha256 = sha256;
    });
    final r = await _api.createPaymentProofUpload(
      createPaymentProofUploadRequest: request,
    );
    return r.data!.id;
  }

  @override
  Future<ProofState> finalizeProof(
    String id,
    String sha256,
    int sizeBytes,
  ) async {
    final command = FinalizeUploadCommand((b) {
      b.sha256 = sha256;
      b.sizeBytes = sizeBytes;
    });
    final r = await _api.finalizePaymentProofUpload(
      id: id,
      idempotencyKey: DateTime.now().microsecondsSinceEpoch.toString(),
      finalizeUploadCommand: command,
    );
    return switch (r.data!.scanStatus.name) {
      'CLEAN' => ProofState.clean,
      'REJECTED' || 'INFECTED' => ProofState.unsafe,
      'PENDING' => ProofState.pending,
      _ => ProofState.error,
    };
  }

  @override
  Future<void> submit(
    String packageId,
    String proofId,
    String idempotencyKey,
  ) async {
    final request = SubmitPurchaseRequest((b) {
      b.packageId = packageId;
      b.paymentProofUploadId = proofId;
    });
    await _api.submitPurchase(
      idempotencyKey: idempotencyKey,
      submitPurchaseRequest: request,
    );
  }
}
