// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'migration_batch_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const MigrationBatchCommandModeEnum _$migrationBatchCommandModeEnum_DRY_RUN =
    const MigrationBatchCommandModeEnum._('DRY_RUN');
const MigrationBatchCommandModeEnum _$migrationBatchCommandModeEnum_APPLY =
    const MigrationBatchCommandModeEnum._('APPLY');

MigrationBatchCommandModeEnum _$migrationBatchCommandModeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'DRY_RUN':
      return _$migrationBatchCommandModeEnum_DRY_RUN;
    case 'APPLY':
      return _$migrationBatchCommandModeEnum_APPLY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<MigrationBatchCommandModeEnum>
_$migrationBatchCommandModeEnumValues = BuiltSet<MigrationBatchCommandModeEnum>(
  const <MigrationBatchCommandModeEnum>[
    _$migrationBatchCommandModeEnum_DRY_RUN,
    _$migrationBatchCommandModeEnum_APPLY,
  ],
);

Serializer<MigrationBatchCommandModeEnum>
_$migrationBatchCommandModeEnumSerializer =
    _$MigrationBatchCommandModeEnumSerializer();

class _$MigrationBatchCommandModeEnumSerializer
    implements PrimitiveSerializer<MigrationBatchCommandModeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRY_RUN': 'DRY_RUN',
    'APPLY': 'APPLY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRY_RUN': 'DRY_RUN',
    'APPLY': 'APPLY',
  };

  @override
  final Iterable<Type> types = const <Type>[MigrationBatchCommandModeEnum];
  @override
  final String wireName = 'MigrationBatchCommandModeEnum';

  @override
  Object serialize(
    Serializers serializers,
    MigrationBatchCommandModeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  MigrationBatchCommandModeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => MigrationBatchCommandModeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$MigrationBatchCommand extends MigrationBatchCommand {
  @override
  final BuiltList<String> sourceUploadIds;
  @override
  final String mappingVersion;
  @override
  final String sourceChecksum;
  @override
  final MigrationBatchCommandModeEnum mode;
  @override
  final String? reason;

  factory _$MigrationBatchCommand([
    void Function(MigrationBatchCommandBuilder)? updates,
  ]) => (MigrationBatchCommandBuilder()..update(updates))._build();

  _$MigrationBatchCommand._({
    required this.sourceUploadIds,
    required this.mappingVersion,
    required this.sourceChecksum,
    required this.mode,
    this.reason,
  }) : super._();
  @override
  MigrationBatchCommand rebuild(
    void Function(MigrationBatchCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  MigrationBatchCommandBuilder toBuilder() =>
      MigrationBatchCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MigrationBatchCommand &&
        sourceUploadIds == other.sourceUploadIds &&
        mappingVersion == other.mappingVersion &&
        sourceChecksum == other.sourceChecksum &&
        mode == other.mode &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sourceUploadIds.hashCode);
    _$hash = $jc(_$hash, mappingVersion.hashCode);
    _$hash = $jc(_$hash, sourceChecksum.hashCode);
    _$hash = $jc(_$hash, mode.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MigrationBatchCommand')
          ..add('sourceUploadIds', sourceUploadIds)
          ..add('mappingVersion', mappingVersion)
          ..add('sourceChecksum', sourceChecksum)
          ..add('mode', mode)
          ..add('reason', reason))
        .toString();
  }
}

class MigrationBatchCommandBuilder
    implements Builder<MigrationBatchCommand, MigrationBatchCommandBuilder> {
  _$MigrationBatchCommand? _$v;

  ListBuilder<String>? _sourceUploadIds;
  ListBuilder<String> get sourceUploadIds =>
      _$this._sourceUploadIds ??= ListBuilder<String>();
  set sourceUploadIds(ListBuilder<String>? sourceUploadIds) =>
      _$this._sourceUploadIds = sourceUploadIds;

  String? _mappingVersion;
  String? get mappingVersion => _$this._mappingVersion;
  set mappingVersion(String? mappingVersion) =>
      _$this._mappingVersion = mappingVersion;

  String? _sourceChecksum;
  String? get sourceChecksum => _$this._sourceChecksum;
  set sourceChecksum(String? sourceChecksum) =>
      _$this._sourceChecksum = sourceChecksum;

  MigrationBatchCommandModeEnum? _mode;
  MigrationBatchCommandModeEnum? get mode => _$this._mode;
  set mode(MigrationBatchCommandModeEnum? mode) => _$this._mode = mode;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  MigrationBatchCommandBuilder() {
    MigrationBatchCommand._defaults(this);
  }

  MigrationBatchCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sourceUploadIds = $v.sourceUploadIds.toBuilder();
      _mappingVersion = $v.mappingVersion;
      _sourceChecksum = $v.sourceChecksum;
      _mode = $v.mode;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MigrationBatchCommand other) {
    _$v = other as _$MigrationBatchCommand;
  }

  @override
  void update(void Function(MigrationBatchCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MigrationBatchCommand build() => _build();

  _$MigrationBatchCommand _build() {
    _$MigrationBatchCommand _$result;
    try {
      _$result =
          _$v ??
          _$MigrationBatchCommand._(
            sourceUploadIds: sourceUploadIds.build(),
            mappingVersion: BuiltValueNullFieldError.checkNotNull(
              mappingVersion,
              r'MigrationBatchCommand',
              'mappingVersion',
            ),
            sourceChecksum: BuiltValueNullFieldError.checkNotNull(
              sourceChecksum,
              r'MigrationBatchCommand',
              'sourceChecksum',
            ),
            mode: BuiltValueNullFieldError.checkNotNull(
              mode,
              r'MigrationBatchCommand',
              'mode',
            ),
            reason: reason,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'sourceUploadIds';
        sourceUploadIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'MigrationBatchCommand',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
