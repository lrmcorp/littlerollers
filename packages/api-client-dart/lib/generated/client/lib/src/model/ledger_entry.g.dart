// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ledger_entry.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const LedgerEntryTypeEnum _$ledgerEntryTypeEnum_PURCHASE =
    const LedgerEntryTypeEnum._('PURCHASE');
const LedgerEntryTypeEnum _$ledgerEntryTypeEnum_ATTEND =
    const LedgerEntryTypeEnum._('ATTEND');
const LedgerEntryTypeEnum _$ledgerEntryTypeEnum_REVERSAL =
    const LedgerEntryTypeEnum._('REVERSAL');
const LedgerEntryTypeEnum _$ledgerEntryTypeEnum_ADJUST_MANUAL =
    const LedgerEntryTypeEnum._('ADJUST_MANUAL');
const LedgerEntryTypeEnum _$ledgerEntryTypeEnum_MIGRATION_OPENING =
    const LedgerEntryTypeEnum._('MIGRATION_OPENING');

LedgerEntryTypeEnum _$ledgerEntryTypeEnumValueOf(String name) {
  switch (name) {
    case 'PURCHASE':
      return _$ledgerEntryTypeEnum_PURCHASE;
    case 'ATTEND':
      return _$ledgerEntryTypeEnum_ATTEND;
    case 'REVERSAL':
      return _$ledgerEntryTypeEnum_REVERSAL;
    case 'ADJUST_MANUAL':
      return _$ledgerEntryTypeEnum_ADJUST_MANUAL;
    case 'MIGRATION_OPENING':
      return _$ledgerEntryTypeEnum_MIGRATION_OPENING;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<LedgerEntryTypeEnum> _$ledgerEntryTypeEnumValues =
    BuiltSet<LedgerEntryTypeEnum>(const <LedgerEntryTypeEnum>[
      _$ledgerEntryTypeEnum_PURCHASE,
      _$ledgerEntryTypeEnum_ATTEND,
      _$ledgerEntryTypeEnum_REVERSAL,
      _$ledgerEntryTypeEnum_ADJUST_MANUAL,
      _$ledgerEntryTypeEnum_MIGRATION_OPENING,
    ]);

Serializer<LedgerEntryTypeEnum> _$ledgerEntryTypeEnumSerializer =
    _$LedgerEntryTypeEnumSerializer();

class _$LedgerEntryTypeEnumSerializer
    implements PrimitiveSerializer<LedgerEntryTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PURCHASE': 'PURCHASE',
    'ATTEND': 'ATTEND',
    'REVERSAL': 'REVERSAL',
    'ADJUST_MANUAL': 'ADJUST_MANUAL',
    'MIGRATION_OPENING': 'MIGRATION_OPENING',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PURCHASE': 'PURCHASE',
    'ATTEND': 'ATTEND',
    'REVERSAL': 'REVERSAL',
    'ADJUST_MANUAL': 'ADJUST_MANUAL',
    'MIGRATION_OPENING': 'MIGRATION_OPENING',
  };

  @override
  final Iterable<Type> types = const <Type>[LedgerEntryTypeEnum];
  @override
  final String wireName = 'LedgerEntryTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    LedgerEntryTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  LedgerEntryTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => LedgerEntryTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$LedgerEntry extends LedgerEntry {
  @override
  final String id;
  @override
  final String customerPackageId;
  @override
  final LedgerEntryTypeEnum type;
  @override
  final int quantity;
  @override
  final String referenceType;
  @override
  final String referenceId;
  @override
  final String? referenceLabel;
  @override
  final String? bookingId;
  @override
  final int? balanceAfter;
  @override
  final String? reason;
  @override
  final DateTime occurredAt;

  factory _$LedgerEntry([void Function(LedgerEntryBuilder)? updates]) =>
      (LedgerEntryBuilder()..update(updates))._build();

  _$LedgerEntry._({
    required this.id,
    required this.customerPackageId,
    required this.type,
    required this.quantity,
    required this.referenceType,
    required this.referenceId,
    this.referenceLabel,
    this.bookingId,
    this.balanceAfter,
    this.reason,
    required this.occurredAt,
  }) : super._();
  @override
  LedgerEntry rebuild(void Function(LedgerEntryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LedgerEntryBuilder toBuilder() => LedgerEntryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LedgerEntry &&
        id == other.id &&
        customerPackageId == other.customerPackageId &&
        type == other.type &&
        quantity == other.quantity &&
        referenceType == other.referenceType &&
        referenceId == other.referenceId &&
        referenceLabel == other.referenceLabel &&
        bookingId == other.bookingId &&
        balanceAfter == other.balanceAfter &&
        reason == other.reason &&
        occurredAt == other.occurredAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, referenceType.hashCode);
    _$hash = $jc(_$hash, referenceId.hashCode);
    _$hash = $jc(_$hash, referenceLabel.hashCode);
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, balanceAfter.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LedgerEntry')
          ..add('id', id)
          ..add('customerPackageId', customerPackageId)
          ..add('type', type)
          ..add('quantity', quantity)
          ..add('referenceType', referenceType)
          ..add('referenceId', referenceId)
          ..add('referenceLabel', referenceLabel)
          ..add('bookingId', bookingId)
          ..add('balanceAfter', balanceAfter)
          ..add('reason', reason)
          ..add('occurredAt', occurredAt))
        .toString();
  }
}

class LedgerEntryBuilder implements Builder<LedgerEntry, LedgerEntryBuilder> {
  _$LedgerEntry? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  LedgerEntryTypeEnum? _type;
  LedgerEntryTypeEnum? get type => _$this._type;
  set type(LedgerEntryTypeEnum? type) => _$this._type = type;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  String? _referenceType;
  String? get referenceType => _$this._referenceType;
  set referenceType(String? referenceType) =>
      _$this._referenceType = referenceType;

  String? _referenceId;
  String? get referenceId => _$this._referenceId;
  set referenceId(String? referenceId) => _$this._referenceId = referenceId;

  String? _referenceLabel;
  String? get referenceLabel => _$this._referenceLabel;
  set referenceLabel(String? referenceLabel) =>
      _$this._referenceLabel = referenceLabel;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  int? _balanceAfter;
  int? get balanceAfter => _$this._balanceAfter;
  set balanceAfter(int? balanceAfter) => _$this._balanceAfter = balanceAfter;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  LedgerEntryBuilder() {
    LedgerEntry._defaults(this);
  }

  LedgerEntryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _customerPackageId = $v.customerPackageId;
      _type = $v.type;
      _quantity = $v.quantity;
      _referenceType = $v.referenceType;
      _referenceId = $v.referenceId;
      _referenceLabel = $v.referenceLabel;
      _bookingId = $v.bookingId;
      _balanceAfter = $v.balanceAfter;
      _reason = $v.reason;
      _occurredAt = $v.occurredAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LedgerEntry other) {
    _$v = other as _$LedgerEntry;
  }

  @override
  void update(void Function(LedgerEntryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LedgerEntry build() => _build();

  _$LedgerEntry _build() {
    final _$result =
        _$v ??
        _$LedgerEntry._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'LedgerEntry', 'id'),
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'LedgerEntry',
            'customerPackageId',
          ),
          type: BuiltValueNullFieldError.checkNotNull(
            type,
            r'LedgerEntry',
            'type',
          ),
          quantity: BuiltValueNullFieldError.checkNotNull(
            quantity,
            r'LedgerEntry',
            'quantity',
          ),
          referenceType: BuiltValueNullFieldError.checkNotNull(
            referenceType,
            r'LedgerEntry',
            'referenceType',
          ),
          referenceId: BuiltValueNullFieldError.checkNotNull(
            referenceId,
            r'LedgerEntry',
            'referenceId',
          ),
          referenceLabel: referenceLabel,
          bookingId: bookingId,
          balanceAfter: balanceAfter,
          reason: reason,
          occurredAt: BuiltValueNullFieldError.checkNotNull(
            occurredAt,
            r'LedgerEntry',
            'occurredAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
