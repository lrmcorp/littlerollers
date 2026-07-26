// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'replace_my_identity_document_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ReplaceMyIdentityDocumentRequestMimeTypeEnum
_$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashJpeg =
    const ReplaceMyIdentityDocumentRequestMimeTypeEnum._('imageSlashJpeg');
const ReplaceMyIdentityDocumentRequestMimeTypeEnum
_$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashPng =
    const ReplaceMyIdentityDocumentRequestMimeTypeEnum._('imageSlashPng');
const ReplaceMyIdentityDocumentRequestMimeTypeEnum
_$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashWebp =
    const ReplaceMyIdentityDocumentRequestMimeTypeEnum._('imageSlashWebp');

ReplaceMyIdentityDocumentRequestMimeTypeEnum
_$replaceMyIdentityDocumentRequestMimeTypeEnumValueOf(String name) {
  switch (name) {
    case 'imageSlashJpeg':
      return _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashJpeg;
    case 'imageSlashPng':
      return _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashPng;
    case 'imageSlashWebp':
      return _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashWebp;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ReplaceMyIdentityDocumentRequestMimeTypeEnum>
_$replaceMyIdentityDocumentRequestMimeTypeEnumValues =
    BuiltSet<ReplaceMyIdentityDocumentRequestMimeTypeEnum>(
      const <ReplaceMyIdentityDocumentRequestMimeTypeEnum>[
        _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashJpeg,
        _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashPng,
        _$replaceMyIdentityDocumentRequestMimeTypeEnum_imageSlashWebp,
      ],
    );

Serializer<ReplaceMyIdentityDocumentRequestMimeTypeEnum>
_$replaceMyIdentityDocumentRequestMimeTypeEnumSerializer =
    _$ReplaceMyIdentityDocumentRequestMimeTypeEnumSerializer();

class _$ReplaceMyIdentityDocumentRequestMimeTypeEnumSerializer
    implements
        PrimitiveSerializer<ReplaceMyIdentityDocumentRequestMimeTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'imageSlashJpeg': 'image/jpeg',
    'imageSlashPng': 'image/png',
    'imageSlashWebp': 'image/webp',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'image/jpeg': 'imageSlashJpeg',
    'image/png': 'imageSlashPng',
    'image/webp': 'imageSlashWebp',
  };

  @override
  final Iterable<Type> types = const <Type>[
    ReplaceMyIdentityDocumentRequestMimeTypeEnum,
  ];
  @override
  final String wireName = 'ReplaceMyIdentityDocumentRequestMimeTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    ReplaceMyIdentityDocumentRequestMimeTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  ReplaceMyIdentityDocumentRequestMimeTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => ReplaceMyIdentityDocumentRequestMimeTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$ReplaceMyIdentityDocumentRequest
    extends ReplaceMyIdentityDocumentRequest {
  @override
  final int expectedVersion;
  @override
  final String fileName;
  @override
  final PrivateImageMetadataMimeTypeEnum mimeType;
  @override
  final int sizeBytes;
  @override
  final String sha256;

  factory _$ReplaceMyIdentityDocumentRequest([
    void Function(ReplaceMyIdentityDocumentRequestBuilder)? updates,
  ]) => (ReplaceMyIdentityDocumentRequestBuilder()..update(updates))._build();

  _$ReplaceMyIdentityDocumentRequest._({
    required this.expectedVersion,
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    required this.sha256,
  }) : super._();
  @override
  ReplaceMyIdentityDocumentRequest rebuild(
    void Function(ReplaceMyIdentityDocumentRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ReplaceMyIdentityDocumentRequestBuilder toBuilder() =>
      ReplaceMyIdentityDocumentRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReplaceMyIdentityDocumentRequest &&
        expectedVersion == other.expectedVersion &&
        fileName == other.fileName &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        sha256 == other.sha256;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, fileName.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReplaceMyIdentityDocumentRequest')
          ..add('expectedVersion', expectedVersion)
          ..add('fileName', fileName)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('sha256', sha256))
        .toString();
  }
}

class ReplaceMyIdentityDocumentRequestBuilder
    implements
        Builder<
          ReplaceMyIdentityDocumentRequest,
          ReplaceMyIdentityDocumentRequestBuilder
        >,
        PrivateImageMetadataBuilder {
  _$ReplaceMyIdentityDocumentRequest? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(covariant int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _fileName;
  String? get fileName => _$this._fileName;
  set fileName(covariant String? fileName) => _$this._fileName = fileName;

  PrivateImageMetadataMimeTypeEnum? _mimeType;
  PrivateImageMetadataMimeTypeEnum? get mimeType => _$this._mimeType;
  set mimeType(covariant PrivateImageMetadataMimeTypeEnum? mimeType) =>
      _$this._mimeType = mimeType;

  int? _sizeBytes;
  int? get sizeBytes => _$this._sizeBytes;
  set sizeBytes(covariant int? sizeBytes) => _$this._sizeBytes = sizeBytes;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(covariant String? sha256) => _$this._sha256 = sha256;

  ReplaceMyIdentityDocumentRequestBuilder() {
    ReplaceMyIdentityDocumentRequest._defaults(this);
  }

  ReplaceMyIdentityDocumentRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _fileName = $v.fileName;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _sha256 = $v.sha256;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant ReplaceMyIdentityDocumentRequest other) {
    _$v = other as _$ReplaceMyIdentityDocumentRequest;
  }

  @override
  void update(void Function(ReplaceMyIdentityDocumentRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReplaceMyIdentityDocumentRequest build() => _build();

  _$ReplaceMyIdentityDocumentRequest _build() {
    final _$result =
        _$v ??
        _$ReplaceMyIdentityDocumentRequest._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ReplaceMyIdentityDocumentRequest',
            'expectedVersion',
          ),
          fileName: BuiltValueNullFieldError.checkNotNull(
            fileName,
            r'ReplaceMyIdentityDocumentRequest',
            'fileName',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'ReplaceMyIdentityDocumentRequest',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'ReplaceMyIdentityDocumentRequest',
            'sizeBytes',
          ),
          sha256: BuiltValueNullFieldError.checkNotNull(
            sha256,
            r'ReplaceMyIdentityDocumentRequest',
            'sha256',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
