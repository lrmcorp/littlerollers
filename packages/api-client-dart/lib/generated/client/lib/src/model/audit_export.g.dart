// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_export.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AuditExportStatusEnum _$auditExportStatusEnum_QUEUED =
    const AuditExportStatusEnum._('QUEUED');
const AuditExportStatusEnum _$auditExportStatusEnum_RUNNING =
    const AuditExportStatusEnum._('RUNNING');
const AuditExportStatusEnum _$auditExportStatusEnum_READY =
    const AuditExportStatusEnum._('READY');
const AuditExportStatusEnum _$auditExportStatusEnum_FAILED =
    const AuditExportStatusEnum._('FAILED');
const AuditExportStatusEnum _$auditExportStatusEnum_EXPIRED =
    const AuditExportStatusEnum._('EXPIRED');

AuditExportStatusEnum _$auditExportStatusEnumValueOf(String name) {
  switch (name) {
    case 'QUEUED':
      return _$auditExportStatusEnum_QUEUED;
    case 'RUNNING':
      return _$auditExportStatusEnum_RUNNING;
    case 'READY':
      return _$auditExportStatusEnum_READY;
    case 'FAILED':
      return _$auditExportStatusEnum_FAILED;
    case 'EXPIRED':
      return _$auditExportStatusEnum_EXPIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AuditExportStatusEnum> _$auditExportStatusEnumValues =
    BuiltSet<AuditExportStatusEnum>(const <AuditExportStatusEnum>[
      _$auditExportStatusEnum_QUEUED,
      _$auditExportStatusEnum_RUNNING,
      _$auditExportStatusEnum_READY,
      _$auditExportStatusEnum_FAILED,
      _$auditExportStatusEnum_EXPIRED,
    ]);

Serializer<AuditExportStatusEnum> _$auditExportStatusEnumSerializer =
    _$AuditExportStatusEnumSerializer();

class _$AuditExportStatusEnumSerializer
    implements PrimitiveSerializer<AuditExportStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'QUEUED': 'QUEUED',
    'RUNNING': 'RUNNING',
    'READY': 'READY',
    'FAILED': 'FAILED',
    'EXPIRED': 'EXPIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'QUEUED': 'QUEUED',
    'RUNNING': 'RUNNING',
    'READY': 'READY',
    'FAILED': 'FAILED',
    'EXPIRED': 'EXPIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[AuditExportStatusEnum];
  @override
  final String wireName = 'AuditExportStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    AuditExportStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AuditExportStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AuditExportStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AuditExport extends AuditExport {
  @override
  final String id;
  @override
  final AuditExportStatusEnum status;
  @override
  final DateTime requestedAt;
  @override
  final DateTime? completedAt;
  @override
  final DateTime expiresAt;
  @override
  final int? rowCount;
  @override
  final String? failureCode;

  factory _$AuditExport([void Function(AuditExportBuilder)? updates]) =>
      (AuditExportBuilder()..update(updates))._build();

  _$AuditExport._({
    required this.id,
    required this.status,
    required this.requestedAt,
    this.completedAt,
    required this.expiresAt,
    this.rowCount,
    this.failureCode,
  }) : super._();
  @override
  AuditExport rebuild(void Function(AuditExportBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AuditExportBuilder toBuilder() => AuditExportBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditExport &&
        id == other.id &&
        status == other.status &&
        requestedAt == other.requestedAt &&
        completedAt == other.completedAt &&
        expiresAt == other.expiresAt &&
        rowCount == other.rowCount &&
        failureCode == other.failureCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, requestedAt.hashCode);
    _$hash = $jc(_$hash, completedAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, rowCount.hashCode);
    _$hash = $jc(_$hash, failureCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuditExport')
          ..add('id', id)
          ..add('status', status)
          ..add('requestedAt', requestedAt)
          ..add('completedAt', completedAt)
          ..add('expiresAt', expiresAt)
          ..add('rowCount', rowCount)
          ..add('failureCode', failureCode))
        .toString();
  }
}

class AuditExportBuilder implements Builder<AuditExport, AuditExportBuilder> {
  _$AuditExport? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  AuditExportStatusEnum? _status;
  AuditExportStatusEnum? get status => _$this._status;
  set status(AuditExportStatusEnum? status) => _$this._status = status;

  DateTime? _requestedAt;
  DateTime? get requestedAt => _$this._requestedAt;
  set requestedAt(DateTime? requestedAt) => _$this._requestedAt = requestedAt;

  DateTime? _completedAt;
  DateTime? get completedAt => _$this._completedAt;
  set completedAt(DateTime? completedAt) => _$this._completedAt = completedAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  int? _rowCount;
  int? get rowCount => _$this._rowCount;
  set rowCount(int? rowCount) => _$this._rowCount = rowCount;

  String? _failureCode;
  String? get failureCode => _$this._failureCode;
  set failureCode(String? failureCode) => _$this._failureCode = failureCode;

  AuditExportBuilder() {
    AuditExport._defaults(this);
  }

  AuditExportBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _requestedAt = $v.requestedAt;
      _completedAt = $v.completedAt;
      _expiresAt = $v.expiresAt;
      _rowCount = $v.rowCount;
      _failureCode = $v.failureCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuditExport other) {
    _$v = other as _$AuditExport;
  }

  @override
  void update(void Function(AuditExportBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditExport build() => _build();

  _$AuditExport _build() {
    final _$result =
        _$v ??
        _$AuditExport._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'AuditExport', 'id'),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'AuditExport',
            'status',
          ),
          requestedAt: BuiltValueNullFieldError.checkNotNull(
            requestedAt,
            r'AuditExport',
            'requestedAt',
          ),
          completedAt: completedAt,
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'AuditExport',
            'expiresAt',
          ),
          rowCount: rowCount,
          failureCode: failureCode,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
