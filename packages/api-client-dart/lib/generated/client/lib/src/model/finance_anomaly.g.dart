// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_anomaly.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FinanceAnomalyCodeEnum _$financeAnomalyCodeEnum_APPROVED_WITHOUT_LEDGER =
    const FinanceAnomalyCodeEnum._('APPROVED_WITHOUT_LEDGER');
const FinanceAnomalyCodeEnum _$financeAnomalyCodeEnum_STALE_PENDING_PAYMENT =
    const FinanceAnomalyCodeEnum._('STALE_PENDING_PAYMENT');
const FinanceAnomalyCodeEnum _$financeAnomalyCodeEnum_PROOF_NOT_READY =
    const FinanceAnomalyCodeEnum._('PROOF_NOT_READY');

FinanceAnomalyCodeEnum _$financeAnomalyCodeEnumValueOf(String name) {
  switch (name) {
    case 'APPROVED_WITHOUT_LEDGER':
      return _$financeAnomalyCodeEnum_APPROVED_WITHOUT_LEDGER;
    case 'STALE_PENDING_PAYMENT':
      return _$financeAnomalyCodeEnum_STALE_PENDING_PAYMENT;
    case 'PROOF_NOT_READY':
      return _$financeAnomalyCodeEnum_PROOF_NOT_READY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FinanceAnomalyCodeEnum> _$financeAnomalyCodeEnumValues =
    BuiltSet<FinanceAnomalyCodeEnum>(const <FinanceAnomalyCodeEnum>[
      _$financeAnomalyCodeEnum_APPROVED_WITHOUT_LEDGER,
      _$financeAnomalyCodeEnum_STALE_PENDING_PAYMENT,
      _$financeAnomalyCodeEnum_PROOF_NOT_READY,
    ]);

const FinanceAnomalySeverityEnum _$financeAnomalySeverityEnum_WARNING =
    const FinanceAnomalySeverityEnum._('WARNING');
const FinanceAnomalySeverityEnum _$financeAnomalySeverityEnum_CRITICAL =
    const FinanceAnomalySeverityEnum._('CRITICAL');

FinanceAnomalySeverityEnum _$financeAnomalySeverityEnumValueOf(String name) {
  switch (name) {
    case 'WARNING':
      return _$financeAnomalySeverityEnum_WARNING;
    case 'CRITICAL':
      return _$financeAnomalySeverityEnum_CRITICAL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FinanceAnomalySeverityEnum> _$financeAnomalySeverityEnumValues =
    BuiltSet<FinanceAnomalySeverityEnum>(const <FinanceAnomalySeverityEnum>[
      _$financeAnomalySeverityEnum_WARNING,
      _$financeAnomalySeverityEnum_CRITICAL,
    ]);

Serializer<FinanceAnomalyCodeEnum> _$financeAnomalyCodeEnumSerializer =
    _$FinanceAnomalyCodeEnumSerializer();
Serializer<FinanceAnomalySeverityEnum> _$financeAnomalySeverityEnumSerializer =
    _$FinanceAnomalySeverityEnumSerializer();

class _$FinanceAnomalyCodeEnumSerializer
    implements PrimitiveSerializer<FinanceAnomalyCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'APPROVED_WITHOUT_LEDGER': 'APPROVED_WITHOUT_LEDGER',
    'STALE_PENDING_PAYMENT': 'STALE_PENDING_PAYMENT',
    'PROOF_NOT_READY': 'PROOF_NOT_READY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'APPROVED_WITHOUT_LEDGER': 'APPROVED_WITHOUT_LEDGER',
    'STALE_PENDING_PAYMENT': 'STALE_PENDING_PAYMENT',
    'PROOF_NOT_READY': 'PROOF_NOT_READY',
  };

  @override
  final Iterable<Type> types = const <Type>[FinanceAnomalyCodeEnum];
  @override
  final String wireName = 'FinanceAnomalyCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    FinanceAnomalyCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  FinanceAnomalyCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => FinanceAnomalyCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$FinanceAnomalySeverityEnumSerializer
    implements PrimitiveSerializer<FinanceAnomalySeverityEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'WARNING': 'WARNING',
    'CRITICAL': 'CRITICAL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'WARNING': 'WARNING',
    'CRITICAL': 'CRITICAL',
  };

  @override
  final Iterable<Type> types = const <Type>[FinanceAnomalySeverityEnum];
  @override
  final String wireName = 'FinanceAnomalySeverityEnum';

  @override
  Object serialize(
    Serializers serializers,
    FinanceAnomalySeverityEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  FinanceAnomalySeverityEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => FinanceAnomalySeverityEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$FinanceAnomaly extends FinanceAnomaly {
  @override
  final String purchaseId;
  @override
  final String branchId;
  @override
  final String branchCode;
  @override
  final int amountRp;
  @override
  final DateTime submittedAt;
  @override
  final FinanceAnomalyCodeEnum code;
  @override
  final FinanceAnomalySeverityEnum severity;
  @override
  final String href;

  factory _$FinanceAnomaly([void Function(FinanceAnomalyBuilder)? updates]) =>
      (FinanceAnomalyBuilder()..update(updates))._build();

  _$FinanceAnomaly._({
    required this.purchaseId,
    required this.branchId,
    required this.branchCode,
    required this.amountRp,
    required this.submittedAt,
    required this.code,
    required this.severity,
    required this.href,
  }) : super._();
  @override
  FinanceAnomaly rebuild(void Function(FinanceAnomalyBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FinanceAnomalyBuilder toBuilder() => FinanceAnomalyBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinanceAnomaly &&
        purchaseId == other.purchaseId &&
        branchId == other.branchId &&
        branchCode == other.branchCode &&
        amountRp == other.amountRp &&
        submittedAt == other.submittedAt &&
        code == other.code &&
        severity == other.severity &&
        href == other.href;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, purchaseId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, branchCode.hashCode);
    _$hash = $jc(_$hash, amountRp.hashCode);
    _$hash = $jc(_$hash, submittedAt.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, severity.hashCode);
    _$hash = $jc(_$hash, href.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinanceAnomaly')
          ..add('purchaseId', purchaseId)
          ..add('branchId', branchId)
          ..add('branchCode', branchCode)
          ..add('amountRp', amountRp)
          ..add('submittedAt', submittedAt)
          ..add('code', code)
          ..add('severity', severity)
          ..add('href', href))
        .toString();
  }
}

class FinanceAnomalyBuilder
    implements Builder<FinanceAnomaly, FinanceAnomalyBuilder> {
  _$FinanceAnomaly? _$v;

  String? _purchaseId;
  String? get purchaseId => _$this._purchaseId;
  set purchaseId(String? purchaseId) => _$this._purchaseId = purchaseId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _branchCode;
  String? get branchCode => _$this._branchCode;
  set branchCode(String? branchCode) => _$this._branchCode = branchCode;

  int? _amountRp;
  int? get amountRp => _$this._amountRp;
  set amountRp(int? amountRp) => _$this._amountRp = amountRp;

  DateTime? _submittedAt;
  DateTime? get submittedAt => _$this._submittedAt;
  set submittedAt(DateTime? submittedAt) => _$this._submittedAt = submittedAt;

  FinanceAnomalyCodeEnum? _code;
  FinanceAnomalyCodeEnum? get code => _$this._code;
  set code(FinanceAnomalyCodeEnum? code) => _$this._code = code;

  FinanceAnomalySeverityEnum? _severity;
  FinanceAnomalySeverityEnum? get severity => _$this._severity;
  set severity(FinanceAnomalySeverityEnum? severity) =>
      _$this._severity = severity;

  String? _href;
  String? get href => _$this._href;
  set href(String? href) => _$this._href = href;

  FinanceAnomalyBuilder() {
    FinanceAnomaly._defaults(this);
  }

  FinanceAnomalyBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _purchaseId = $v.purchaseId;
      _branchId = $v.branchId;
      _branchCode = $v.branchCode;
      _amountRp = $v.amountRp;
      _submittedAt = $v.submittedAt;
      _code = $v.code;
      _severity = $v.severity;
      _href = $v.href;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinanceAnomaly other) {
    _$v = other as _$FinanceAnomaly;
  }

  @override
  void update(void Function(FinanceAnomalyBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinanceAnomaly build() => _build();

  _$FinanceAnomaly _build() {
    final _$result =
        _$v ??
        _$FinanceAnomaly._(
          purchaseId: BuiltValueNullFieldError.checkNotNull(
            purchaseId,
            r'FinanceAnomaly',
            'purchaseId',
          ),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'FinanceAnomaly',
            'branchId',
          ),
          branchCode: BuiltValueNullFieldError.checkNotNull(
            branchCode,
            r'FinanceAnomaly',
            'branchCode',
          ),
          amountRp: BuiltValueNullFieldError.checkNotNull(
            amountRp,
            r'FinanceAnomaly',
            'amountRp',
          ),
          submittedAt: BuiltValueNullFieldError.checkNotNull(
            submittedAt,
            r'FinanceAnomaly',
            'submittedAt',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'FinanceAnomaly',
            'code',
          ),
          severity: BuiltValueNullFieldError.checkNotNull(
            severity,
            r'FinanceAnomaly',
            'severity',
          ),
          href: BuiltValueNullFieldError.checkNotNull(
            href,
            r'FinanceAnomaly',
            'href',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
