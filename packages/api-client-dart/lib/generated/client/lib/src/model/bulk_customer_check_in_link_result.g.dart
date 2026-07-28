// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bulk_customer_check_in_link_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BulkCustomerCheckInLinkResult extends BulkCustomerCheckInLinkResult {
  @override
  final String classSlotId;
  @override
  final BuiltList<BulkCustomerCheckInLinkItem> items;

  factory _$BulkCustomerCheckInLinkResult([
    void Function(BulkCustomerCheckInLinkResultBuilder)? updates,
  ]) => (BulkCustomerCheckInLinkResultBuilder()..update(updates))._build();

  _$BulkCustomerCheckInLinkResult._({
    required this.classSlotId,
    required this.items,
  }) : super._();
  @override
  BulkCustomerCheckInLinkResult rebuild(
    void Function(BulkCustomerCheckInLinkResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BulkCustomerCheckInLinkResultBuilder toBuilder() =>
      BulkCustomerCheckInLinkResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BulkCustomerCheckInLinkResult &&
        classSlotId == other.classSlotId &&
        items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classSlotId.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BulkCustomerCheckInLinkResult')
          ..add('classSlotId', classSlotId)
          ..add('items', items))
        .toString();
  }
}

class BulkCustomerCheckInLinkResultBuilder
    implements
        Builder<
          BulkCustomerCheckInLinkResult,
          BulkCustomerCheckInLinkResultBuilder
        > {
  _$BulkCustomerCheckInLinkResult? _$v;

  String? _classSlotId;
  String? get classSlotId => _$this._classSlotId;
  set classSlotId(String? classSlotId) => _$this._classSlotId = classSlotId;

  ListBuilder<BulkCustomerCheckInLinkItem>? _items;
  ListBuilder<BulkCustomerCheckInLinkItem> get items =>
      _$this._items ??= ListBuilder<BulkCustomerCheckInLinkItem>();
  set items(ListBuilder<BulkCustomerCheckInLinkItem>? items) =>
      _$this._items = items;

  BulkCustomerCheckInLinkResultBuilder() {
    BulkCustomerCheckInLinkResult._defaults(this);
  }

  BulkCustomerCheckInLinkResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classSlotId = $v.classSlotId;
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BulkCustomerCheckInLinkResult other) {
    _$v = other as _$BulkCustomerCheckInLinkResult;
  }

  @override
  void update(void Function(BulkCustomerCheckInLinkResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BulkCustomerCheckInLinkResult build() => _build();

  _$BulkCustomerCheckInLinkResult _build() {
    _$BulkCustomerCheckInLinkResult _$result;
    try {
      _$result =
          _$v ??
          _$BulkCustomerCheckInLinkResult._(
            classSlotId: BuiltValueNullFieldError.checkNotNull(
              classSlotId,
              r'BulkCustomerCheckInLinkResult',
              'classSlotId',
            ),
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BulkCustomerCheckInLinkResult',
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
