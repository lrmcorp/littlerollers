import 'package:dailydose_api_client/dailydose_api_client.dart';

class CustomerPackageLedger {
  const CustomerPackageLedger({
    required this.id,
    required this.status,
    required this.total,
    required this.reserved,
    required this.available,
  });
  final String id;
  final String status;
  final int total;
  final int reserved;
  final int available;
}

class LedgerLine {
  const LedgerLine({required this.type, required this.quantity});
  final String type;
  final int quantity;
}

abstract interface class LedgerRepository {
  Future<List<CustomerPackageLedger>> list({String? branchId, String? cursor});
  Future<List<LedgerLine>> history(String id, {String? cursor});
}

class ConfigurationRequiredLedgerRepository implements LedgerRepository {
  const ConfigurationRequiredLedgerRepository();
  Never _fail() => throw StateError('CONFIGURATION_REQUIRED');
  @override
  Future<List<CustomerPackageLedger>> list({
    String? branchId,
    String? cursor,
  }) async => _fail();
  @override
  Future<List<LedgerLine>> history(String id, {String? cursor}) async =>
      _fail();
}

class GeneratedLedgerRepository implements LedgerRepository {
  GeneratedLedgerRepository(String baseUrl)
    : _api = Openapi(basePathOverride: '$baseUrl/api/v1').getLedgerApi();
  final LedgerApi _api;
  @override
  Future<List<CustomerPackageLedger>> list({
    String? branchId,
    String? cursor,
  }) async {
    final items = (await _api.listCustomerPackages(
      branchId: branchId,
      cursor: cursor,
    )).data!.items;
    return items
        .map(
          (item) => CustomerPackageLedger(
            id: item.id,
            status: item.status.name,
            total: item.ledgerBalance,
            reserved: item.reserved,
            available: item.available,
          ),
        )
        .toList();
  }

  @override
  Future<List<LedgerLine>> history(String id, {String? cursor}) async {
    final entries = (await _api.getPackageLedger(
      id: id,
      cursor: cursor,
    )).data!.entries;
    return entries
        .map(
          (entry) =>
              LedgerLine(type: entry.type.name, quantity: entry.quantity),
        )
        .toList();
  }
}
