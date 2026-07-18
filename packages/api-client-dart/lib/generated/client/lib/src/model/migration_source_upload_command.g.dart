// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_source_upload_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_CUSTOMER =
    const MigrationSourceUploadCommandSourceTypeEnum._('CUSTOMER');
const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_PACKAGE =
    const MigrationSourceUploadCommandSourceTypeEnum._('PACKAGE');
const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_BALANCE =
    const MigrationSourceUploadCommandSourceTypeEnum._('BALANCE');
const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_INSTRUCTOR =
    const MigrationSourceUploadCommandSourceTypeEnum._('INSTRUCTOR');
const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_RATE =
    const MigrationSourceUploadCommandSourceTypeEnum._('RATE');
const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_BOOKING =
    const MigrationSourceUploadCommandSourceTypeEnum._('BOOKING');
const MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnum_FINANCIAL_CONTROL =
    const MigrationSourceUploadCommandSourceTypeEnum._('FINANCIAL_CONTROL');

MigrationSourceUploadCommandSourceTypeEnum
_$migrationSourceUploadCommandSourceTypeEnumValueOf(String name) {
  switch (name) {
    case 'CUSTOMER':
      return _$migrationSourceUploadCommandSourceTypeEnum_CUSTOMER;
    case 'PACKAGE':
      return _$migrationSourceUploadCommandSourceTypeEnum_PACKAGE;
    case 'BALANCE':
      return _$migrationSourceUploadCommandSourceTypeEnum_BALANCE;
    case 'INSTRUCTOR':
      return _$migrationSourceUploadCommandSourceTypeEnum_INSTRUCTOR;
    case 'RATE':
      return _$migrationSourceUploadCommandSourceTypeEnum_RATE;
    case 'BOOKING':
      return _$migrationSourceUploadCommandSourceTypeEnum_BOOKING;
    case 'FINANCIAL_CONTROL':
      return _$migrationSourceUploadCommandSourceTypeEnum_FINANCIAL_CONTROL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MigrationSourceUploadCommandSourceTypeEnum>
_$migrationSourceUploadCommandSourceTypeEnumValues =
    BuiltSet<MigrationSourceUploadCommandSourceTypeEnum>(
      const <MigrationSourceUploadCommandSourceTypeEnum>[
        _$migrationSourceUploadCommandSourceTypeEnum_CUSTOMER,
        _$migrationSourceUploadCommandSourceTypeEnum_PACKAGE,
        _$migrationSourceUploadCommandSourceTypeEnum_BALANCE,
        _$migrationSourceUploadCommandSourceTypeEnum_INSTRUCTOR,
        _$migrationSourceUploadCommandSourceTypeEnum_RATE,
        _$migrationSourceUploadCommandSourceTypeEnum_BOOKING,
        _$migrationSourceUploadCommandSourceTypeEnum_FINANCIAL_CONTROL,
      ],
    );

Serializer<MigrationSourceUploadCommandSourceTypeEnum>
_$migrationSourceUploadCommandSourceTypeEnumSerializer =
    _$MigrationSourceUploadCommandSourceTypeEnumSerializer();

class _$MigrationSourceUploadCommandSourceTypeEnumSerializer
    implements PrimitiveSerializer<MigrationSourceUploadCommandSourceTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CUSTOMER': 'CUSTOMER',
    'PACKAGE': 'PACKAGE',
    'BALANCE': 'BALANCE',
    'INSTRUCTOR': 'INSTRUCTOR',
    'RATE': 'RATE',
    'BOOKING': 'BOOKING',
    'FINANCIAL_CONTROL': 'FINANCIAL_CONTROL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CUSTOMER': 'CUSTOMER',
    'PACKAGE': 'PACKAGE',
    'BALANCE': 'BALANCE',
    'INSTRUCTOR': 'INSTRUCTOR',
    'RATE': 'RATE',
    'BOOKING': 'BOOKING',
    'FINANCIAL_CONTROL': 'FINANCIAL_CONTROL',
  };

  @override
  final Iterable<Type> types = const <Type>[
    MigrationSourceUploadCommandSourceTypeEnum,
  ];
  @override
  final String wireName = 'MigrationSourceUploadCommandSourceTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    MigrationSourceUploadCommandSourceTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MigrationSourceUploadCommandSourceTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MigrationSourceUploadCommandSourceTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$MigrationSourceUploadCommand extends MigrationSourceUploadCommand {
  @override
  final String fileName;
  @override
  final String mimeType;
  @override
  final int sizeBytes;
  @override
  final String sha256;
  @override
  final MigrationSourceUploadCommandSourceTypeEnum sourceType;

  factory _$MigrationSourceUploadCommand([
    void Function(MigrationSourceUploadCommandBuilder)? updates,
  ]) => (MigrationSourceUploadCommandBuilder()..update(updates))._build();

  _$MigrationSourceUploadCommand._({
    required this.fileName,
    required this.mimeType,
    required this.sizeBytes,
    required this.sha256,
    required this.sourceType,
  }) : super._();
  @override
  MigrationSourceUploadCommand rebuild(
    void Function(MigrationSourceUploadCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationSourceUploadCommandBuilder toBuilder() =>
      MigrationSourceUploadCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationSourceUploadCommand &&
        fileName == other.fileName &&
        mimeType == other.mimeType &&
        sizeBytes == other.sizeBytes &&
        sha256 == other.sha256 &&
        sourceType == other.sourceType;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, fileName.hashCode);
    _$hash = $jc(_$hash, mimeType.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jc(_$hash, sourceType.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MigrationSourceUploadCommand')
          ..add('fileName', fileName)
          ..add('mimeType', mimeType)
          ..add('sizeBytes', sizeBytes)
          ..add('sha256', sha256)
          ..add('sourceType', sourceType))
        .toString();
  }
}

class MigrationSourceUploadCommandBuilder
    implements
        Builder<
          MigrationSourceUploadCommand,
          MigrationSourceUploadCommandBuilder
        > {
  _$MigrationSourceUploadCommand? _$v;

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

  MigrationSourceUploadCommandSourceTypeEnum? _sourceType;
  MigrationSourceUploadCommandSourceTypeEnum? get sourceType =>
      _$this._sourceType;
  set sourceType(MigrationSourceUploadCommandSourceTypeEnum? sourceType) =>
      _$this._sourceType = sourceType;

  MigrationSourceUploadCommandBuilder() {
    MigrationSourceUploadCommand._defaults(this);
  }

  MigrationSourceUploadCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _fileName = $v.fileName;
      _mimeType = $v.mimeType;
      _sizeBytes = $v.sizeBytes;
      _sha256 = $v.sha256;
      _sourceType = $v.sourceType;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MigrationSourceUploadCommand other) {
    _$v = other as _$MigrationSourceUploadCommand;
  }

  @override
  void update(void Function(MigrationSourceUploadCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationSourceUploadCommand build() => _build();

  _$MigrationSourceUploadCommand _build() {
    final _$result =
        _$v ??
        _$MigrationSourceUploadCommand._(
          fileName: BuiltValueNullFieldError.checkNotNull(
            fileName,
            r'MigrationSourceUploadCommand',
            'fileName',
          ),
          mimeType: BuiltValueNullFieldError.checkNotNull(
            mimeType,
            r'MigrationSourceUploadCommand',
            'mimeType',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'MigrationSourceUploadCommand',
            'sizeBytes',
          ),
          sha256: BuiltValueNullFieldError.checkNotNull(
            sha256,
            r'MigrationSourceUploadCommand',
            'sha256',
          ),
          sourceType: BuiltValueNullFieldError.checkNotNull(
            sourceType,
            r'MigrationSourceUploadCommand',
            'sourceType',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
