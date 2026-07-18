// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'correction.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const CorrectionStatusEnum _$correctionStatusEnum_PENDING =
    const CorrectionStatusEnum._('PENDING');
const CorrectionStatusEnum _$correctionStatusEnum_APPROVED =
    const CorrectionStatusEnum._('APPROVED');
const CorrectionStatusEnum _$correctionStatusEnum_POSTED =
    const CorrectionStatusEnum._('POSTED');
const CorrectionStatusEnum _$correctionStatusEnum_REJECTED =
    const CorrectionStatusEnum._('REJECTED');

CorrectionStatusEnum _$correctionStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$correctionStatusEnum_PENDING;
    case 'APPROVED':
      return _$correctionStatusEnum_APPROVED;
    case 'POSTED':
      return _$correctionStatusEnum_POSTED;
    case 'REJECTED':
      return _$correctionStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<CorrectionStatusEnum> _$correctionStatusEnumValues =
    BuiltSet<CorrectionStatusEnum>(const <CorrectionStatusEnum>[
      _$correctionStatusEnum_PENDING,
      _$correctionStatusEnum_APPROVED,
      _$correctionStatusEnum_POSTED,
      _$correctionStatusEnum_REJECTED,
    ]);

Serializer<CorrectionStatusEnum> _$correctionStatusEnumSerializer =
    _$CorrectionStatusEnumSerializer();

class _$CorrectionStatusEnumSerializer
    implements PrimitiveSerializer<CorrectionStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'POSTED': 'POSTED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'POSTED': 'POSTED',
    'REJECTED': 'REJECTED',
  };

  @override
  final Iterable<Type> types = const <Type>[CorrectionStatusEnum];
  @override
  final String wireName = 'CorrectionStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    CorrectionStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  CorrectionStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => CorrectionStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Correction extends Correction {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String currentPeriod;
  @override
  final String referencePeriod;
  @override
  final Money amount;
  @override
  final String reason;
  @override
  final String requestedBy;
  @override
  final String? decidedBy;
  @override
  final CorrectionStatusEnum status;
  @override
  final int version;

  factory _$Correction([void Function(CorrectionBuilder)? updates]) =>
      (CorrectionBuilder()..update(updates))._build();

  _$Correction._({
    required this.id,
    required this.branchId,
    required this.currentPeriod,
    required this.referencePeriod,
    required this.amount,
    required this.reason,
    required this.requestedBy,
    this.decidedBy,
    required this.status,
    required this.version,
  }) : super._();
  @override
  Correction rebuild(void Function(CorrectionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CorrectionBuilder toBuilder() => CorrectionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Correction &&
        id == other.id &&
        branchId == other.branchId &&
        currentPeriod == other.currentPeriod &&
        referencePeriod == other.referencePeriod &&
        amount == other.amount &&
        reason == other.reason &&
        requestedBy == other.requestedBy &&
        decidedBy == other.decidedBy &&
        status == other.status &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, currentPeriod.hashCode);
    _$hash = $jc(_$hash, referencePeriod.hashCode);
    _$hash = $jc(_$hash, amount.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, requestedBy.hashCode);
    _$hash = $jc(_$hash, decidedBy.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Correction')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('currentPeriod', currentPeriod)
          ..add('referencePeriod', referencePeriod)
          ..add('amount', amount)
          ..add('reason', reason)
          ..add('requestedBy', requestedBy)
          ..add('decidedBy', decidedBy)
          ..add('status', status)
          ..add('version', version))
        .toString();
  }
}

class CorrectionBuilder implements Builder<Correction, CorrectionBuilder> {
  _$Correction? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _currentPeriod;
  String? get currentPeriod => _$this._currentPeriod;
  set currentPeriod(String? currentPeriod) =>
      _$this._currentPeriod = currentPeriod;

  String? _referencePeriod;
  String? get referencePeriod => _$this._referencePeriod;
  set referencePeriod(String? referencePeriod) =>
      _$this._referencePeriod = referencePeriod;

  MoneyBuilder? _amount;
  MoneyBuilder get amount => _$this._amount ??= MoneyBuilder();
  set amount(MoneyBuilder? amount) => _$this._amount = amount;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  String? _requestedBy;
  String? get requestedBy => _$this._requestedBy;
  set requestedBy(String? requestedBy) => _$this._requestedBy = requestedBy;

  String? _decidedBy;
  String? get decidedBy => _$this._decidedBy;
  set decidedBy(String? decidedBy) => _$this._decidedBy = decidedBy;

  CorrectionStatusEnum? _status;
  CorrectionStatusEnum? get status => _$this._status;
  set status(CorrectionStatusEnum? status) => _$this._status = status;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  CorrectionBuilder() {
    Correction._defaults(this);
  }

  CorrectionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _currentPeriod = $v.currentPeriod;
      _referencePeriod = $v.referencePeriod;
      _amount = $v.amount.toBuilder();
      _reason = $v.reason;
      _requestedBy = $v.requestedBy;
      _decidedBy = $v.decidedBy;
      _status = $v.status;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Correction other) {
    _$v = other as _$Correction;
  }

  @override
  void update(void Function(CorrectionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Correction build() => _build();

  _$Correction _build() {
    _$Correction _$result;
    try {
      _$result =
          _$v ??
          _$Correction._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Correction', 'id'),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'Correction',
              'branchId',
            ),
            currentPeriod: BuiltValueNullFieldError.checkNotNull(
              currentPeriod,
              r'Correction',
              'currentPeriod',
            ),
            referencePeriod: BuiltValueNullFieldError.checkNotNull(
              referencePeriod,
              r'Correction',
              'referencePeriod',
            ),
            amount: amount.build(),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'Correction',
              'reason',
            ),
            requestedBy: BuiltValueNullFieldError.checkNotNull(
              requestedBy,
              r'Correction',
              'requestedBy',
            ),
            decidedBy: decidedBy,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'Correction',
              'status',
            ),
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'Correction',
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
          r'Correction',
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
