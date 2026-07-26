// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'private_image_metadata.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PrivateImageMetadataMimeTypeEnum
_$privateImageMetadataMimeTypeEnum_imageSlashJpeg =
    const PrivateImageMetadataMimeTypeEnum._('imageSlashJpeg');
const PrivateImageMetadataMimeTypeEnum
_$privateImageMetadataMimeTypeEnum_imageSlashPng =
    const PrivateImageMetadataMimeTypeEnum._('imageSlashPng');
const PrivateImageMetadataMimeTypeEnum
_$privateImageMetadataMimeTypeEnum_imageSlashWebp =
    const PrivateImageMetadataMimeTypeEnum._('imageSlashWebp');

PrivateImageMetadataMimeTypeEnum _$privateImageMetadataMimeTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'imageSlashJpeg':
      return _$privateImageMetadataMimeTypeEnum_imageSlashJpeg;
    case 'imageSlashPng':
      return _$privateImageMetadataMimeTypeEnum_imageSlashPng;
    case 'imageSlashWebp':
      return _$privateImageMetadataMimeTypeEnum_imageSlashWebp;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PrivateImageMetadataMimeTypeEnum>
_$privateImageMetadataMimeTypeEnumValues =
    BuiltSet<PrivateImageMetadataMimeTypeEnum>(
      const <PrivateImageMetadataMimeTypeEnum>[
        _$privateImageMetadataMimeTypeEnum_imageSlashJpeg,
        _$privateImageMetadataMimeTypeEnum_imageSlashPng,
        _$privateImageMetadataMimeTypeEnum_imageSlashWebp,
      ],
    );

Serializer<PrivateImageMetadataMimeTypeEnum>
_$privateImageMetadataMimeTypeEnumSerializer =
    _$PrivateImageMetadataMimeTypeEnumSerializer();

class _$PrivateImageMetadataMimeTypeEnumSerializer
    implements PrimitiveSerializer<PrivateImageMetadataMimeTypeEnum> {
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
  final Iterable<Type> types = const <Type>[PrivateImageMetadataMimeTypeEnum];
  @override
  final String wireName = 'PrivateImageMetadataMimeTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    PrivateImageMetadataMimeTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PrivateImageMetadataMimeTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PrivateImageMetadataMimeTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

abstract mixin class PrivateImageMetadataBuilder {
  void replace(PrivateImageMetadata other);
  void update(void Function(PrivateImageMetadataBuilder) updates);
  String? get fileName;
  set fileName(String? fileName);

  PrivateImageMetadataMimeTypeEnum? get mimeType;
  set mimeType(PrivateImageMetadataMimeTypeEnum? mimeType);

  int? get sizeBytes;
  set sizeBytes(int? sizeBytes);

  String? get sha256;
  set sha256(String? sha256);
}

class _$$PrivateImageMetadata extends $PrivateImageMetadata {
  @override
  final String fileName;
  @override
  final PrivateImageMetadataMimeTypeEnum mimeType;
  @override
  final int sizeBytes;
  @override
  final String sha256;

  factory _$$PrivateImageMetadata([
    void Function($PrivateImageMetadataBuilder)? updates,
  ]) => ($PrivateImageMetadataBuilder()..update(updates))._build();

  _$$PrivateImageMetadata._({
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    required this.sha256,
  }) : super._();
  @override
  $PrivateImageMetadata rebuild(
    void Function($PrivateImageMetadataBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  $PrivateImageMetadataBuilder toBuilder() =>
      $PrivateImageMetadataBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $PrivateImageMetadata &&
        fileName == other.fileName &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        sha256 == other.sha256;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, fileName.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$PrivateImageMetadata')
          ..add('fileName', fileName)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('sha256', sha256))
        .toString();
  }
}

class $PrivateImageMetadataBuilder
    implements
        Builder<$PrivateImageMetadata, $PrivateImageMetadataBuilder>,
        PrivateImageMetadataBuilder {
  _$$PrivateImageMetadata? _$v;

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

  $PrivateImageMetadataBuilder() {
    $PrivateImageMetadata._defaults(this);
  }

  $PrivateImageMetadataBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _fileName = $v.fileName;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _sha256 = $v.sha256;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $PrivateImageMetadata other) {
    _$v = other as _$$PrivateImageMetadata;
  }

  @override
  void update(void Function($PrivateImageMetadataBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $PrivateImageMetadata build() => _build();

  _$$PrivateImageMetadata _build() {
    final _$result =
        _$v ??
        _$$PrivateImageMetadata._(
          fileName: BuiltValueNullFieldError.checkNotNull(
            fileName,
            r'$PrivateImageMetadata',
            'fileName',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'$PrivateImageMetadata',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'$PrivateImageMetadata',
            'sizeBytes',
          ),
          sha256: BuiltValueNullFieldError.checkNotNull(
            sha256,
            r'$PrivateImageMetadata',
            'sha256',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
