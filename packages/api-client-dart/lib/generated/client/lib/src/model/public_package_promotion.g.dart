// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_package_promotion.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PublicPackagePromotionDiscountTypeEnum
_$publicPackagePromotionDiscountTypeEnum_PERCENTAGE =
    const PublicPackagePromotionDiscountTypeEnum._('PERCENTAGE');
const PublicPackagePromotionDiscountTypeEnum
_$publicPackagePromotionDiscountTypeEnum_FIXED_AMOUNT =
    const PublicPackagePromotionDiscountTypeEnum._('FIXED_AMOUNT');

PublicPackagePromotionDiscountTypeEnum
_$publicPackagePromotionDiscountTypeEnumValueOf(String name) {
  switch (name) {
    case 'PERCENTAGE':
      return _$publicPackagePromotionDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$publicPackagePromotionDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PublicPackagePromotionDiscountTypeEnum>
_$publicPackagePromotionDiscountTypeEnumValues =
    BuiltSet<PublicPackagePromotionDiscountTypeEnum>(
      const <PublicPackagePromotionDiscountTypeEnum>[
        _$publicPackagePromotionDiscountTypeEnum_PERCENTAGE,
        _$publicPackagePromotionDiscountTypeEnum_FIXED_AMOUNT,
      ],
    );

Serializer<PublicPackagePromotionDiscountTypeEnum>
_$publicPackagePromotionDiscountTypeEnumSerializer =
    _$PublicPackagePromotionDiscountTypeEnumSerializer();

class _$PublicPackagePromotionDiscountTypeEnumSerializer
    implements PrimitiveSerializer<PublicPackagePromotionDiscountTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    PublicPackagePromotionDiscountTypeEnum,
  ];
  @override
  final String wireName = 'PublicPackagePromotionDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    PublicPackagePromotionDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PublicPackagePromotionDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PublicPackagePromotionDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PublicPackagePromotion extends PublicPackagePromotion {
  @override
  final String id;
  @override
  final String name;
  @override
  final String label;
  @override
  final PublicPackagePromotionDiscountTypeEnum discountType;
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

  factory _$PublicPackagePromotion([
    void Function(PublicPackagePromotionBuilder)? updates,
  ]) => (PublicPackagePromotionBuilder()..update(updates))._build();

  _$PublicPackagePromotion._({
    required this.id,
    required this.name,
    required this.label,
    required this.discountType,
    required this.discountValue,
    required this.discountRp,
    required this.promotionalPriceRp,
    required this.activeFrom,
    required this.activeUntil,
    required this.version,
  }) : super._();
  @override
  PublicPackagePromotion rebuild(
    void Function(PublicPackagePromotionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicPackagePromotionBuilder toBuilder() =>
      PublicPackagePromotionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicPackagePromotion &&
        id == other.id &&
        name == other.name &&
        label == other.label &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        discountRp == other.discountRp &&
        promotionalPriceRp == other.promotionalPriceRp &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, discountRp.hashCode);
    _$hash = $jc(_$hash, promotionalPriceRp.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicPackagePromotion')
          ..add('id', id)
          ..add('name', name)
          ..add('label', label)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('discountRp', discountRp)
          ..add('promotionalPriceRp', promotionalPriceRp)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('version', version))
        .toString();
  }
}

class PublicPackagePromotionBuilder
    implements Builder<PublicPackagePromotion, PublicPackagePromotionBuilder> {
  _$PublicPackagePromotion? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  PublicPackagePromotionDiscountTypeEnum? _discountType;
  PublicPackagePromotionDiscountTypeEnum? get discountType =>
      _$this._discountType;
  set discountType(PublicPackagePromotionDiscountTypeEnum? discountType) =>
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

  PublicPackagePromotionBuilder() {
    PublicPackagePromotion._defaults(this);
  }

  PublicPackagePromotionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _label = $v.label;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _discountRp = $v.discountRp;
      _promotionalPriceRp = $v.promotionalPriceRp;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicPackagePromotion other) {
    _$v = other as _$PublicPackagePromotion;
  }

  @override
  void update(void Function(PublicPackagePromotionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicPackagePromotion build() => _build();

  _$PublicPackagePromotion _build() {
    final _$result =
        _$v ??
        _$PublicPackagePromotion._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PublicPackagePromotion',
            'id',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PublicPackagePromotion',
            'name',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'PublicPackagePromotion',
            'label',
          ),
          discountType: BuiltValueNullFieldError.checkNotNull(
            discountType,
            r'PublicPackagePromotion',
            'discountType',
          ),
          discountValue: BuiltValueNullFieldError.checkNotNull(
            discountValue,
            r'PublicPackagePromotion',
            'discountValue',
          ),
          discountRp: BuiltValueNullFieldError.checkNotNull(
            discountRp,
            r'PublicPackagePromotion',
            'discountRp',
          ),
          promotionalPriceRp: BuiltValueNullFieldError.checkNotNull(
            promotionalPriceRp,
            r'PublicPackagePromotion',
            'promotionalPriceRp',
          ),
          activeFrom: BuiltValueNullFieldError.checkNotNull(
            activeFrom,
            r'PublicPackagePromotion',
            'activeFrom',
          ),
          activeUntil: BuiltValueNullFieldError.checkNotNull(
            activeUntil,
            r'PublicPackagePromotion',
            'activeUntil',
          ),
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'PublicPackagePromotion',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
