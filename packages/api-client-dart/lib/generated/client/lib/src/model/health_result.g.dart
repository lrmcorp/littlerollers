// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const HealthResultStatusEnum _$healthResultStatusEnum_READY =
    const HealthResultStatusEnum._('READY');
const HealthResultStatusEnum _$healthResultStatusEnum_DEGRADED =
    const HealthResultStatusEnum._('DEGRADED');
const HealthResultStatusEnum _$healthResultStatusEnum_NOT_READY =
    const HealthResultStatusEnum._('NOT_READY');

HealthResultStatusEnum _$healthResultStatusEnumValueOf(String name) {
  switch (name) {
    case 'READY':
      return _$healthResultStatusEnum_READY;
    case 'DEGRADED':
      return _$healthResultStatusEnum_DEGRADED;
    case 'NOT_READY':
      return _$healthResultStatusEnum_NOT_READY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<HealthResultStatusEnum> _$healthResultStatusEnumValues =
    BuiltSet<HealthResultStatusEnum>(const <HealthResultStatusEnum>[
      _$healthResultStatusEnum_READY,
      _$healthResultStatusEnum_DEGRADED,
      _$healthResultStatusEnum_NOT_READY,
    ]);

Serializer<HealthResultStatusEnum> _$healthResultStatusEnumSerializer =
    _$HealthResultStatusEnumSerializer();

class _$HealthResultStatusEnumSerializer
    implements PrimitiveSerializer<HealthResultStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'READY': 'READY',
    'DEGRADED': 'DEGRADED',
    'NOT_READY': 'NOT_READY',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'READY': 'READY',
    'DEGRADED': 'DEGRADED',
    'NOT_READY': 'NOT_READY',
  };

  @override
  final Iterable<Type> types = const <Type>[HealthResultStatusEnum];
  @override
  final String wireName = 'HealthResultStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    HealthResultStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  HealthResultStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => HealthResultStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$HealthResult extends HealthResult {
  @override
  final HealthResultStatusEnum status;
  @override
  final DateTime checkedAt;
  @override
  final BuiltList<HealthResultDependenciesInner> dependencies;

  factory _$HealthResult([void Function(HealthResultBuilder)? updates]) =>
      (HealthResultBuilder()..update(updates))._build();

  _$HealthResult._({
    required this.status,
    required this.checkedAt,
    required this.dependencies,
  }) : super._();
  @override
  HealthResult rebuild(void Function(HealthResultBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HealthResultBuilder toBuilder() => HealthResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HealthResult &&
        status == other.status &&
        checkedAt == other.checkedAt &&
        dependencies == other.dependencies;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, checkedAt.hashCode);
    _$hash = $jc(_$hash, dependencies.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HealthResult')
          ..add('status', status)
          ..add('checkedAt', checkedAt)
          ..add('dependencies', dependencies))
        .toString();
  }
}

class HealthResultBuilder
    implements Builder<HealthResult, HealthResultBuilder> {
  _$HealthResult? _$v;

  HealthResultStatusEnum? _status;
  HealthResultStatusEnum? get status => _$this._status;
  set status(HealthResultStatusEnum? status) => _$this._status = status;

  DateTime? _checkedAt;
  DateTime? get checkedAt => _$this._checkedAt;
  set checkedAt(DateTime? checkedAt) => _$this._checkedAt = checkedAt;

  ListBuilder<HealthResultDependenciesInner>? _dependencies;
  ListBuilder<HealthResultDependenciesInner> get dependencies =>
      _$this._dependencies ??= ListBuilder<HealthResultDependenciesInner>();
  set dependencies(ListBuilder<HealthResultDependenciesInner>? dependencies) =>
      _$this._dependencies = dependencies;

  HealthResultBuilder() {
    HealthResult._defaults(this);
  }

  HealthResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _checkedAt = $v.checkedAt;
      _dependencies = $v.dependencies.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HealthResult other) {
    _$v = other as _$HealthResult;
  }

  @override
  void update(void Function(HealthResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HealthResult build() => _build();

  _$HealthResult _build() {
    _$HealthResult _$result;
    try {
      _$result =
          _$v ??
          _$HealthResult._(
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'HealthResult',
              'status',
            ),
            checkedAt: BuiltValueNullFieldError.checkNotNull(
              checkedAt,
              r'HealthResult',
              'checkedAt',
            ),
            dependencies: dependencies.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'dependencies';
        dependencies.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'HealthResult',
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
