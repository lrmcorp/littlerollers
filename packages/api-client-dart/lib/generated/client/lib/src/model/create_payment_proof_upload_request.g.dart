// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_payment_proof_upload_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreatePaymentProofUploadRequest
    extends CreatePaymentProofUploadRequest {
  @override
  final String branchId;
  @override
  final String? packageId;
  @override
  final String fileName;
  @override
  final String mimeType;
  @override
  final int sizeBytes;
  @override
  final String sha256;

  factory _$CreatePaymentProofUploadRequest([
    void Function(CreatePaymentProofUploadRequestBuilder)? updates,
  ]) => (CreatePaymentProofUploadRequestBuilder()..update(updates))._build();

  _$CreatePaymentProofUploadRequest._({
    required this.branchId,
    this.packageId,
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    required this.sha256,
  }) : super._();
  @override
  CreatePaymentProofUploadRequest rebuild(
    void Function(CreatePaymentProofUploadRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CreatePaymentProofUploadRequestBuilder toBuilder() =>
      CreatePaymentProofUploadRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreatePaymentProofUploadRequest &&
        branchId == other.branchId &&
        packageId == other.packageId &&
        fileName == other.fileName &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        sha256 == other.sha256;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, fileName.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreatePaymentProofUploadRequest')
          ..add('branchId', branchId)
          ..add('packageId', packageId)
          ..add('fileName', fileName)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('sha256', sha256))
        .toString();
  }
}

class CreatePaymentProofUploadRequestBuilder
    implements
        Builder<
          CreatePaymentProofUploadRequest,
          CreatePaymentProofUploadRequestBuilder
        > {
  _$CreatePaymentProofUploadRequest? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _fileName;
  String? get fileName => _$this._fileName;
  set fileName(String? fileName) => _$this._fileName = fileName;

  String? _mimeType;
  String? get mimeType => _$this._mimeType;
  set mimeType(String? mimeType) => _$this._mimeType = mimeType;

  int? _sizeBytes;
  int? get sizeBytes => _$this._sizeBytes;
  set sizeBytes(int? sizeBytes) => _$this._sizeBytes = sizeBytes;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(String? sha256) => _$this._sha256 = sha256;

  CreatePaymentProofUploadRequestBuilder() {
    CreatePaymentProofUploadRequest._defaults(this);
  }

  CreatePaymentProofUploadRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _packageId = $v.packageId;
      _fileName = $v.fileName;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _sha256 = $v.sha256;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreatePaymentProofUploadRequest other) {
    _$v = other as _$CreatePaymentProofUploadRequest;
  }

  @override
  void update(void Function(CreatePaymentProofUploadRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreatePaymentProofUploadRequest build() => _build();

  _$CreatePaymentProofUploadRequest _build() {
    final _$result =
        _$v ??
        _$CreatePaymentProofUploadRequest._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'CreatePaymentProofUploadRequest',
            'branchId',
          ),
          packageId: packageId,
          fileName: BuiltValueNullFieldError.checkNotNull(
            fileName,
            r'CreatePaymentProofUploadRequest',
            'fileName',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'CreatePaymentProofUploadRequest',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'CreatePaymentProofUploadRequest',
            'sizeBytes',
          ),
          sha256: BuiltValueNullFieldError.checkNotNull(
            sha256,
            r'CreatePaymentProofUploadRequest',
            'sha256',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
