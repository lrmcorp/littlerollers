// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_period.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const BranchPeriodStatusEnum _$branchPeriodStatusEnum_OPEN =
    const BranchPeriodStatusEnum._('OPEN');
const BranchPeriodStatusEnum _$branchPeriodStatusEnum_CLOSING =
    const BranchPeriodStatusEnum._('CLOSING');
const BranchPeriodStatusEnum _$branchPeriodStatusEnum_CLOSED =
    const BranchPeriodStatusEnum._('CLOSED');

BranchPeriodStatusEnum _$branchPeriodStatusEnumValueOf(String name) {
  switch (name) {
    case 'OPEN':
      return _$branchPeriodStatusEnum_OPEN;
    case 'CLOSING':
      return _$branchPeriodStatusEnum_CLOSING;
    case 'CLOSED':
      return _$branchPeriodStatusEnum_CLOSED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<BranchPeriodStatusEnum> _$branchPeriodStatusEnumValues =
    BuiltSet<BranchPeriodStatusEnum>(const <BranchPeriodStatusEnum>[
      _$branchPeriodStatusEnum_OPEN,
      _$branchPeriodStatusEnum_CLOSING,
      _$branchPeriodStatusEnum_CLOSED,
    ]);

Serializer<BranchPeriodStatusEnum> _$branchPeriodStatusEnumSerializer =
    _$BranchPeriodStatusEnumSerializer();

class _$BranchPeriodStatusEnumSerializer
    implements PrimitiveSerializer<BranchPeriodStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'OPEN': 'OPEN',
    'CLOSING': 'CLOSING',
    'CLOSED': 'CLOSED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'OPEN': 'OPEN',
    'CLOSING': 'CLOSING',
    'CLOSED': 'CLOSED',
  };

  @override
  final Iterable<Type> types = const <Type>[BranchPeriodStatusEnum];
  @override
  final String wireName = 'BranchPeriodStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    BranchPeriodStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  BranchPeriodStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => BranchPeriodStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$BranchPeriod extends BranchPeriod {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String period;
  @override
  final BranchPeriodStatusEnum status;
  @override
  final String controlHash;
  @override
  final DateTime? closedAt;
  @override
  final int version;

  factory _$BranchPeriod([void Function(BranchPeriodBuilder)? updates]) =>
      (BranchPeriodBuilder()..update(updates))._build();

  _$BranchPeriod._({
    required this.id,
    required this.branchId,
    required this.period,
    required this.status,
    required this.controlHash,
    this.closedAt,
    required this.version,
  }) : super._();
  @override
  BranchPeriod rebuild(void Function(BranchPeriodBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BranchPeriodBuilder toBuilder() => BranchPeriodBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchPeriod &&
        id == other.id &&
        branchId == other.branchId &&
        period == other.period &&
        status == other.status &&
        controlHash == other.controlHash &&
        closedAt == other.closedAt &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, controlHash.hashCode);
    _$hash = $jc(_$hash, closedAt.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchPeriod')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('period', period)
          ..add('status', status)
          ..add('controlHash', controlHash)
          ..add('closedAt', closedAt)
          ..add('version', version))
        .toString();
  }
}

class BranchPeriodBuilder
    implements Builder<BranchPeriod, BranchPeriodBuilder> {
  _$BranchPeriod? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _period;
  String? get period => _$this._period;
  set period(String? period) => _$this._period = period;

  BranchPeriodStatusEnum? _status;
  BranchPeriodStatusEnum? get status => _$this._status;
  set status(BranchPeriodStatusEnum? status) => _$this._status = status;

  String? _controlHash;
  String? get controlHash => _$this._controlHash;
  set controlHash(String? controlHash) => _$this._controlHash = controlHash;

  DateTime? _closedAt;
  DateTime? get closedAt => _$this._closedAt;
  set closedAt(DateTime? closedAt) => _$this._closedAt = closedAt;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  BranchPeriodBuilder() {
    BranchPeriod._defaults(this);
  }

  BranchPeriodBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _period = $v.period;
      _status = $v.status;
      _controlHash = $v.controlHash;
      _closedAt = $v.closedAt;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchPeriod other) {
    _$v = other as _$BranchPeriod;
  }

  @override
  void update(void Function(BranchPeriodBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchPeriod build() => _build();

  _$BranchPeriod _build() {
    final _$result =
        _$v ??
        _$BranchPeriod._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'BranchPeriod', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'BranchPeriod',
            'branchId',
          ),
          period: BuiltValueNullFieldError.checkNotNull(
            period,
            r'BranchPeriod',
            'period',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'BranchPeriod',
            'status',
          ),
          controlHash: BuiltValueNullFieldError.checkNotNull(
            controlHash,
            r'BranchPeriod',
            'controlHash',
          ),
          closedAt: closedAt,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'BranchPeriod',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
