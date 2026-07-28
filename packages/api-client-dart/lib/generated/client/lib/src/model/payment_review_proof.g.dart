// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_review_proof.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PaymentReviewProofUploadStatusEnum
_$paymentReviewProofUploadStatusEnum_ISSUED =
    const PaymentReviewProofUploadStatusEnum._('ISSUED');
const PaymentReviewProofUploadStatusEnum
_$paymentReviewProofUploadStatusEnum_UPLOADED =
    const PaymentReviewProofUploadStatusEnum._('UPLOADED');
const PaymentReviewProofUploadStatusEnum
_$paymentReviewProofUploadStatusEnum_FINALIZED =
    const PaymentReviewProofUploadStatusEnum._('FINALIZED');
const PaymentReviewProofUploadStatusEnum
_$paymentReviewProofUploadStatusEnum_FAILED =
    const PaymentReviewProofUploadStatusEnum._('FAILED');

PaymentReviewProofUploadStatusEnum _$paymentReviewProofUploadStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ISSUED':
      return _$paymentReviewProofUploadStatusEnum_ISSUED;
    case 'UPLOADED':
      return _$paymentReviewProofUploadStatusEnum_UPLOADED;
    case 'FINALIZED':
      return _$paymentReviewProofUploadStatusEnum_FINALIZED;
    case 'FAILED':
      return _$paymentReviewProofUploadStatusEnum_FAILED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentReviewProofUploadStatusEnum>
_$paymentReviewProofUploadStatusEnumValues =
    BuiltSet<PaymentReviewProofUploadStatusEnum>(
      const <PaymentReviewProofUploadStatusEnum>[
        _$paymentReviewProofUploadStatusEnum_ISSUED,
        _$paymentReviewProofUploadStatusEnum_UPLOADED,
        _$paymentReviewProofUploadStatusEnum_FINALIZED,
        _$paymentReviewProofUploadStatusEnum_FAILED,
      ],
    );

const PaymentReviewProofScanStatusEnum
_$paymentReviewProofScanStatusEnum_PENDING =
    const PaymentReviewProofScanStatusEnum._('PENDING');
const PaymentReviewProofScanStatusEnum
_$paymentReviewProofScanStatusEnum_CLEAN =
    const PaymentReviewProofScanStatusEnum._('CLEAN');
const PaymentReviewProofScanStatusEnum
_$paymentReviewProofScanStatusEnum_REJECTED =
    const PaymentReviewProofScanStatusEnum._('REJECTED');
const PaymentReviewProofScanStatusEnum
_$paymentReviewProofScanStatusEnum_INFECTED =
    const PaymentReviewProofScanStatusEnum._('INFECTED');
const PaymentReviewProofScanStatusEnum
_$paymentReviewProofScanStatusEnum_ERROR =
    const PaymentReviewProofScanStatusEnum._('ERROR');

PaymentReviewProofScanStatusEnum _$paymentReviewProofScanStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PENDING':
      return _$paymentReviewProofScanStatusEnum_PENDING;
    case 'CLEAN':
      return _$paymentReviewProofScanStatusEnum_CLEAN;
    case 'REJECTED':
      return _$paymentReviewProofScanStatusEnum_REJECTED;
    case 'INFECTED':
      return _$paymentReviewProofScanStatusEnum_INFECTED;
    case 'ERROR':
      return _$paymentReviewProofScanStatusEnum_ERROR;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PaymentReviewProofScanStatusEnum>
_$paymentReviewProofScanStatusEnumValues =
    BuiltSet<PaymentReviewProofScanStatusEnum>(
      const <PaymentReviewProofScanStatusEnum>[
        _$paymentReviewProofScanStatusEnum_PENDING,
        _$paymentReviewProofScanStatusEnum_CLEAN,
        _$paymentReviewProofScanStatusEnum_REJECTED,
        _$paymentReviewProofScanStatusEnum_INFECTED,
        _$paymentReviewProofScanStatusEnum_ERROR,
      ],
    );

Serializer<PaymentReviewProofUploadStatusEnum>
_$paymentReviewProofUploadStatusEnumSerializer =
    _$PaymentReviewProofUploadStatusEnumSerializer();
Serializer<PaymentReviewProofScanStatusEnum>
_$paymentReviewProofScanStatusEnumSerializer =
    _$PaymentReviewProofScanStatusEnumSerializer();

class _$PaymentReviewProofUploadStatusEnumSerializer
    implements PrimitiveSerializer<PaymentReviewProofUploadStatusEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentReviewProofUploadStatusEnum];
  @override
  final String wireName = 'PaymentReviewProofUploadStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewProofUploadStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentReviewProofUploadStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentReviewProofUploadStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentReviewProofScanStatusEnumSerializer
    implements PrimitiveSerializer<PaymentReviewProofScanStatusEnum> {
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
  final Iterable<Type> types = const <Type>[PaymentReviewProofScanStatusEnum];
  @override
  final String wireName = 'PaymentReviewProofScanStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PaymentReviewProofScanStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PaymentReviewProofScanStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PaymentReviewProofScanStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PaymentReviewProof extends PaymentReviewProof {
  @override
  final String id;
  @override
  final PaymentReviewProofUploadStatusEnum uploadStatus;
  @override
  final PaymentReviewProofScanStatusEnum scanStatus;
  @override
  final String mimeType;
  @override
  final int sizeBytes;
  @override
  final DateTime? finalizedAt;

  factory _$PaymentReviewProof([
    void Function(PaymentReviewProofBuilder)? updates,
  ]) => (PaymentReviewProofBuilder()..update(updates))._build();

  _$PaymentReviewProof._({
    required this.id,
    required this.uploadStatus,
    required this.scanStatus,
    required this.mimeType,
    required this.sizeBytes,
    this.finalizedAt,
  }) : super._();
  @override
  PaymentReviewProof rebuild(
    void Function(PaymentReviewProofBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentReviewProofBuilder toBuilder() =>
      PaymentReviewProofBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentReviewProof &&
        id == other.id &&
        uploadStatus == other.uploadStatus &&
        scanStatus == other.scanStatus &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        finalizedAt == other.finalizedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, uploadStatus.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, finalizedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentReviewProof')
          ..add('id', id)
          ..add('uploadStatus', uploadStatus)
          ..add('scanStatus', scanStatus)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('finalizedAt', finalizedAt))
        .toString();
  }
}

class PaymentReviewProofBuilder
    implements Builder<PaymentReviewProof, PaymentReviewProofBuilder> {
  _$PaymentReviewProof? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  PaymentReviewProofUploadStatusEnum? _uploadStatus;
  PaymentReviewProofUploadStatusEnum? get uploadStatus => _$this._uploadStatus;
  set uploadStatus(PaymentReviewProofUploadStatusEnum? uploadStatus) =>
      _$this._uploadStatus = uploadStatus;

  PaymentReviewProofScanStatusEnum? _scanStatus;
  PaymentReviewProofScanStatusEnum? get scanStatus => _$this._scanStatus;
  set scanStatus(PaymentReviewProofScanStatusEnum? scanStatus) =>
      _$this._scanStatus = scanStatus;

  String? _mimeType;
  String? get mimeType => _$this._mimeType;
  set mimeType(String? mimeType) => _$this._mimeType = mimeType;

  int? _sizeBytes;
  int? get sizeBytes => _$this._sizeBytes;
  set sizeBytes(int? sizeBytes) => _$this._sizeBytes = sizeBytes;

  DateTime? _finalizedAt;
  DateTime? get finalizedAt => _$this._finalizedAt;
  set finalizedAt(DateTime? finalizedAt) => _$this._finalizedAt = finalizedAt;

  PaymentReviewProofBuilder() {
    PaymentReviewProof._defaults(this);
  }

  PaymentReviewProofBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _uploadStatus = $v.uploadStatus;
      _scanStatus = $v.scanStatus;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _finalizedAt = $v.finalizedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentReviewProof other) {
    _$v = other as _$PaymentReviewProof;
  }

  @override
  void update(void Function(PaymentReviewProofBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentReviewProof build() => _build();

  _$PaymentReviewProof _build() {
    final _$result =
        _$v ??
        _$PaymentReviewProof._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PaymentReviewProof',
            'id',
          ),
          uploadStatus: BuiltValueNullFieldError.checkNotNull(
            uploadStatus,
            r'PaymentReviewProof',
            'uploadStatus',
          ),
          scanStatus: BuiltValueNullFieldError.checkNotNull(
            scanStatus,
            r'PaymentReviewProof',
            'scanStatus',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'PaymentReviewProof',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'PaymentReviewProof',
            'sizeBytes',
          ),
          finalizedAt: finalizedAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
