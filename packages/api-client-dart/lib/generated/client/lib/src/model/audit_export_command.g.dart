// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_export_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AuditExportCommandFormatEnum _$auditExportCommandFormatEnum_CSV =
    const AuditExportCommandFormatEnum._('CSV');
const AuditExportCommandFormatEnum _$auditExportCommandFormatEnum_JSONL =
    const AuditExportCommandFormatEnum._('JSONL');

AuditExportCommandFormatEnum _$auditExportCommandFormatEnumValueOf(
  String name,
) {
  switch (name) {
    case 'CSV':
      return _$auditExportCommandFormatEnum_CSV;
    case 'JSONL':
      return _$auditExportCommandFormatEnum_JSONL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AuditExportCommandFormatEnum>
_$auditExportCommandFormatEnumValues = BuiltSet<AuditExportCommandFormatEnum>(
  const <AuditExportCommandFormatEnum>[
    _$auditExportCommandFormatEnum_CSV,
    _$auditExportCommandFormatEnum_JSONL,
  ],
);

Serializer<AuditExportCommandFormatEnum>
_$auditExportCommandFormatEnumSerializer =
    _$AuditExportCommandFormatEnumSerializer();

class _$AuditExportCommandFormatEnumSerializer
    implements PrimitiveSerializer<AuditExportCommandFormatEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CSV': 'CSV',
    'JSONL': 'JSONL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CSV': 'CSV',
    'JSONL': 'JSONL',
  };

  @override
  final Iterable<Type> types = const <Type>[AuditExportCommandFormatEnum];
  @override
  final String wireName = 'AuditExportCommandFormatEnum';

  @override
  Object serialize(
    Serializers serializers,
    AuditExportCommandFormatEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AuditExportCommandFormatEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AuditExportCommandFormatEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AuditExportCommand extends AuditExportCommand {
  @override
  final BuiltList<String> branchIds;
  @override
  final DateTime from;
  @override
  final DateTime to;
  @override
  final String? actorId;
  @override
  final String? objectType;
  @override
  final AuditExportCommandFormatEnum format;
  @override
  final String reason;

  factory _$AuditExportCommand([
    void Function(AuditExportCommandBuilder)? updates,
  ]) => (AuditExportCommandBuilder()..update(updates))._build();

  _$AuditExportCommand._({
    required this.branchIds,
    required this.from,
    required this.to,
    this.actorId,
    this.objectType,
    required this.format,
    required this.reason,
  }) : super._();
  @override
  AuditExportCommand rebuild(
    void Function(AuditExportCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AuditExportCommandBuilder toBuilder() =>
      AuditExportCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditExportCommand &&
        branchIds == other.branchIds &&
        from == other.from &&
        to == other.to &&
        actorId == other.actorId &&
        objectType == other.objectType &&
        format == other.format &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jc(_$hash, from.hashCode);
    _$hash = $jc(_$hash, to.hashCode);
    _$hash = $jc(_$hash, actorId.hashCode);
    _$hash = $jc(_$hash, objectType.hashCode);
    _$hash = $jc(_$hash, format.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuditExportCommand')
          ..add('branchIds', branchIds)
          ..add('from', from)
          ..add('to', to)
          ..add('actorId', actorId)
          ..add('objectType', objectType)
          ..add('format', format)
          ..add('reason', reason))
        .toString();
  }
}

class AuditExportCommandBuilder
    implements Builder<AuditExportCommand, AuditExportCommandBuilder> {
  _$AuditExportCommand? _$v;

  ListBuilder<String>? _branchIds;
  ListBuilder<String> get branchIds =>
      _$this._branchIds ??= ListBuilder<String>();
  set branchIds(ListBuilder<String>? branchIds) =>
      _$this._branchIds = branchIds;

  DateTime? _from;
  DateTime? get from => _$this._from;
  set from(DateTime? from) => _$this._from = from;

  DateTime? _to;
  DateTime? get to => _$this._to;
  set to(DateTime? to) => _$this._to = to;

  String? _actorId;
  String? get actorId => _$this._actorId;
  set actorId(String? actorId) => _$this._actorId = actorId;

  String? _objectType;
  String? get objectType => _$this._objectType;
  set objectType(String? objectType) => _$this._objectType = objectType;

  AuditExportCommandFormatEnum? _format;
  AuditExportCommandFormatEnum? get format => _$this._format;
  set format(AuditExportCommandFormatEnum? format) => _$this._format = format;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  AuditExportCommandBuilder() {
    AuditExportCommand._defaults(this);
  }

  AuditExportCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchIds = $v.branchIds.toBuilder();
      _from = $v.from;
      _to = $v.to;
      _actorId = $v.actorId;
      _objectType = $v.objectType;
      _format = $v.format;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuditExportCommand other) {
    _$v = other as _$AuditExportCommand;
  }

  @override
  void update(void Function(AuditExportCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditExportCommand build() => _build();

  _$AuditExportCommand _build() {
    _$AuditExportCommand _$result;
    try {
      _$result =
          _$v ??
          _$AuditExportCommand._(
            branchIds: branchIds.build(),
            from: BuiltValueNullFieldError.checkNotNull(
              from,
              r'AuditExportCommand',
              'from',
            ),
            to: BuiltValueNullFieldError.checkNotNull(
              to,
              r'AuditExportCommand',
              'to',
            ),
            actorId: actorId,
            objectType: objectType,
            format: BuiltValueNullFieldError.checkNotNull(
              format,
              r'AuditExportCommand',
              'format',
            ),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'AuditExportCommand',
              'reason',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branchIds';
        branchIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AuditExportCommand',
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
