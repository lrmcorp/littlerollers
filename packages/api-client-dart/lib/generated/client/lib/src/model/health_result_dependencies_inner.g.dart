// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_result_dependencies_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const HealthResultDependenciesInnerStatusEnum
_$healthResultDependenciesInnerStatusEnum_READY =
    const HealthResultDependenciesInnerStatusEnum._('READY');
const HealthResultDependenciesInnerStatusEnum
_$healthResultDependenciesInnerStatusEnum_DEGRADED =
    const HealthResultDependenciesInnerStatusEnum._('DEGRADED');
const HealthResultDependenciesInnerStatusEnum
_$healthResultDependenciesInnerStatusEnum_NOT_READY =
    const HealthResultDependenciesInnerStatusEnum._('NOT_READY');

HealthResultDependenciesInnerStatusEnum
_$healthResultDependenciesInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'READY':
      return _$healthResultDependenciesInnerStatusEnum_READY;
    case 'DEGRADED':
      return _$healthResultDependenciesInnerStatusEnum_DEGRADED;
    case 'NOT_READY':
      return _$healthResultDependenciesInnerStatusEnum_NOT_READY;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<HealthResultDependenciesInnerStatusEnum>
_$healthResultDependenciesInnerStatusEnumValues =
    BuiltSet<HealthResultDependenciesInnerStatusEnum>(
      const <HealthResultDependenciesInnerStatusEnum>[
        _$healthResultDependenciesInnerStatusEnum_READY,
        _$healthResultDependenciesInnerStatusEnum_DEGRADED,
        _$healthResultDependenciesInnerStatusEnum_NOT_READY,
      ],
    );

Serializer<HealthResultDependenciesInnerStatusEnum>
_$healthResultDependenciesInnerStatusEnumSerializer =
    _$HealthResultDependenciesInnerStatusEnumSerializer();

class _$HealthResultDependenciesInnerStatusEnumSerializer
    implements PrimitiveSerializer<HealthResultDependenciesInnerStatusEnum> {
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
  final Iterable<Type> types = const <Type>[
    HealthResultDependenciesInnerStatusEnum,
  ];
  @override
  final String wireName = 'HealthResultDependenciesInnerStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    HealthResultDependenciesInnerStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  HealthResultDependenciesInnerStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => HealthResultDependenciesInnerStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$HealthResultDependenciesInner extends HealthResultDependenciesInner {
  @override
  final String name;
  @override
  final HealthResultDependenciesInnerStatusEnum status;
  @override
  final String? detailCode;

  factory _$HealthResultDependenciesInner([
    void Function(HealthResultDependenciesInnerBuilder)? updates,
  ]) => (HealthResultDependenciesInnerBuilder()..update(updates))._build();

  _$HealthResultDependenciesInner._({
    required this.name,
    required this.status,
    this.detailCode,
  }) : super._();
  @override
  HealthResultDependenciesInner rebuild(
    void Function(HealthResultDependenciesInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  HealthResultDependenciesInnerBuilder toBuilder() =>
      HealthResultDependenciesInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HealthResultDependenciesInner &&
        name == other.name &&
        status == other.status &&
        detailCode == other.detailCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, detailCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HealthResultDependenciesInner')
          ..add('name', name)
          ..add('status', status)
          ..add('detailCode', detailCode))
        .toString();
  }
}

class HealthResultDependenciesInnerBuilder
    implements
        Builder<
          HealthResultDependenciesInner,
          HealthResultDependenciesInnerBuilder
        > {
  _$HealthResultDependenciesInner? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  HealthResultDependenciesInnerStatusEnum? _status;
  HealthResultDependenciesInnerStatusEnum? get status => _$this._status;
  set status(HealthResultDependenciesInnerStatusEnum? status) =>
      _$this._status = status;

  String? _detailCode;
  String? get detailCode => _$this._detailCode;
  set detailCode(String? detailCode) => _$this._detailCode = detailCode;

  HealthResultDependenciesInnerBuilder() {
    HealthResultDependenciesInner._defaults(this);
  }

  HealthResultDependenciesInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _status = $v.status;
      _detailCode = $v.detailCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HealthResultDependenciesInner other) {
    _$v = other as _$HealthResultDependenciesInner;
  }

  @override
  void update(void Function(HealthResultDependenciesInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HealthResultDependenciesInner build() => _build();

  _$HealthResultDependenciesInner _build() {
    final _$result =
        _$v ??
        _$HealthResultDependenciesInner._(
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'HealthResultDependenciesInner',
            'name',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'HealthResultDependenciesInner',
            'status',
          ),
          detailCode: detailCode,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
