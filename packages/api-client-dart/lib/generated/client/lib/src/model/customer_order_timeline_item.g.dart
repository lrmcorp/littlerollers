// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_order_timeline_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_ORDER_CREATED =
    const CustomerOrderTimelineItemTypeEnum._('ORDER_CREATED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_PAYMENT_DEADLINE_SET =
    const CustomerOrderTimelineItemTypeEnum._('PAYMENT_DEADLINE_SET');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_PROOF_SUBMITTED =
    const CustomerOrderTimelineItemTypeEnum._('PROOF_SUBMITTED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_PROOF_SCAN_COMPLETED =
    const CustomerOrderTimelineItemTypeEnum._('PROOF_SCAN_COMPLETED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_ACTION_REQUIRED =
    const CustomerOrderTimelineItemTypeEnum._('ACTION_REQUIRED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_PAYMENT_APPROVED =
    const CustomerOrderTimelineItemTypeEnum._('PAYMENT_APPROVED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_PAYMENT_REJECTED =
    const CustomerOrderTimelineItemTypeEnum._('PAYMENT_REJECTED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_ORDER_EXPIRED =
    const CustomerOrderTimelineItemTypeEnum._('ORDER_EXPIRED');
const CustomerOrderTimelineItemTypeEnum
_$customerOrderTimelineItemTypeEnum_PACKAGE_ACTIVATED =
    const CustomerOrderTimelineItemTypeEnum._('PACKAGE_ACTIVATED');

CustomerOrderTimelineItemTypeEnum _$customerOrderTimelineItemTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ORDER_CREATED':
      return _$customerOrderTimelineItemTypeEnum_ORDER_CREATED;
    case 'PAYMENT_DEADLINE_SET':
      return _$customerOrderTimelineItemTypeEnum_PAYMENT_DEADLINE_SET;
    case 'PROOF_SUBMITTED':
      return _$customerOrderTimelineItemTypeEnum_PROOF_SUBMITTED;
    case 'PROOF_SCAN_COMPLETED':
      return _$customerOrderTimelineItemTypeEnum_PROOF_SCAN_COMPLETED;
    case 'ACTION_REQUIRED':
      return _$customerOrderTimelineItemTypeEnum_ACTION_REQUIRED;
    case 'PAYMENT_APPROVED':
      return _$customerOrderTimelineItemTypeEnum_PAYMENT_APPROVED;
    case 'PAYMENT_REJECTED':
      return _$customerOrderTimelineItemTypeEnum_PAYMENT_REJECTED;
    case 'ORDER_EXPIRED':
      return _$customerOrderTimelineItemTypeEnum_ORDER_EXPIRED;
    case 'PACKAGE_ACTIVATED':
      return _$customerOrderTimelineItemTypeEnum_PACKAGE_ACTIVATED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CustomerOrderTimelineItemTypeEnum>
_$customerOrderTimelineItemTypeEnumValues =
    BuiltSet<CustomerOrderTimelineItemTypeEnum>(
      const <CustomerOrderTimelineItemTypeEnum>[
        _$customerOrderTimelineItemTypeEnum_ORDER_CREATED,
        _$customerOrderTimelineItemTypeEnum_PAYMENT_DEADLINE_SET,
        _$customerOrderTimelineItemTypeEnum_PROOF_SUBMITTED,
        _$customerOrderTimelineItemTypeEnum_PROOF_SCAN_COMPLETED,
        _$customerOrderTimelineItemTypeEnum_ACTION_REQUIRED,
        _$customerOrderTimelineItemTypeEnum_PAYMENT_APPROVED,
        _$customerOrderTimelineItemTypeEnum_PAYMENT_REJECTED,
        _$customerOrderTimelineItemTypeEnum_ORDER_EXPIRED,
        _$customerOrderTimelineItemTypeEnum_PACKAGE_ACTIVATED,
      ],
    );

Serializer<CustomerOrderTimelineItemTypeEnum>
_$customerOrderTimelineItemTypeEnumSerializer =
    _$CustomerOrderTimelineItemTypeEnumSerializer();

class _$CustomerOrderTimelineItemTypeEnumSerializer
    implements PrimitiveSerializer<CustomerOrderTimelineItemTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ORDER_CREATED': 'ORDER_CREATED',
    'PAYMENT_DEADLINE_SET': 'PAYMENT_DEADLINE_SET',
    'PROOF_SUBMITTED': 'PROOF_SUBMITTED',
    'PROOF_SCAN_COMPLETED': 'PROOF_SCAN_COMPLETED',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'PAYMENT_APPROVED': 'PAYMENT_APPROVED',
    'PAYMENT_REJECTED': 'PAYMENT_REJECTED',
    'ORDER_EXPIRED': 'ORDER_EXPIRED',
    'PACKAGE_ACTIVATED': 'PACKAGE_ACTIVATED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ORDER_CREATED': 'ORDER_CREATED',
    'PAYMENT_DEADLINE_SET': 'PAYMENT_DEADLINE_SET',
    'PROOF_SUBMITTED': 'PROOF_SUBMITTED',
    'PROOF_SCAN_COMPLETED': 'PROOF_SCAN_COMPLETED',
    'ACTION_REQUIRED': 'ACTION_REQUIRED',
    'PAYMENT_APPROVED': 'PAYMENT_APPROVED',
    'PAYMENT_REJECTED': 'PAYMENT_REJECTED',
    'ORDER_EXPIRED': 'ORDER_EXPIRED',
    'PACKAGE_ACTIVATED': 'PACKAGE_ACTIVATED',
  };

  @override
  final Iterable<Type> types = const <Type>[CustomerOrderTimelineItemTypeEnum];
  @override
  final String wireName = 'CustomerOrderTimelineItemTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    CustomerOrderTimelineItemTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CustomerOrderTimelineItemTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CustomerOrderTimelineItemTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$CustomerOrderTimelineItem extends CustomerOrderTimelineItem {
  @override
  final String id;
  @override
  final CustomerOrderTimelineItemTypeEnum type;
  @override
  final String? reasonCode;
  @override
  final DateTime occurredAt;
  @override
  final bool derived;

  factory _$CustomerOrderTimelineItem([
    void Function(CustomerOrderTimelineItemBuilder)? updates,
  ]) => (CustomerOrderTimelineItemBuilder()..update(updates))._build();

  _$CustomerOrderTimelineItem._({
    required this.id,
    required this.type,
    this.reasonCode,
    required this.occurredAt,
    required this.derived,
  }) : super._();
  @override
  CustomerOrderTimelineItem rebuild(
    void Function(CustomerOrderTimelineItemBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CustomerOrderTimelineItemBuilder toBuilder() =>
      CustomerOrderTimelineItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerOrderTimelineItem &&
        id == other.id &&
        type == other.type &&
        reasonCode == other.reasonCode &&
        occurredAt == other.occurredAt &&
        derived == other.derived;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jc(_$hash, derived.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerOrderTimelineItem')
          ..add('id', id)
          ..add('type', type)
          ..add('reasonCode', reasonCode)
          ..add('occurredAt', occurredAt)
          ..add('derived', derived))
        .toString();
  }
}

class CustomerOrderTimelineItemBuilder
    implements
        Builder<CustomerOrderTimelineItem, CustomerOrderTimelineItemBuilder> {
  _$CustomerOrderTimelineItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  CustomerOrderTimelineItemTypeEnum? _type;
  CustomerOrderTimelineItemTypeEnum? get type => _$this._type;
  set type(CustomerOrderTimelineItemTypeEnum? type) => _$this._type = type;

  String? _reasonCode;
  String? get reasonCode => _$this._reasonCode;
  set reasonCode(String? reasonCode) => _$this._reasonCode = reasonCode;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  bool? _derived;
  bool? get derived => _$this._derived;
  set derived(bool? derived) => _$this._derived = derived;

  CustomerOrderTimelineItemBuilder() {
    CustomerOrderTimelineItem._defaults(this);
  }

  CustomerOrderTimelineItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _type = $v.type;
      _reasonCode = $v.reasonCode;
      _occurredAt = $v.occurredAt;
      _derived = $v.derived;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerOrderTimelineItem other) {
    _$v = other as _$CustomerOrderTimelineItem;
  }

  @override
  void update(void Function(CustomerOrderTimelineItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerOrderTimelineItem build() => _build();

  _$CustomerOrderTimelineItem _build() {
    final _$result =
        _$v ??
        _$CustomerOrderTimelineItem._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'CustomerOrderTimelineItem',
            'id',
          ),
          type: BuiltValueNullFieldError.checkNotNull(
            type,
            r'CustomerOrderTimelineItem',
            'type',
          ),
          reasonCode: reasonCode,
          occurredAt: BuiltValueNullFieldError.checkNotNull(
            occurredAt,
            r'CustomerOrderTimelineItem',
            'occurredAt',
          ),
          derived: BuiltValueNullFieldError.checkNotNull(
            derived,
            r'CustomerOrderTimelineItem',
            'derived',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
