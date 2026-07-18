// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_source_upload.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MigrationSourceUploadStatusEnum _$migrationSourceUploadStatusEnum_ISSUED =
    const MigrationSourceUploadStatusEnum._('ISSUED');
const MigrationSourceUploadStatusEnum
_$migrationSourceUploadStatusEnum_UPLOADED =
    const MigrationSourceUploadStatusEnum._('UPLOADED');
const MigrationSourceUploadStatusEnum
_$migrationSourceUploadStatusEnum_FINALIZED =
    const MigrationSourceUploadStatusEnum._('FINALIZED');
const MigrationSourceUploadStatusEnum _$migrationSourceUploadStatusEnum_FAILED =
    const MigrationSourceUploadStatusEnum._('FAILED');

MigrationSourceUploadStatusEnum _$migrationSourceUploadStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ISSUED':
      return _$migrationSourceUploadStatusEnum_ISSUED;
    case 'UPLOADED':
      return _$migrationSourceUploadStatusEnum_UPLOADED;
    case 'FINALIZED':
      return _$migrationSourceUploadStatusEnum_FINALIZED;
    case 'FAILED':
      return _$migrationSourceUploadStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MigrationSourceUploadStatusEnum>
_$migrationSourceUploadStatusEnumValues =
    BuiltSet<MigrationSourceUploadStatusEnum>(
      const <MigrationSourceUploadStatusEnum>[
        _$migrationSourceUploadStatusEnum_ISSUED,
        _$migrationSourceUploadStatusEnum_UPLOADED,
        _$migrationSourceUploadStatusEnum_FINALIZED,
        _$migrationSourceUploadStatusEnum_FAILED,
      ],
    );

const MigrationSourceUploadScanStatusEnum
_$migrationSourceUploadScanStatusEnum_PENDING =
    const MigrationSourceUploadScanStatusEnum._('PENDING');
const MigrationSourceUploadScanStatusEnum
_$migrationSourceUploadScanStatusEnum_CLEAN =
    const MigrationSourceUploadScanStatusEnum._('CLEAN');
const MigrationSourceUploadScanStatusEnum
_$migrationSourceUploadScanStatusEnum_REJECTED =
    const MigrationSourceUploadScanStatusEnum._('REJECTED');
const MigrationSourceUploadScanStatusEnum
_$migrationSourceUploadScanStatusEnum_INFECTED =
    const MigrationSourceUploadScanStatusEnum._('INFECTED');
const MigrationSourceUploadScanStatusEnum
_$migrationSourceUploadScanStatusEnum_ERROR =
    const MigrationSourceUploadScanStatusEnum._('ERROR');

MigrationSourceUploadScanStatusEnum
_$migrationSourceUploadScanStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$migrationSourceUploadScanStatusEnum_PENDING;
    case 'CLEAN':
      return _$migrationSourceUploadScanStatusEnum_CLEAN;
    case 'REJECTED':
      return _$migrationSourceUploadScanStatusEnum_REJECTED;
    case 'INFECTED':
      return _$migrationSourceUploadScanStatusEnum_INFECTED;
    case 'ERROR':
      return _$migrationSourceUploadScanStatusEnum_ERROR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MigrationSourceUploadScanStatusEnum>
_$migrationSourceUploadScanStatusEnumValues =
    BuiltSet<MigrationSourceUploadScanStatusEnum>(
      const <MigrationSourceUploadScanStatusEnum>[
        _$migrationSourceUploadScanStatusEnum_PENDING,
        _$migrationSourceUploadScanStatusEnum_CLEAN,
        _$migrationSourceUploadScanStatusEnum_REJECTED,
        _$migrationSourceUploadScanStatusEnum_INFECTED,
        _$migrationSourceUploadScanStatusEnum_ERROR,
      ],
    );

Serializer<MigrationSourceUploadStatusEnum>
_$migrationSourceUploadStatusEnumSerializer =
    _$MigrationSourceUploadStatusEnumSerializer();
Serializer<MigrationSourceUploadScanStatusEnum>
_$migrationSourceUploadScanStatusEnumSerializer =
    _$MigrationSourceUploadScanStatusEnumSerializer();

class _$MigrationSourceUploadStatusEnumSerializer
    implements PrimitiveSerializer<MigrationSourceUploadStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ISSUED': 'ISSUED',
    'UPLOADED': 'UPLOADED',
    'FINALIZED': 'FINALIZED',
    'FAILED': 'FAILED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ISSUED': 'ISSUED',
    'UPLOADED': 'UPLOADED',
    'FINALIZED': 'FINALIZED',
    'FAILED': 'FAILED',
  };

  @override
  final Iterable<Type> types = const <Type>[MigrationSourceUploadStatusEnum];
  @override
  final String wireName = 'MigrationSourceUploadStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    MigrationSourceUploadStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MigrationSourceUploadStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MigrationSourceUploadStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$MigrationSourceUploadScanStatusEnumSerializer
    implements PrimitiveSerializer<MigrationSourceUploadScanStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'CLEAN': 'CLEAN',
    'REJECTED': 'REJECTED',
    'INFECTED': 'INFECTED',
    'ERROR': 'ERROR',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'CLEAN': 'CLEAN',
    'REJECTED': 'REJECTED',
    'INFECTED': 'INFECTED',
    'ERROR': 'ERROR',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MigrationSourceUploadScanStatusEnum,
  ];
  @override
  final String wireName = 'MigrationSourceUploadScanStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    MigrationSourceUploadScanStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MigrationSourceUploadScanStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MigrationSourceUploadScanStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$MigrationSourceUpload extends MigrationSourceUpload {
  @override
  final String id;
  @override
  final MigrationSourceUploadStatusEnum status;
  @override
  final MigrationSourceUploadScanStatusEnum scanStatus;
  @override
  final String sha256;
  @override
  final String? uploadUrl;

  factory _$MigrationSourceUpload([
    void Function(MigrationSourceUploadBuilder)? updates,
  ]) => (MigrationSourceUploadBuilder()..update(updates))._build();

  _$MigrationSourceUpload._({
    required this.id,
    required this.status,
    required this.scanStatus,
    required this.sha256,
    this.uploadUrl,
  }) : super._();
  @override
  MigrationSourceUpload rebuild(
    void Function(MigrationSourceUploadBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationSourceUploadBuilder toBuilder() =>
      MigrationSourceUploadBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationSourceUpload &&
        id == other.id &&
        status == other.status &&
        scanStatus == other.scanStatus &&
        sha256 == other.sha256 &&
        uploadUrl == other.uploadUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jc(_$hash, uploadUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MigrationSourceUpload')
          ..add('id', id)
          ..add('status', status)
          ..add('scanStatus', scanStatus)
          ..add('sha256', sha256)
          ..add('uploadUrl', uploadUrl))
        .toString();
  }
}

class MigrationSourceUploadBuilder
    implements Builder<MigrationSourceUpload, MigrationSourceUploadBuilder> {
  _$MigrationSourceUpload? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  MigrationSourceUploadStatusEnum? _status;
  MigrationSourceUploadStatusEnum? get status => _$this._status;
  set status(MigrationSourceUploadStatusEnum? status) =>
      _$this._status = status;

  MigrationSourceUploadScanStatusEnum? _scanStatus;
  MigrationSourceUploadScanStatusEnum? get scanStatus => _$this._scanStatus;
  set scanStatus(MigrationSourceUploadScanStatusEnum? scanStatus) =>
      _$this._scanStatus = scanStatus;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(String? sha256) => _$this._sha256 = sha256;

  String? _uploadUrl;
  String? get uploadUrl => _$this._uploadUrl;
  set uploadUrl(String? uploadUrl) => _$this._uploadUrl = uploadUrl;

  MigrationSourceUploadBuilder() {
    MigrationSourceUpload._defaults(this);
  }

  MigrationSourceUploadBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _scanStatus = $v.scanStatus;
      _sha256 = $v.sha256;
      _uploadUrl = $v.uploadUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MigrationSourceUpload other) {
    _$v = other as _$MigrationSourceUpload;
  }

  @override
  void update(void Function(MigrationSourceUploadBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationSourceUpload build() => _build();

  _$MigrationSourceUpload _build() {
    final _$result =
        _$v ??
        _$MigrationSourceUpload._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'MigrationSourceUpload',
            'id',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'MigrationSourceUpload',
            'status',
          ),
          scanStatus: BuiltValueNullFieldError.checkNotNull(
            scanStatus,
            r'MigrationSourceUpload',
            'scanStatus',
          ),
          sha256: BuiltValueNullFieldError.checkNotNull(
            sha256,
            r'MigrationSourceUpload',
            'sha256',
          ),
          uploadUrl: uploadUrl,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
