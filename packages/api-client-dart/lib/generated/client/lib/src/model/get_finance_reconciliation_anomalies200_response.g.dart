// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'get_finance_reconciliation_anomalies200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$GetFinanceReconciliationAnomalies200Response
    extends GetFinanceReconciliationAnomalies200Response {
  @override
  final DateTime generatedAt;
  @override
  final BuiltList<FinanceAnomaly> items;
  @override
  final int total;

  factory _$GetFinanceReconciliationAnomalies200Response([
    void Function(GetFinanceReconciliationAnomalies200ResponseBuilder)? updates,
  ]) => (GetFinanceReconciliationAnomalies200ResponseBuilder()..update(updates))
      ._build();

  _$GetFinanceReconciliationAnomalies200Response._({
    required this.generatedAt,
    required this.items,
    required this.total,
  }) : super._();
  @override
  GetFinanceReconciliationAnomalies200Response rebuild(
    void Function(GetFinanceReconciliationAnomalies200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  GetFinanceReconciliationAnomalies200ResponseBuilder toBuilder() =>
      GetFinanceReconciliationAnomalies200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is GetFinanceReconciliationAnomalies200Response &&
        generatedAt == other.generatedAt &&
        items == other.items &&
        total == other.total;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'GetFinanceReconciliationAnomalies200Response',
          )
          ..add('generatedAt', generatedAt)
          ..add('items', items)
          ..add('total', total))
        .toString();
  }
}

class GetFinanceReconciliationAnomalies200ResponseBuilder
    implements
        Builder<
          GetFinanceReconciliationAnomalies200Response,
          GetFinanceReconciliationAnomalies200ResponseBuilder
        > {
  _$GetFinanceReconciliationAnomalies200Response? _$v;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  ListBuilder<FinanceAnomaly>? _items;
  ListBuilder<FinanceAnomaly> get items =>
      _$this._items ??= ListBuilder<FinanceAnomaly>();
  set items(ListBuilder<FinanceAnomaly>? items) => _$this._items = items;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  GetFinanceReconciliationAnomalies200ResponseBuilder() {
    GetFinanceReconciliationAnomalies200Response._defaults(this);
  }

  GetFinanceReconciliationAnomalies200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _generatedAt = $v.generatedAt;
      _items = $v.items.toBuilder();
      _total = $v.total;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(GetFinanceReconciliationAnomalies200Response other) {
    _$v = other as _$GetFinanceReconciliationAnomalies200Response;
  }

  @override
  void update(
    void Function(GetFinanceReconciliationAnomalies200ResponseBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  GetFinanceReconciliationAnomalies200Response build() => _build();

  _$GetFinanceReconciliationAnomalies200Response _build() {
    _$GetFinanceReconciliationAnomalies200Response _$result;
    try {
      _$result =
          _$v ??
          _$GetFinanceReconciliationAnomalies200Response._(
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'GetFinanceReconciliationAnomalies200Response',
              'generatedAt',
            ),
            items: items.build(),
            total: BuiltValueNullFieldError.checkNotNull(
              total,
              r'GetFinanceReconciliationAnomalies200Response',
              'total',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'GetFinanceReconciliationAnomalies200Response',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
