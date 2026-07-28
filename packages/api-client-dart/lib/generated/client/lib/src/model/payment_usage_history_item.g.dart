// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_usage_history_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentUsageHistoryItemTypeEnum
_$paymentUsageHistoryItemTypeEnum_PURCHASE =
    const PaymentUsageHistoryItemTypeEnum._('PURCHASE');
const PaymentUsageHistoryItemTypeEnum _$paymentUsageHistoryItemTypeEnum_ATTEND =
    const PaymentUsageHistoryItemTypeEnum._('ATTEND');
const PaymentUsageHistoryItemTypeEnum
_$paymentUsageHistoryItemTypeEnum_REVERSAL =
    const PaymentUsageHistoryItemTypeEnum._('REVERSAL');
const PaymentUsageHistoryItemTypeEnum
_$paymentUsageHistoryItemTypeEnum_ADJUST_MANUAL =
    const PaymentUsageHistoryItemTypeEnum._('ADJUST_MANUAL');
const PaymentUsageHistoryItemTypeEnum
_$paymentUsageHistoryItemTypeEnum_MIGRATION_OPENING =
    const PaymentUsageHistoryItemTypeEnum._('MIGRATION_OPENING');

PaymentUsageHistoryItemTypeEnum _$paymentUsageHistoryItemTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PURCHASE':
      return _$paymentUsageHistoryItemTypeEnum_PURCHASE;
    case 'ATTEND':
      return _$paymentUsageHistoryItemTypeEnum_ATTEND;
    case 'REVERSAL':
      return _$paymentUsageHistoryItemTypeEnum_REVERSAL;
    case 'ADJUST_MANUAL':
      return _$paymentUsageHistoryItemTypeEnum_ADJUST_MANUAL;
    case 'MIGRATION_OPENING':
      return _$paymentUsageHistoryItemTypeEnum_MIGRATION_OPENING;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentUsageHistoryItemTypeEnum>
_$paymentUsageHistoryItemTypeEnumValues =
    BuiltSet<PaymentUsageHistoryItemTypeEnum>(
      const <PaymentUsageHistoryItemTypeEnum>[
        _$paymentUsageHistoryItemTypeEnum_PURCHASE,
        _$paymentUsageHistoryItemTypeEnum_ATTEND,
        _$paymentUsageHistoryItemTypeEnum_REVERSAL,
        _$paymentUsageHistoryItemTypeEnum_ADJUST_MANUAL,
        _$paymentUsageHistoryItemTypeEnum_MIGRATION_OPENING,
      ],
    );

Serializer<PaymentUsageHistoryItemTypeEnum>
_$paymentUsageHistoryItemTypeEnumSerializer =
    _$PaymentUsageHistoryItemTypeEnumSerializer();

class _$PaymentUsageHistoryItemTypeEnumSerializer
    implements PrimitiveSerializer<PaymentUsageHistoryItemTypeEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentUsageHistoryItemTypeEnum];
  @override
  final String wireName = 'PaymentUsageHistoryItemTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentUsageHistoryItemTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentUsageHistoryItemTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentUsageHistoryItemTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentUsageHistoryItem extends PaymentUsageHistoryItem {
  @override
  final String id;
  @override
  final PaymentUsageHistoryItemTypeEnum type;
  @override
  final String label;
  @override
  final int quantity;
  @override
  final int balanceAfter;
  @override
  final DateTime occurredAt;
  @override
  final String referenceType;
  @override
  final String referenceId;

  factory _$PaymentUsageHistoryItem([
    void Function(PaymentUsageHistoryItemBuilder)? updates,
  ]) => (PaymentUsageHistoryItemBuilder()..update(updates))._build();

  _$PaymentUsageHistoryItem._({
    required this.id,
    required this.type,
    required this.label,
    required this.quantity,
    required this.balanceAfter,
    required this.occurredAt,
    required this.referenceType,
    required this.referenceId,
  }) : super._();
  @override
  PaymentUsageHistoryItem rebuild(
    void Function(PaymentUsageHistoryItemBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentUsageHistoryItemBuilder toBuilder() =>
      PaymentUsageHistoryItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentUsageHistoryItem &&
        id == other.id &&
        type == other.type &&
        label == other.label &&
        quantity == other.quantity &&
        balanceAfter == other.balanceAfter &&
        occurredAt == other.occurredAt &&
        referenceType == other.referenceType &&
        referenceId == other.referenceId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, balanceAfter.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jc(_$hash, referenceType.hashCode);
    _$hash = $jc(_$hash, referenceId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentUsageHistoryItem')
          ..add('id', id)
          ..add('type', type)
          ..add('label', label)
          ..add('quantity', quantity)
          ..add('balanceAfter', balanceAfter)
          ..add('occurredAt', occurredAt)
          ..add('referenceType', referenceType)
          ..add('referenceId', referenceId))
        .toString();
  }
}

class PaymentUsageHistoryItemBuilder
    implements
        Builder<PaymentUsageHistoryItem, PaymentUsageHistoryItemBuilder> {
  _$PaymentUsageHistoryItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  PaymentUsageHistoryItemTypeEnum? _type;
  PaymentUsageHistoryItemTypeEnum? get type => _$this._type;
  set type(PaymentUsageHistoryItemTypeEnum? type) => _$this._type = type;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  int? _balanceAfter;
  int? get balanceAfter => _$this._balanceAfter;
  set balanceAfter(int? balanceAfter) => _$this._balanceAfter = balanceAfter;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  String? _referenceType;
  String? get referenceType => _$this._referenceType;
  set referenceType(String? referenceType) =>
      _$this._referenceType = referenceType;

  String? _referenceId;
  String? get referenceId => _$this._referenceId;
  set referenceId(String? referenceId) => _$this._referenceId = referenceId;

  PaymentUsageHistoryItemBuilder() {
    PaymentUsageHistoryItem._defaults(this);
  }

  PaymentUsageHistoryItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _type = $v.type;
      _label = $v.label;
      _quantity = $v.quantity;
      _balanceAfter = $v.balanceAfter;
      _occurredAt = $v.occurredAt;
      _referenceType = $v.referenceType;
      _referenceId = $v.referenceId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentUsageHistoryItem other) {
    _$v = other as _$PaymentUsageHistoryItem;
  }

  @override
  void update(void Function(PaymentUsageHistoryItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentUsageHistoryItem build() => _build();

  _$PaymentUsageHistoryItem _build() {
    final _$result =
        _$v ??
        _$PaymentUsageHistoryItem._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PaymentUsageHistoryItem',
            'id',
          ),
          type: BuiltValueNullFieldError.checkNotNull(
            type,
            r'PaymentUsageHistoryItem',
            'type',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'PaymentUsageHistoryItem',
            'label',
          ),
          quantity: BuiltValueNullFieldError.checkNotNull(
            quantity,
            r'PaymentUsageHistoryItem',
            'quantity',
          ),
          balanceAfter: BuiltValueNullFieldError.checkNotNull(
            balanceAfter,
            r'PaymentUsageHistoryItem',
            'balanceAfter',
          ),
          occurredAt: BuiltValueNullFieldError.checkNotNull(
            occurredAt,
            r'PaymentUsageHistoryItem',
            'occurredAt',
          ),
          referenceType: BuiltValueNullFieldError.checkNotNull(
            referenceType,
            r'PaymentUsageHistoryItem',
            'referenceType',
          ),
          referenceId: BuiltValueNullFieldError.checkNotNull(
            referenceId,
            r'PaymentUsageHistoryItem',
            'referenceId',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
