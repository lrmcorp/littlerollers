// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_proof.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentProofUploadStatusEnum _$paymentProofUploadStatusEnum_ISSUED =
    const PaymentProofUploadStatusEnum._('ISSUED');
const PaymentProofUploadStatusEnum _$paymentProofUploadStatusEnum_UPLOADED =
    const PaymentProofUploadStatusEnum._('UPLOADED');
const PaymentProofUploadStatusEnum _$paymentProofUploadStatusEnum_FINALIZED =
    const PaymentProofUploadStatusEnum._('FINALIZED');
const PaymentProofUploadStatusEnum _$paymentProofUploadStatusEnum_FAILED =
    const PaymentProofUploadStatusEnum._('FAILED');

PaymentProofUploadStatusEnum _$paymentProofUploadStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ISSUED':
      return _$paymentProofUploadStatusEnum_ISSUED;
    case 'UPLOADED':
      return _$paymentProofUploadStatusEnum_UPLOADED;
    case 'FINALIZED':
      return _$paymentProofUploadStatusEnum_FINALIZED;
    case 'FAILED':
      return _$paymentProofUploadStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentProofUploadStatusEnum>
_$paymentProofUploadStatusEnumValues =
    BuiltSet<PaymentProofUploadStatusEnum>(const <PaymentProofUploadStatusEnum>[
      _$paymentProofUploadStatusEnum_ISSUED,
      _$paymentProofUploadStatusEnum_UPLOADED,
      _$paymentProofUploadStatusEnum_FINALIZED,
      _$paymentProofUploadStatusEnum_FAILED,
    ]);

const PaymentProofScanStatusEnum _$paymentProofScanStatusEnum_PENDING =
    const PaymentProofScanStatusEnum._('PENDING');
const PaymentProofScanStatusEnum _$paymentProofScanStatusEnum_CLEAN =
    const PaymentProofScanStatusEnum._('CLEAN');
const PaymentProofScanStatusEnum _$paymentProofScanStatusEnum_REJECTED =
    const PaymentProofScanStatusEnum._('REJECTED');
const PaymentProofScanStatusEnum _$paymentProofScanStatusEnum_INFECTED =
    const PaymentProofScanStatusEnum._('INFECTED');
const PaymentProofScanStatusEnum _$paymentProofScanStatusEnum_ERROR =
    const PaymentProofScanStatusEnum._('ERROR');

PaymentProofScanStatusEnum _$paymentProofScanStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$paymentProofScanStatusEnum_PENDING;
    case 'CLEAN':
      return _$paymentProofScanStatusEnum_CLEAN;
    case 'REJECTED':
      return _$paymentProofScanStatusEnum_REJECTED;
    case 'INFECTED':
      return _$paymentProofScanStatusEnum_INFECTED;
    case 'ERROR':
      return _$paymentProofScanStatusEnum_ERROR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentProofScanStatusEnum> _$paymentProofScanStatusEnumValues =
    BuiltSet<PaymentProofScanStatusEnum>(const <PaymentProofScanStatusEnum>[
      _$paymentProofScanStatusEnum_PENDING,
      _$paymentProofScanStatusEnum_CLEAN,
      _$paymentProofScanStatusEnum_REJECTED,
      _$paymentProofScanStatusEnum_INFECTED,
      _$paymentProofScanStatusEnum_ERROR,
    ]);

Serializer<PaymentProofUploadStatusEnum>
_$paymentProofUploadStatusEnumSerializer =
    _$PaymentProofUploadStatusEnumSerializer();
Serializer<PaymentProofScanStatusEnum> _$paymentProofScanStatusEnumSerializer =
    _$PaymentProofScanStatusEnumSerializer();

class _$PaymentProofUploadStatusEnumSerializer
    implements PrimitiveSerializer<PaymentProofUploadStatusEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentProofUploadStatusEnum];
  @override
  final String wireName = 'PaymentProofUploadStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentProofUploadStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentProofUploadStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentProofUploadStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentProofScanStatusEnumSerializer
    implements PrimitiveSerializer<PaymentProofScanStatusEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentProofScanStatusEnum];
  @override
  final String wireName = 'PaymentProofScanStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentProofScanStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentProofScanStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentProofScanStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentProof extends PaymentProof {
  @override
  final String id;
  @override
  final PaymentProofUploadStatusEnum uploadStatus;
  @override
  final PaymentProofScanStatusEnum scanStatus;
  @override
  final String fileName;
  @override
  final String mimeType;
  @override
  final int sizeBytes;
  @override
  final String? replacedById;
  @override
  final int version;

  factory _$PaymentProof([void Function(PaymentProofBuilder)? updates]) =>
      (PaymentProofBuilder()..update(updates))._build();

  _$PaymentProof._({
    required this.id,
    required this.uploadStatus,
    required this.scanStatus,
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    this.replacedById,
    required this.version,
  }) : super._();
  @override
  PaymentProof rebuild(void Function(PaymentProofBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PaymentProofBuilder toBuilder() => PaymentProofBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentProof &&
        id == other.id &&
        uploadStatus == other.uploadStatus &&
        scanStatus == other.scanStatus &&
        fileName == other.fileName &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        replacedById == other.replacedById &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, uploadStatus.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jc(_$hash, fileName.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, replacedById.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentProof')
          ..add('id', id)
          ..add('uploadStatus', uploadStatus)
          ..add('scanStatus', scanStatus)
          ..add('fileName', fileName)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('replacedById', replacedById)
          ..add('version', version))
        .toString();
  }
}

class PaymentProofBuilder
    implements Builder<PaymentProof, PaymentProofBuilder> {
  _$PaymentProof? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  PaymentProofUploadStatusEnum? _uploadStatus;
  PaymentProofUploadStatusEnum? get uploadStatus => _$this._uploadStatus;
  set uploadStatus(PaymentProofUploadStatusEnum? uploadStatus) =>
      _$this._uploadStatus = uploadStatus;

  PaymentProofScanStatusEnum? _scanStatus;
  PaymentProofScanStatusEnum? get scanStatus => _$this._scanStatus;
  set scanStatus(PaymentProofScanStatusEnum? scanStatus) =>
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

  String? _replacedById;
  String? get replacedById => _$this._replacedById;
  set replacedById(String? replacedById) => _$this._replacedById = replacedById;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  PaymentProofBuilder() {
    PaymentProof._defaults(this);
  }

  PaymentProofBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _uploadStatus = $v.uploadStatus;
      _scanStatus = $v.scanStatus;
      _fileName = $v.fileName;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _replacedById = $v.replacedById;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentProof other) {
    _$v = other as _$PaymentProof;
  }

  @override
  void update(void Function(PaymentProofBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentProof build() => _build();

  _$PaymentProof _build() {
    final _$result =
        _$v ??
        _$PaymentProof._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'PaymentProof', 'id'),
          uploadStatus: BuiltValueNullFieldError.checkNotNull(
            uploadStatus,
            r'PaymentProof',
            'uploadStatus',
          ),
          scanStatus: BuiltValueNullFieldError.checkNotNull(
            scanStatus,
            r'PaymentProof',
            'scanStatus',
          ),
          fileName: BuiltValueNullFieldError.checkNotNull(
            fileName,
            r'PaymentProof',
            'fileName',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'PaymentProof',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'PaymentProof',
            'sizeBytes',
          ),
          replacedById: replacedById,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'PaymentProof',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
