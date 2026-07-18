// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'other_cost.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OtherCostStatusEnum _$otherCostStatusEnum_ACTIVE =
    const OtherCostStatusEnum._('ACTIVE');
const OtherCostStatusEnum _$otherCostStatusEnum_REVERSED =
    const OtherCostStatusEnum._('REVERSED');

OtherCostStatusEnum _$otherCostStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$otherCostStatusEnum_ACTIVE;
    case 'REVERSED':
      return _$otherCostStatusEnum_REVERSED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OtherCostStatusEnum> _$otherCostStatusEnumValues =
    BuiltSet<OtherCostStatusEnum>(const <OtherCostStatusEnum>[
      _$otherCostStatusEnum_ACTIVE,
      _$otherCostStatusEnum_REVERSED,
    ]);

Serializer<OtherCostStatusEnum> _$otherCostStatusEnumSerializer =
    _$OtherCostStatusEnumSerializer();

class _$OtherCostStatusEnumSerializer
    implements PrimitiveSerializer<OtherCostStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'REVERSED': 'REVERSED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'REVERSED': 'REVERSED',
  };

  @override
  final Iterable<Type> types = const <Type>[OtherCostStatusEnum];
  @override
  final String wireName = 'OtherCostStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    OtherCostStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OtherCostStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OtherCostStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$OtherCost extends OtherCost {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String period;
  @override
  final String description;
  @override
  final Money amount;
  @override
  final String? evidenceUploadId;
  @override
  final OtherCostStatusEnum status;
  @override
  final int version;

  factory _$OtherCost([void Function(OtherCostBuilder)? updates]) =>
      (OtherCostBuilder()..update(updates))._build();

  _$OtherCost._({
    required this.id,
    required this.branchId,
    required this.period,
    required this.description,
    required this.amount,
    this.evidenceUploadId,
    required this.status,
    required this.version,
  }) : super._();
  @override
  OtherCost rebuild(void Function(OtherCostBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OtherCostBuilder toBuilder() => OtherCostBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OtherCost &&
        id == other.id &&
        branchId == other.branchId &&
        period == other.period &&
        description == other.description &&
        amount == other.amount &&
        evidenceUploadId == other.evidenceUploadId &&
        status == other.status &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, amount.hashCode);
    _$hash = $jc(_$hash, evidenceUploadId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OtherCost')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('period', period)
          ..add('description', description)
          ..add('amount', amount)
          ..add('evidenceUploadId', evidenceUploadId)
          ..add('status', status)
          ..add('version', version))
        .toString();
  }
}

class OtherCostBuilder implements Builder<OtherCost, OtherCostBuilder> {
  _$OtherCost? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _period;
  String? get period => _$this._period;
  set period(String? period) => _$this._period = period;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  MoneyBuilder? _amount;
  MoneyBuilder get amount => _$this._amount ??= MoneyBuilder();
  set amount(MoneyBuilder? amount) => _$this._amount = amount;

  String? _evidenceUploadId;
  String? get evidenceUploadId => _$this._evidenceUploadId;
  set evidenceUploadId(String? evidenceUploadId) =>
      _$this._evidenceUploadId = evidenceUploadId;

  OtherCostStatusEnum? _status;
  OtherCostStatusEnum? get status => _$this._status;
  set status(OtherCostStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  OtherCostBuilder() {
    OtherCost._defaults(this);
  }

  OtherCostBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _period = $v.period;
      _description = $v.description;
      _amount = $v.amount.toBuilder();
      _evidenceUploadId = $v.evidenceUploadId;
      _status = $v.status;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OtherCost other) {
    _$v = other as _$OtherCost;
  }

  @override
  void update(void Function(OtherCostBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OtherCost build() => _build();

  _$OtherCost _build() {
    _$OtherCost _$result;
    try {
      _$result =
          _$v ??
          _$OtherCost._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'OtherCost', 'id'),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'OtherCost',
              'branchId',
            ),
            period: BuiltValueNullFieldError.checkNotNull(
              period,
              r'OtherCost',
              'period',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'OtherCost',
              'description',
            ),
            amount: amount.build(),
            evidenceUploadId: evidenceUploadId,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'OtherCost',
              'status',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'OtherCost',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'amount';
        amount.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'OtherCost',
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
