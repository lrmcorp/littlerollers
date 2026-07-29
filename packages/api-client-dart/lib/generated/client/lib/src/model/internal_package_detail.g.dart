// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'internal_package_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const InternalPackageDetailStatusEnum _$internalPackageDetailStatusEnum_ACTIVE =
    const InternalPackageDetailStatusEnum._('ACTIVE');
const InternalPackageDetailStatusEnum
_$internalPackageDetailStatusEnum_INACTIVE =
    const InternalPackageDetailStatusEnum._('INACTIVE');

InternalPackageDetailStatusEnum _$internalPackageDetailStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$internalPackageDetailStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$internalPackageDetailStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<InternalPackageDetailStatusEnum>
_$internalPackageDetailStatusEnumValues =
    BuiltSet<InternalPackageDetailStatusEnum>(
      const <InternalPackageDetailStatusEnum>[
        _$internalPackageDetailStatusEnum_ACTIVE,
        _$internalPackageDetailStatusEnum_INACTIVE,
      ],
    );

Serializer<InternalPackageDetailStatusEnum>
_$internalPackageDetailStatusEnumSerializer =
    _$InternalPackageDetailStatusEnumSerializer();

class _$InternalPackageDetailStatusEnumSerializer
    implements PrimitiveSerializer<InternalPackageDetailStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[InternalPackageDetailStatusEnum];
  @override
  final String wireName = 'InternalPackageDetailStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    InternalPackageDetailStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  InternalPackageDetailStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => InternalPackageDetailStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$InternalPackageDetail extends InternalPackageDetail {
  @override
  final BuiltList<PackagePromotion> promotions;
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

  factory _$InternalPackageDetail([
    void Function(InternalPackageDetailBuilder)? updates,
  ]) => (InternalPackageDetailBuilder()..update(updates))._build();

  _$InternalPackageDetail._({
    required this.promotions,
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
  InternalPackageDetail rebuild(
    void Function(InternalPackageDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  InternalPackageDetailBuilder toBuilder() =>
      InternalPackageDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is InternalPackageDetail &&
        promotions == other.promotions &&
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
    _$hash = $jc(_$hash, promotions.hashCode);
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
    return (newBuiltValueToStringHelper(r'InternalPackageDetail')
          ..add('promotions', promotions)
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

class InternalPackageDetailBuilder
    implements
        Builder<InternalPackageDetail, InternalPackageDetailBuilder>,
        PackageBuilder {
  _$InternalPackageDetail? _$v;

  ListBuilder<PackagePromotion>? _promotions;
  ListBuilder<PackagePromotion> get promotions =>
      _$this._promotions ??= ListBuilder<PackagePromotion>();
  set promotions(covariant ListBuilder<PackagePromotion>? promotions) =>
      _$this._promotions = promotions;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(covariant String? classTypeId) =>
      _$this._classTypeId = classTypeId;

  String? _businessKey;
  String? get businessKey => _$this._businessKey;
  set businessKey(covariant String? businessKey) =>
      _$this._businessKey = businessKey;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(covariant int? sessionCount) =>
      _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(covariant int? durationDays) =>
      _$this._durationDays = durationDays;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(covariant int? priceRp) => _$this._priceRp = priceRp;

  PackageStatusEnum? _status;
  PackageStatusEnum? get status => _$this._status;
  set status(covariant PackageStatusEnum? status) => _$this._status = status;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(covariant Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(covariant Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  int? _version;
  int? get version => _$this._version;
  set version(covariant int? version) => _$this._version = version;

  InternalPackageDetailBuilder() {
    InternalPackageDetail._defaults(this);
  }

  InternalPackageDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _promotions = $v.promotions.toBuilder();
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
  void replace(covariant InternalPackageDetail other) {
    _$v = other as _$InternalPackageDetail;
  }

  @override
  void update(void Function(InternalPackageDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  InternalPackageDetail build() => _build();

  _$InternalPackageDetail _build() {
    _$InternalPackageDetail _$result;
    try {
      _$result =
          _$v ??
          _$InternalPackageDetail._(
            promotions: promotions.build(),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'InternalPackageDetail',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'InternalPackageDetail',
              'branchId',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'InternalPackageDetail',
              'classTypeId',
            ),
            businessKey: BuiltValueNullFieldError.checkNotNull(
              businessKey,
              r'InternalPackageDetail',
              'businessKey',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'InternalPackageDetail',
              'name',
            ),
            sessionCount: BuiltValueNullFieldError.checkNotNull(
              sessionCount,
              r'InternalPackageDetail',
              'sessionCount',
            ),
            durationDays: BuiltValueNullFieldError.checkNotNull(
              durationDays,
              r'InternalPackageDetail',
              'durationDays',
            ),
            priceRp: BuiltValueNullFieldError.checkNotNull(
              priceRp,
              r'InternalPackageDetail',
              'priceRp',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'InternalPackageDetail',
              'status',
            ),
            effectiveFrom: BuiltValueNullFieldError.checkNotNull(
              effectiveFrom,
              r'InternalPackageDetail',
              'effectiveFrom',
            ),
            effectiveUntil: effectiveUntil,
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'InternalPackageDetail',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'promotions';
        promotions.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'InternalPackageDetail',
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
