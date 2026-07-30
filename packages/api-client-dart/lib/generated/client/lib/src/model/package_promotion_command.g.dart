// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_promotion_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PackagePromotionCommandDiscountTypeEnum
_$packagePromotionCommandDiscountTypeEnum_PERCENTAGE =
    const PackagePromotionCommandDiscountTypeEnum._('PERCENTAGE');
const PackagePromotionCommandDiscountTypeEnum
_$packagePromotionCommandDiscountTypeEnum_FIXED_AMOUNT =
    const PackagePromotionCommandDiscountTypeEnum._('FIXED_AMOUNT');

PackagePromotionCommandDiscountTypeEnum
_$packagePromotionCommandDiscountTypeEnumValueOf(String name) {
  switch (name) {
    case 'PERCENTAGE':
      return _$packagePromotionCommandDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$packagePromotionCommandDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PackagePromotionCommandDiscountTypeEnum>
_$packagePromotionCommandDiscountTypeEnumValues =
    BuiltSet<PackagePromotionCommandDiscountTypeEnum>(
      const <PackagePromotionCommandDiscountTypeEnum>[
        _$packagePromotionCommandDiscountTypeEnum_PERCENTAGE,
        _$packagePromotionCommandDiscountTypeEnum_FIXED_AMOUNT,
      ],
    );

Serializer<PackagePromotionCommandDiscountTypeEnum>
_$packagePromotionCommandDiscountTypeEnumSerializer =
    _$PackagePromotionCommandDiscountTypeEnumSerializer();

class _$PackagePromotionCommandDiscountTypeEnumSerializer
    implements PrimitiveSerializer<PackagePromotionCommandDiscountTypeEnum> {
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
    PackagePromotionCommandDiscountTypeEnum,
  ];
  @override
  final String wireName = 'PackagePromotionCommandDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionCommandDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PackagePromotionCommandDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PackagePromotionCommandDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

abstract mixin class PackagePromotionCommandBuilder {
  void replace(PackagePromotionCommand other);
  void update(void Function(PackagePromotionCommandBuilder) updates);
  String? get name;
  set name(String? name);

  String? get label;
  set label(String? label);

  PackagePromotionCommandDiscountTypeEnum? get discountType;
  set discountType(PackagePromotionCommandDiscountTypeEnum? discountType);

  int? get discountValue;
  set discountValue(int? discountValue);

  DateTime? get activeFrom;
  set activeFrom(DateTime? activeFrom);

  DateTime? get activeUntil;
  set activeUntil(DateTime? activeUntil);

  String? get reason;
  set reason(String? reason);
}

class _$$PackagePromotionCommand extends $PackagePromotionCommand {
  @override
  final String name;
  @override
  final String label;
  @override
  final PackagePromotionCommandDiscountTypeEnum discountType;
  @override
  final int discountValue;
  @override
  final DateTime activeFrom;
  @override
  final DateTime activeUntil;
  @override
  final String reason;

  factory _$$PackagePromotionCommand([
    void Function($PackagePromotionCommandBuilder)? updates,
  ]) => ($PackagePromotionCommandBuilder()..update(updates))._build();

  _$$PackagePromotionCommand._({
    required this.name,
    required this.label,
    required this.discountType,
    required this.discountValue,
    required this.activeFrom,
    required this.activeUntil,
    required this.reason,
  }) : super._();
  @override
  $PackagePromotionCommand rebuild(
    void Function($PackagePromotionCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  $PackagePromotionCommandBuilder toBuilder() =>
      $PackagePromotionCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $PackagePromotionCommand &&
        name == other.name &&
        label == other.label &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$PackagePromotionCommand')
          ..add('name', name)
          ..add('label', label)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('reason', reason))
        .toString();
  }
}

class $PackagePromotionCommandBuilder
    implements
        Builder<$PackagePromotionCommand, $PackagePromotionCommandBuilder>,
        PackagePromotionCommandBuilder {
  _$$PackagePromotionCommand? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  String? _label;
  String? get label => _$this._label;
  set label(covariant String? label) => _$this._label = label;

  PackagePromotionCommandDiscountTypeEnum? _discountType;
  PackagePromotionCommandDiscountTypeEnum? get discountType =>
      _$this._discountType;
  set discountType(
    covariant PackagePromotionCommandDiscountTypeEnum? discountType,
  ) => _$this._discountType = discountType;

  int? _discountValue;
  int? get discountValue => _$this._discountValue;
  set discountValue(covariant int? discountValue) =>
      _$this._discountValue = discountValue;

  DateTime? _activeFrom;
  DateTime? get activeFrom => _$this._activeFrom;
  set activeFrom(covariant DateTime? activeFrom) =>
      _$this._activeFrom = activeFrom;

  DateTime? _activeUntil;
  DateTime? get activeUntil => _$this._activeUntil;
  set activeUntil(covariant DateTime? activeUntil) =>
      _$this._activeUntil = activeUntil;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(covariant String? reason) => _$this._reason = reason;

  $PackagePromotionCommandBuilder() {
    $PackagePromotionCommand._defaults(this);
  }

  $PackagePromotionCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _label = $v.label;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $PackagePromotionCommand other) {
    _$v = other as _$$PackagePromotionCommand;
  }

  @override
  void update(void Function($PackagePromotionCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $PackagePromotionCommand build() => _build();

  _$$PackagePromotionCommand _build() {
    final _$result =
        _$v ??
        _$$PackagePromotionCommand._(
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'$PackagePromotionCommand',
            'name',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'$PackagePromotionCommand',
            'label',
          ),
          discountType: BuiltValueNullFieldError.checkNotNull(
            discountType,
            r'$PackagePromotionCommand',
            'discountType',
          ),
          discountValue: BuiltValueNullFieldError.checkNotNull(
            discountValue,
            r'$PackagePromotionCommand',
            'discountValue',
          ),
          activeFrom: BuiltValueNullFieldError.checkNotNull(
            activeFrom,
            r'$PackagePromotionCommand',
            'activeFrom',
          ),
          activeUntil: BuiltValueNullFieldError.checkNotNull(
            activeUntil,
            r'$PackagePromotionCommand',
            'activeUntil',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'$PackagePromotionCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
