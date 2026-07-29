// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_promotion.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PackagePromotionStatusEnum _$packagePromotionStatusEnum_DRAFT =
    const PackagePromotionStatusEnum._('DRAFT');
const PackagePromotionStatusEnum _$packagePromotionStatusEnum_ACTIVE =
    const PackagePromotionStatusEnum._('ACTIVE');
const PackagePromotionStatusEnum _$packagePromotionStatusEnum_PAUSED =
    const PackagePromotionStatusEnum._('PAUSED');
const PackagePromotionStatusEnum _$packagePromotionStatusEnum_ARCHIVED =
    const PackagePromotionStatusEnum._('ARCHIVED');

PackagePromotionStatusEnum _$packagePromotionStatusEnumValueOf(String name) {
  switch (name) {
    case 'DRAFT':
      return _$packagePromotionStatusEnum_DRAFT;
    case 'ACTIVE':
      return _$packagePromotionStatusEnum_ACTIVE;
    case 'PAUSED':
      return _$packagePromotionStatusEnum_PAUSED;
    case 'ARCHIVED':
      return _$packagePromotionStatusEnum_ARCHIVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PackagePromotionStatusEnum> _$packagePromotionStatusEnumValues =
    BuiltSet<PackagePromotionStatusEnum>(const <PackagePromotionStatusEnum>[
      _$packagePromotionStatusEnum_DRAFT,
      _$packagePromotionStatusEnum_ACTIVE,
      _$packagePromotionStatusEnum_PAUSED,
      _$packagePromotionStatusEnum_ARCHIVED,
    ]);

const PackagePromotionEffectiveStateEnum
_$packagePromotionEffectiveStateEnum_SCHEDULED =
    const PackagePromotionEffectiveStateEnum._('SCHEDULED');
const PackagePromotionEffectiveStateEnum
_$packagePromotionEffectiveStateEnum_LIVE =
    const PackagePromotionEffectiveStateEnum._('LIVE');
const PackagePromotionEffectiveStateEnum
_$packagePromotionEffectiveStateEnum_EXPIRED =
    const PackagePromotionEffectiveStateEnum._('EXPIRED');
const PackagePromotionEffectiveStateEnum
_$packagePromotionEffectiveStateEnum_DRAFT =
    const PackagePromotionEffectiveStateEnum._('DRAFT');
const PackagePromotionEffectiveStateEnum
_$packagePromotionEffectiveStateEnum_PAUSED =
    const PackagePromotionEffectiveStateEnum._('PAUSED');
const PackagePromotionEffectiveStateEnum
_$packagePromotionEffectiveStateEnum_ARCHIVED =
    const PackagePromotionEffectiveStateEnum._('ARCHIVED');

PackagePromotionEffectiveStateEnum _$packagePromotionEffectiveStateEnumValueOf(
  String name,
) {
  switch (name) {
    case 'SCHEDULED':
      return _$packagePromotionEffectiveStateEnum_SCHEDULED;
    case 'LIVE':
      return _$packagePromotionEffectiveStateEnum_LIVE;
    case 'EXPIRED':
      return _$packagePromotionEffectiveStateEnum_EXPIRED;
    case 'DRAFT':
      return _$packagePromotionEffectiveStateEnum_DRAFT;
    case 'PAUSED':
      return _$packagePromotionEffectiveStateEnum_PAUSED;
    case 'ARCHIVED':
      return _$packagePromotionEffectiveStateEnum_ARCHIVED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PackagePromotionEffectiveStateEnum>
_$packagePromotionEffectiveStateEnumValues =
    BuiltSet<PackagePromotionEffectiveStateEnum>(
      const <PackagePromotionEffectiveStateEnum>[
        _$packagePromotionEffectiveStateEnum_SCHEDULED,
        _$packagePromotionEffectiveStateEnum_LIVE,
        _$packagePromotionEffectiveStateEnum_EXPIRED,
        _$packagePromotionEffectiveStateEnum_DRAFT,
        _$packagePromotionEffectiveStateEnum_PAUSED,
        _$packagePromotionEffectiveStateEnum_ARCHIVED,
      ],
    );

const PackagePromotionDiscountTypeEnum
_$packagePromotionDiscountTypeEnum_PERCENTAGE =
    const PackagePromotionDiscountTypeEnum._('PERCENTAGE');
const PackagePromotionDiscountTypeEnum
_$packagePromotionDiscountTypeEnum_FIXED_AMOUNT =
    const PackagePromotionDiscountTypeEnum._('FIXED_AMOUNT');

PackagePromotionDiscountTypeEnum _$packagePromotionDiscountTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PERCENTAGE':
      return _$packagePromotionDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$packagePromotionDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PackagePromotionDiscountTypeEnum>
_$packagePromotionDiscountTypeEnumValues =
    BuiltSet<PackagePromotionDiscountTypeEnum>(
      const <PackagePromotionDiscountTypeEnum>[
        _$packagePromotionDiscountTypeEnum_PERCENTAGE,
        _$packagePromotionDiscountTypeEnum_FIXED_AMOUNT,
      ],
    );

Serializer<PackagePromotionStatusEnum> _$packagePromotionStatusEnumSerializer =
    _$PackagePromotionStatusEnumSerializer();
Serializer<PackagePromotionEffectiveStateEnum>
_$packagePromotionEffectiveStateEnumSerializer =
    _$PackagePromotionEffectiveStateEnumSerializer();
Serializer<PackagePromotionDiscountTypeEnum>
_$packagePromotionDiscountTypeEnumSerializer =
    _$PackagePromotionDiscountTypeEnumSerializer();

class _$PackagePromotionStatusEnumSerializer
    implements PrimitiveSerializer<PackagePromotionStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'PAUSED',
    'ARCHIVED': 'ARCHIVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'PAUSED',
    'ARCHIVED': 'ARCHIVED',
  };

  @override
  final Iterable<Type> types = const <Type>[PackagePromotionStatusEnum];
  @override
  final String wireName = 'PackagePromotionStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PackagePromotionStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PackagePromotionStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PackagePromotionEffectiveStateEnumSerializer
    implements PrimitiveSerializer<PackagePromotionEffectiveStateEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'SCHEDULED': 'SCHEDULED',
    'LIVE': 'LIVE',
    'EXPIRED': 'EXPIRED',
    'DRAFT': 'DRAFT',
    'PAUSED': 'PAUSED',
    'ARCHIVED': 'ARCHIVED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'SCHEDULED': 'SCHEDULED',
    'LIVE': 'LIVE',
    'EXPIRED': 'EXPIRED',
    'DRAFT': 'DRAFT',
    'PAUSED': 'PAUSED',
    'ARCHIVED': 'ARCHIVED',
  };

  @override
  final Iterable<Type> types = const <Type>[PackagePromotionEffectiveStateEnum];
  @override
  final String wireName = 'PackagePromotionEffectiveStateEnum';

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionEffectiveStateEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PackagePromotionEffectiveStateEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PackagePromotionEffectiveStateEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PackagePromotionDiscountTypeEnumSerializer
    implements PrimitiveSerializer<PackagePromotionDiscountTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[PackagePromotionDiscountTypeEnum];
  @override
  final String wireName = 'PackagePromotionDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PackagePromotionDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PackagePromotionDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PackagePromotion extends PackagePromotion {
  @override
  final String id;
  @override
  final String packageId;
  @override
  final String name;
  @override
  final String label;
  @override
  final PackagePromotionStatusEnum status;
  @override
  final PackagePromotionEffectiveStateEnum effectiveState;
  @override
  final PackagePromotionDiscountTypeEnum discountType;
  @override
  final int discountValue;
  @override
  final int discountRp;
  @override
  final int promotionalPriceRp;
  @override
  final DateTime activeFrom;
  @override
  final DateTime activeUntil;
  @override
  final int version;
  @override
  final int? usageCount;

  factory _$PackagePromotion([
    void Function(PackagePromotionBuilder)? updates,
  ]) => (PackagePromotionBuilder()..update(updates))._build();

  _$PackagePromotion._({
    required this.id,
    required this.packageId,
    required this.name,
    required this.label,
    required this.status,
    required this.effectiveState,
    required this.discountType,
    required this.discountValue,
    required this.discountRp,
    required this.promotionalPriceRp,
    required this.activeFrom,
    required this.activeUntil,
    required this.version,
    this.usageCount,
  }) : super._();
  @override
  PackagePromotion rebuild(void Function(PackagePromotionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PackagePromotionBuilder toBuilder() =>
      PackagePromotionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackagePromotion &&
        id == other.id &&
        packageId == other.packageId &&
        name == other.name &&
        label == other.label &&
        status == other.status &&
        effectiveState == other.effectiveState &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        discountRp == other.discountRp &&
        promotionalPriceRp == other.promotionalPriceRp &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        version == other.version &&
        usageCount == other.usageCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, effectiveState.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, discountRp.hashCode);
    _$hash = $jc(_$hash, promotionalPriceRp.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, usageCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackagePromotion')
          ..add('id', id)
          ..add('packageId', packageId)
          ..add('name', name)
          ..add('label', label)
          ..add('status', status)
          ..add('effectiveState', effectiveState)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('discountRp', discountRp)
          ..add('promotionalPriceRp', promotionalPriceRp)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('version', version)
          ..add('usageCount', usageCount))
        .toString();
  }
}

class PackagePromotionBuilder
    implements Builder<PackagePromotion, PackagePromotionBuilder> {
  _$PackagePromotion? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  PackagePromotionStatusEnum? _status;
  PackagePromotionStatusEnum? get status => _$this._status;
  set status(PackagePromotionStatusEnum? status) => _$this._status = status;

  PackagePromotionEffectiveStateEnum? _effectiveState;
  PackagePromotionEffectiveStateEnum? get effectiveState =>
      _$this._effectiveState;
  set effectiveState(PackagePromotionEffectiveStateEnum? effectiveState) =>
      _$this._effectiveState = effectiveState;

  PackagePromotionDiscountTypeEnum? _discountType;
  PackagePromotionDiscountTypeEnum? get discountType => _$this._discountType;
  set discountType(PackagePromotionDiscountTypeEnum? discountType) =>
      _$this._discountType = discountType;

  int? _discountValue;
  int? get discountValue => _$this._discountValue;
  set discountValue(int? discountValue) =>
      _$this._discountValue = discountValue;

  int? _discountRp;
  int? get discountRp => _$this._discountRp;
  set discountRp(int? discountRp) => _$this._discountRp = discountRp;

  int? _promotionalPriceRp;
  int? get promotionalPriceRp => _$this._promotionalPriceRp;
  set promotionalPriceRp(int? promotionalPriceRp) =>
      _$this._promotionalPriceRp = promotionalPriceRp;

  DateTime? _activeFrom;
  DateTime? get activeFrom => _$this._activeFrom;
  set activeFrom(DateTime? activeFrom) => _$this._activeFrom = activeFrom;

  DateTime? _activeUntil;
  DateTime? get activeUntil => _$this._activeUntil;
  set activeUntil(DateTime? activeUntil) => _$this._activeUntil = activeUntil;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  int? _usageCount;
  int? get usageCount => _$this._usageCount;
  set usageCount(int? usageCount) => _$this._usageCount = usageCount;

  PackagePromotionBuilder() {
    PackagePromotion._defaults(this);
  }

  PackagePromotionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _packageId = $v.packageId;
      _name = $v.name;
      _label = $v.label;
      _status = $v.status;
      _effectiveState = $v.effectiveState;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _discountRp = $v.discountRp;
      _promotionalPriceRp = $v.promotionalPriceRp;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _version = $v.version;
      _usageCount = $v.usageCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackagePromotion other) {
    _$v = other as _$PackagePromotion;
  }

  @override
  void update(void Function(PackagePromotionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackagePromotion build() => _build();

  _$PackagePromotion _build() {
    final _$result =
        _$v ??
        _$PackagePromotion._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PackagePromotion',
            'id',
          ),
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'PackagePromotion',
            'packageId',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PackagePromotion',
            'name',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'PackagePromotion',
            'label',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'PackagePromotion',
            'status',
          ),
          effectiveState: BuiltValueNullFieldError.checkNotNull(
            effectiveState,
            r'PackagePromotion',
            'effectiveState',
          ),
          discountType: BuiltValueNullFieldError.checkNotNull(
            discountType,
            r'PackagePromotion',
            'discountType',
          ),
          discountValue: BuiltValueNullFieldError.checkNotNull(
            discountValue,
            r'PackagePromotion',
            'discountValue',
          ),
          discountRp: BuiltValueNullFieldError.checkNotNull(
            discountRp,
            r'PackagePromotion',
            'discountRp',
          ),
          promotionalPriceRp: BuiltValueNullFieldError.checkNotNull(
            promotionalPriceRp,
            r'PackagePromotion',
            'promotionalPriceRp',
          ),
          activeFrom: BuiltValueNullFieldError.checkNotNull(
            activeFrom,
            r'PackagePromotion',
            'activeFrom',
          ),
          activeUntil: BuiltValueNullFieldError.checkNotNull(
            activeUntil,
            r'PackagePromotion',
            'activeUntil',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'PackagePromotion',
            'version',
          ),
          usageCount: usageCount,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
