// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_document.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const IdentityVerificationDocumentKindEnum
_$identityVerificationDocumentKindEnum_SELFIE =
    const IdentityVerificationDocumentKindEnum._('SELFIE');
const IdentityVerificationDocumentKindEnum
_$identityVerificationDocumentKindEnum_KTP_FRONT =
    const IdentityVerificationDocumentKindEnum._('KTP_FRONT');

IdentityVerificationDocumentKindEnum
_$identityVerificationDocumentKindEnumValueOf(String name) {
  switch (name) {
    case 'SELFIE':
      return _$identityVerificationDocumentKindEnum_SELFIE;
    case 'KTP_FRONT':
      return _$identityVerificationDocumentKindEnum_KTP_FRONT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationDocumentKindEnum>
_$identityVerificationDocumentKindEnumValues =
    BuiltSet<IdentityVerificationDocumentKindEnum>(
      const <IdentityVerificationDocumentKindEnum>[
        _$identityVerificationDocumentKindEnum_SELFIE,
        _$identityVerificationDocumentKindEnum_KTP_FRONT,
      ],
    );

const IdentityVerificationDocumentStatusEnum
_$identityVerificationDocumentStatusEnum_PENDING =
    const IdentityVerificationDocumentStatusEnum._('PENDING');
const IdentityVerificationDocumentStatusEnum
_$identityVerificationDocumentStatusEnum_APPROVED =
    const IdentityVerificationDocumentStatusEnum._('APPROVED');
const IdentityVerificationDocumentStatusEnum
_$identityVerificationDocumentStatusEnum_REJECTED =
    const IdentityVerificationDocumentStatusEnum._('REJECTED');
const IdentityVerificationDocumentStatusEnum
_$identityVerificationDocumentStatusEnum_DELETED =
    const IdentityVerificationDocumentStatusEnum._('DELETED');

IdentityVerificationDocumentStatusEnum
_$identityVerificationDocumentStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$identityVerificationDocumentStatusEnum_PENDING;
    case 'APPROVED':
      return _$identityVerificationDocumentStatusEnum_APPROVED;
    case 'REJECTED':
      return _$identityVerificationDocumentStatusEnum_REJECTED;
    case 'DELETED':
      return _$identityVerificationDocumentStatusEnum_DELETED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationDocumentStatusEnum>
_$identityVerificationDocumentStatusEnumValues =
    BuiltSet<IdentityVerificationDocumentStatusEnum>(
      const <IdentityVerificationDocumentStatusEnum>[
        _$identityVerificationDocumentStatusEnum_PENDING,
        _$identityVerificationDocumentStatusEnum_APPROVED,
        _$identityVerificationDocumentStatusEnum_REJECTED,
        _$identityVerificationDocumentStatusEnum_DELETED,
      ],
    );

const IdentityVerificationDocumentUploadStatusEnum
_$identityVerificationDocumentUploadStatusEnum_ISSUED =
    const IdentityVerificationDocumentUploadStatusEnum._('ISSUED');
const IdentityVerificationDocumentUploadStatusEnum
_$identityVerificationDocumentUploadStatusEnum_UPLOADED =
    const IdentityVerificationDocumentUploadStatusEnum._('UPLOADED');
const IdentityVerificationDocumentUploadStatusEnum
_$identityVerificationDocumentUploadStatusEnum_FINALIZED =
    const IdentityVerificationDocumentUploadStatusEnum._('FINALIZED');
const IdentityVerificationDocumentUploadStatusEnum
_$identityVerificationDocumentUploadStatusEnum_FAILED =
    const IdentityVerificationDocumentUploadStatusEnum._('FAILED');

IdentityVerificationDocumentUploadStatusEnum
_$identityVerificationDocumentUploadStatusEnumValueOf(String name) {
  switch (name) {
    case 'ISSUED':
      return _$identityVerificationDocumentUploadStatusEnum_ISSUED;
    case 'UPLOADED':
      return _$identityVerificationDocumentUploadStatusEnum_UPLOADED;
    case 'FINALIZED':
      return _$identityVerificationDocumentUploadStatusEnum_FINALIZED;
    case 'FAILED':
      return _$identityVerificationDocumentUploadStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationDocumentUploadStatusEnum>
_$identityVerificationDocumentUploadStatusEnumValues =
    BuiltSet<IdentityVerificationDocumentUploadStatusEnum>(
      const <IdentityVerificationDocumentUploadStatusEnum>[
        _$identityVerificationDocumentUploadStatusEnum_ISSUED,
        _$identityVerificationDocumentUploadStatusEnum_UPLOADED,
        _$identityVerificationDocumentUploadStatusEnum_FINALIZED,
        _$identityVerificationDocumentUploadStatusEnum_FAILED,
      ],
    );

const IdentityVerificationDocumentScanStatusEnum
_$identityVerificationDocumentScanStatusEnum_PENDING =
    const IdentityVerificationDocumentScanStatusEnum._('PENDING');
const IdentityVerificationDocumentScanStatusEnum
_$identityVerificationDocumentScanStatusEnum_CLEAN =
    const IdentityVerificationDocumentScanStatusEnum._('CLEAN');
const IdentityVerificationDocumentScanStatusEnum
_$identityVerificationDocumentScanStatusEnum_REJECTED =
    const IdentityVerificationDocumentScanStatusEnum._('REJECTED');
const IdentityVerificationDocumentScanStatusEnum
_$identityVerificationDocumentScanStatusEnum_INFECTED =
    const IdentityVerificationDocumentScanStatusEnum._('INFECTED');
const IdentityVerificationDocumentScanStatusEnum
_$identityVerificationDocumentScanStatusEnum_ERROR =
    const IdentityVerificationDocumentScanStatusEnum._('ERROR');

IdentityVerificationDocumentScanStatusEnum
_$identityVerificationDocumentScanStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$identityVerificationDocumentScanStatusEnum_PENDING;
    case 'CLEAN':
      return _$identityVerificationDocumentScanStatusEnum_CLEAN;
    case 'REJECTED':
      return _$identityVerificationDocumentScanStatusEnum_REJECTED;
    case 'INFECTED':
      return _$identityVerificationDocumentScanStatusEnum_INFECTED;
    case 'ERROR':
      return _$identityVerificationDocumentScanStatusEnum_ERROR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<IdentityVerificationDocumentScanStatusEnum>
_$identityVerificationDocumentScanStatusEnumValues =
    BuiltSet<IdentityVerificationDocumentScanStatusEnum>(
      const <IdentityVerificationDocumentScanStatusEnum>[
        _$identityVerificationDocumentScanStatusEnum_PENDING,
        _$identityVerificationDocumentScanStatusEnum_CLEAN,
        _$identityVerificationDocumentScanStatusEnum_REJECTED,
        _$identityVerificationDocumentScanStatusEnum_INFECTED,
        _$identityVerificationDocumentScanStatusEnum_ERROR,
      ],
    );

Serializer<IdentityVerificationDocumentKindEnum>
_$identityVerificationDocumentKindEnumSerializer =
    _$IdentityVerificationDocumentKindEnumSerializer();
Serializer<IdentityVerificationDocumentStatusEnum>
_$identityVerificationDocumentStatusEnumSerializer =
    _$IdentityVerificationDocumentStatusEnumSerializer();
Serializer<IdentityVerificationDocumentUploadStatusEnum>
_$identityVerificationDocumentUploadStatusEnumSerializer =
    _$IdentityVerificationDocumentUploadStatusEnumSerializer();
Serializer<IdentityVerificationDocumentScanStatusEnum>
_$identityVerificationDocumentScanStatusEnumSerializer =
    _$IdentityVerificationDocumentScanStatusEnumSerializer();

class _$IdentityVerificationDocumentKindEnumSerializer
    implements PrimitiveSerializer<IdentityVerificationDocumentKindEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SELFIE': 'SELFIE',
    'KTP_FRONT': 'KTP_FRONT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SELFIE': 'SELFIE',
    'KTP_FRONT': 'KTP_FRONT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    IdentityVerificationDocumentKindEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationDocumentKindEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDocumentKindEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationDocumentKindEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationDocumentKindEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationDocumentStatusEnumSerializer
    implements PrimitiveSerializer<IdentityVerificationDocumentStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
    'DELETED': 'DELETED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
    'DELETED': 'DELETED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    IdentityVerificationDocumentStatusEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationDocumentStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDocumentStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationDocumentStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationDocumentStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationDocumentUploadStatusEnumSerializer
    implements
        PrimitiveSerializer<IdentityVerificationDocumentUploadStatusEnum> {
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
  final Iterable<Type> types = const <Type>[
    IdentityVerificationDocumentUploadStatusEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationDocumentUploadStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDocumentUploadStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationDocumentUploadStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationDocumentUploadStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationDocumentScanStatusEnumSerializer
    implements PrimitiveSerializer<IdentityVerificationDocumentScanStatusEnum> {
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
    IdentityVerificationDocumentScanStatusEnum,
  ];
  @override
  final String wireName = 'IdentityVerificationDocumentScanStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDocumentScanStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  IdentityVerificationDocumentScanStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => IdentityVerificationDocumentScanStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$IdentityVerificationDocument extends IdentityVerificationDocument {
  @override
  final String id;
  @override
  final IdentityVerificationDocumentKindEnum kind;
  @override
  final IdentityVerificationDocumentStatusEnum status;
  @override
  final IdentityVerificationDocumentUploadStatusEnum uploadStatus;
  @override
  final IdentityVerificationDocumentScanStatusEnum scanStatus;
  @override
  final String fileName;
  @override
  final String mimeType;
  @override
  final int sizeBytes;
  @override
  final String? rejectionReasonCode;
  @override
  final String? rejectionNote;
  @override
  final DateTime? reviewedAt;
  @override
  final DateTime? deletedAt;
  @override
  final int version;

  factory _$IdentityVerificationDocument([
    void Function(IdentityVerificationDocumentBuilder)? updates,
  ]) => (IdentityVerificationDocumentBuilder()..update(updates))._build();

  _$IdentityVerificationDocument._({
    required this.id,
    required this.kind,
    required this.status,
    required this.uploadStatus,
    required this.scanStatus,
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    this.rejectionReasonCode,
    this.rejectionNote,
    this.reviewedAt,
    this.deletedAt,
    required this.version,
  }) : super._();
  @override
  IdentityVerificationDocument rebuild(
    void Function(IdentityVerificationDocumentBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationDocumentBuilder toBuilder() =>
      IdentityVerificationDocumentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationDocument &&
        id == other.id &&
        kind == other.kind &&
        status == other.status &&
        uploadStatus == other.uploadStatus &&
        scanStatus == other.scanStatus &&
        fileName == other.fileName &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        rejectionReasonCode == other.rejectionReasonCode &&
        rejectionNote == other.rejectionNote &&
        reviewedAt == other.reviewedAt &&
        deletedAt == other.deletedAt &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, uploadStatus.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jc(_$hash, fileName.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, rejectionReasonCode.hashCode);
    _$hash = $jc(_$hash, rejectionNote.hashCode);
    _$hash = $jc(_$hash, reviewedAt.hashCode);
    _$hash = $jc(_$hash, deletedAt.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationDocument')
          ..add('id', id)
          ..add('kind', kind)
          ..add('status', status)
          ..add('uploadStatus', uploadStatus)
          ..add('scanStatus', scanStatus)
          ..add('fileName', fileName)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('rejectionReasonCode', rejectionReasonCode)
          ..add('rejectionNote', rejectionNote)
          ..add('reviewedAt', reviewedAt)
          ..add('deletedAt', deletedAt)
          ..add('version', version))
        .toString();
  }
}

class IdentityVerificationDocumentBuilder
    implements
        Builder<
          IdentityVerificationDocument,
          IdentityVerificationDocumentBuilder
        > {
  _$IdentityVerificationDocument? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  IdentityVerificationDocumentKindEnum? _kind;
  IdentityVerificationDocumentKindEnum? get kind => _$this._kind;
  set kind(IdentityVerificationDocumentKindEnum? kind) => _$this._kind = kind;

  IdentityVerificationDocumentStatusEnum? _status;
  IdentityVerificationDocumentStatusEnum? get status => _$this._status;
  set status(IdentityVerificationDocumentStatusEnum? status) =>
      _$this._status = status;

  IdentityVerificationDocumentUploadStatusEnum? _uploadStatus;
  IdentityVerificationDocumentUploadStatusEnum? get uploadStatus =>
      _$this._uploadStatus;
  set uploadStatus(
    IdentityVerificationDocumentUploadStatusEnum? uploadStatus,
  ) => _$this._uploadStatus = uploadStatus;

  IdentityVerificationDocumentScanStatusEnum? _scanStatus;
  IdentityVerificationDocumentScanStatusEnum? get scanStatus =>
      _$this._scanStatus;
  set scanStatus(IdentityVerificationDocumentScanStatusEnum? scanStatus) =>
      _$this._scanStatus = scanStatus;

  String? _fileName;
  String? get fileName => _$this._fileName;
  set fileName(String? fileName) => _$this._fileName = fileName;

  String? _mimeType;
  String? get mimeType => _$this._mimeType;
  set mimeType(String? mimeType) => _$this._mimeType = mimeType;

  int? _sizeBytes;
  int? get sizeBytes => _$this._sizeBytes;
  set sizeBytes(int? sizeBytes) => _$this._sizeBytes = sizeBytes;

  String? _rejectionReasonCode;
  String? get rejectionReasonCode => _$this._rejectionReasonCode;
  set rejectionReasonCode(String? rejectionReasonCode) =>
      _$this._rejectionReasonCode = rejectionReasonCode;

  String? _rejectionNote;
  String? get rejectionNote => _$this._rejectionNote;
  set rejectionNote(String? rejectionNote) =>
      _$this._rejectionNote = rejectionNote;

  DateTime? _reviewedAt;
  DateTime? get reviewedAt => _$this._reviewedAt;
  set reviewedAt(DateTime? reviewedAt) => _$this._reviewedAt = reviewedAt;

  DateTime? _deletedAt;
  DateTime? get deletedAt => _$this._deletedAt;
  set deletedAt(DateTime? deletedAt) => _$this._deletedAt = deletedAt;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  IdentityVerificationDocumentBuilder() {
    IdentityVerificationDocument._defaults(this);
  }

  IdentityVerificationDocumentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _kind = $v.kind;
      _status = $v.status;
      _uploadStatus = $v.uploadStatus;
      _scanStatus = $v.scanStatus;
      _fileName = $v.fileName;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _rejectionReasonCode = $v.rejectionReasonCode;
      _rejectionNote = $v.rejectionNote;
      _reviewedAt = $v.reviewedAt;
      _deletedAt = $v.deletedAt;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationDocument other) {
    _$v = other as _$IdentityVerificationDocument;
  }

  @override
  void update(void Function(IdentityVerificationDocumentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationDocument build() => _build();

  _$IdentityVerificationDocument _build() {
    final _$result =
        _$v ??
        _$IdentityVerificationDocument._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'IdentityVerificationDocument',
            'id',
          ),
          kind: BuiltValueNullFieldError.checkNotNull(
            kind,
            r'IdentityVerificationDocument',
            'kind',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'IdentityVerificationDocument',
            'status',
          ),
          uploadStatus: BuiltValueNullFieldError.checkNotNull(
            uploadStatus,
            r'IdentityVerificationDocument',
            'uploadStatus',
          ),
          scanStatus: BuiltValueNullFieldError.checkNotNull(
            scanStatus,
            r'IdentityVerificationDocument',
            'scanStatus',
          ),
          fileName: BuiltValueNullFieldError.checkNotNull(
            fileName,
            r'IdentityVerificationDocument',
            'fileName',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'IdentityVerificationDocument',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'IdentityVerificationDocument',
            'sizeBytes',
          ),
          rejectionReasonCode: rejectionReasonCode,
          rejectionNote: rejectionNote,
          reviewedAt: reviewedAt,
          deletedAt: deletedAt,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'IdentityVerificationDocument',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
