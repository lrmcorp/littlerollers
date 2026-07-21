// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PackageStatusEnum _$packageStatusEnum_ACTIVE = const PackageStatusEnum._(
  'ACTIVE',
);
const PackageStatusEnum _$packageStatusEnum_INACTIVE =
    const PackageStatusEnum._('INACTIVE');

PackageStatusEnum _$packageStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$packageStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$packageStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PackageStatusEnum> _$packageStatusEnumValues =
    BuiltSet<PackageStatusEnum>(const <PackageStatusEnum>[
      _$packageStatusEnum_ACTIVE,
      _$packageStatusEnum_INACTIVE,
    ]);

Serializer<PackageStatusEnum> _$packageStatusEnumSerializer =
    _$PackageStatusEnumSerializer();

class _$PackageStatusEnumSerializer
    implements PrimitiveSerializer<PackageStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[PackageStatusEnum];
  @override
  final String wireName = 'PackageStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PackageStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PackageStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PackageStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Package extends Package {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final String businessKey;
  @override
  final String name;
  @override
  final int sessionCount;
  @override
  final int durationDays;
  @override
  final int priceRp;
  @override
  final PackageStatusEnum status;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;
  @override
  final int version;

  factory _$Package([void Function(PackageBuilder)? updates]) =>
      (PackageBuilder()..update(updates))._build();

  _$Package._({
    required this.id,
    required this.branchId,
    required this.classTypeId,
    required this.businessKey,
    required this.name,
    required this.sessionCount,
    required this.durationDays,
    required this.priceRp,
    required this.status,
    required this.effectiveFrom,
    this.effectiveUntil,
    required this.version,
  }) : super._();
  @override
  Package rebuild(void Function(PackageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PackageBuilder toBuilder() => PackageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Package &&
        id == other.id &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        businessKey == other.businessKey &&
        name == other.name &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        status == other.status &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, businessKey.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Package')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('businessKey', businessKey)
          ..add('name', name)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('status', status)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil)
          ..add('version', version))
        .toString();
  }
}

class PackageBuilder implements Builder<Package, PackageBuilder> {
  _$Package? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

  String? _businessKey;
  String? get businessKey => _$this._businessKey;
  set businessKey(String? businessKey) => _$this._businessKey = businessKey;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(int? durationDays) => _$this._durationDays = durationDays;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(int? priceRp) => _$this._priceRp = priceRp;

  PackageStatusEnum? _status;
  PackageStatusEnum? get status => _$this._status;
  set status(PackageStatusEnum? status) => _$this._status = status;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  PackageBuilder() {
    Package._defaults(this);
  }

  PackageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _businessKey = $v.businessKey;
      _name = $v.name;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _priceRp = $v.priceRp;
      _status = $v.status;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Package other) {
    _$v = other as _$Package;
  }

  @override
  void update(void Function(PackageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Package build() => _build();

  _$Package _build() {
    final _$result =
        _$v ??
        _$Package._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Package', 'id'),
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'Package',
            'branchId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'Package',
            'classTypeId',
          ),
          businessKey: BuiltValueNullFieldError.checkNotNull(
            businessKey,
            r'Package',
            'businessKey',
          ),
          name: BuiltValueNullFieldError.checkNotNull(name, r'Package', 'name'),
          sessionCount: BuiltValueNullFieldError.checkNotNull(
            sessionCount,
            r'Package',
            'sessionCount',
          ),
          durationDays: BuiltValueNullFieldError.checkNotNull(
            durationDays,
            r'Package',
            'durationDays',
          ),
          priceRp: BuiltValueNullFieldError.checkNotNull(
            priceRp,
            r'Package',
            'priceRp',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'Package',
            'status',
          ),
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'Package',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'Package',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
